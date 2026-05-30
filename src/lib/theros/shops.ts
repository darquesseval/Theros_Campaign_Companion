import raw from "@/data/shop.json";
import theros from "@/data/theros-items.json";
import { rarityFromCostCp, type Rarity } from "./rarity";
import { pickMany, roll } from "./random";

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  cost: { normal: string; cheap: string; expensive: string };
  cost_cp: { normal: number; cheap: number; expensive: number };
  limitedStock: boolean;
  ruralLocale: boolean;
  urbanLocale: boolean;
  premiumLocale: boolean;
  tags: string[];
  description?: string;
}

export const ALL_ITEMS = [...(raw as ShopItem[]), ...(theros as ShopItem[])];

export interface ShopType {
  id: string;
  label: string;
  vendors: string[];
}

export const SHOP_TYPES: ShopType[] = [
  { id: "blacksmith", label: "Blacksmith & Armory", vendors: ["blacksmith_armory"] },
  { id: "fletcher", label: "Fletcher & Bowyer", vendors: ["fletcher_bowyer"] },
  { id: "leatherworker", label: "Leatherworker", vendors: ["leatherworker", "special_materials_leather_armor_pieces"] },
  { id: "general", label: "General Store", vendors: ["general_store", "adventuring_supplies"] },
  { id: "magical", label: "Arcane Emporium", vendors: ["arcane_shop", "adventuring_supplies_magical_theme"] },
  { id: "potions", label: "Apothecary", vendors: ["potion_shop"] },
  { id: "jeweler", label: "Jeweler & Stonecutter", vendors: ["jeweler_stonecutter"] },
  { id: "tailor", label: "Tailor & Textiles", vendors: ["tailor_textiles", "high_end_clothing"] },
  { id: "market", label: "Market & Produce", vendors: ["market_produce_foods"] },
  { id: "food", label: "Food Stall & Provisioner", vendors: ["food_market"] },
  { id: "transport", label: "Stables & Transport", vendors: ["transportation"] },
  { id: "falconry", label: "Falconry", vendors: ["falconry"] },
  { id: "inn", label: "Inn & Tavern", vendors: ["common_meal_inn_prices"] },
  { id: "temple", label: "Temple Supplies", vendors: ["temple_faith_supplies"] },
  { id: "tattoo", label: "Tattoo Parlor", vendors: ["tattoo_shop_inks", "tattoo_availability"] },
  { id: "shady", label: "Shady Dealer", vendors: ["shady_dealer_theme"] },
  { id: "art", label: "Art & Games", vendors: ["art_and_games_theme"] },
  { id: "books", label: "Scribe & Books", vendors: ["book_prices"] },
  { id: "waterside", label: "Waterside Outfitter", vendors: ["adventuring_supplies_water_side_theme"] },
  { id: "crafting", label: "Crafting Materials", vendors: ["special_crafting_materials"] },
];

export type ShopSize = "small" | "medium" | "large";
export type ShopLocale = "rural" | "urban" | "premium";

export interface ShopTypeMix {
  id: string;
  weight: number; // 1..5
}

export interface ShopOptions {
  types: ShopTypeMix[];
  size: ShopSize;
  locale: ShopLocale;
  seed?: number;
}

export interface GeneratedShopItem extends ShopItem {
  rarity: Rarity;
  stock: number;
  priceTier: "cheap" | "normal" | "expensive";
  shopTypeId: string;
  shopTypeLabel: string;
}

const SIZE_TARGETS: Record<ShopSize, Record<Rarity, [number, number]>> = {
  small:  { common: [4, 7],   uncommon: [1, 3], rare: [0, 1], "very-rare": [0, 0], legendary: [0, 0] },
  medium: { common: [9, 14],  uncommon: [4, 7], rare: [1, 3], "very-rare": [0, 1], legendary: [0, 0] },
  large:  { common: [12, 18], uncommon: [6, 10], rare: [3, 5], "very-rare": [1, 2], legendary: [0, 1] },
};

function generateForType(
  type: ShopType,
  size: ShopSize,
  locale: ShopLocale,
  scale: number,
): GeneratedShopItem[] {
  const localeKey =
    locale === "rural" ? "ruralLocale" : locale === "urban" ? "urbanLocale" : "premiumLocale";
  const priceTier: "cheap" | "normal" | "expensive" =
    locale === "rural" ? "cheap" : locale === "premium" ? "expensive" : "normal";

  const pool = ALL_ITEMS.filter(
    (i) =>
      type.vendors.includes(i.vendor) &&
      (i as unknown as Record<string, unknown>)[localeKey] === true &&
      i.cost_cp && typeof i.cost_cp.normal === "number",
  ).map((i) => ({ ...i, rarity: rarityFromCostCp(i.cost_cp.normal) }));

  const buckets: Record<Rarity, (ShopItem & { rarity: Rarity })[]> = {
    common: [], uncommon: [], rare: [], "very-rare": [], legendary: [],
  };
  for (const item of pool) buckets[item.rarity].push(item);

  const localeMod = locale === "premium" ? 1 : locale === "rural" ? -1 : 0;

  const out: GeneratedShopItem[] = [];
  (Object.keys(buckets) as Rarity[]).forEach((r) => {
    const [lo, hi] = SIZE_TARGETS[size][r];
    let count = lo + Math.floor(Math.random() * (hi - lo + 1));
    if (r === "rare" || r === "very-rare" || r === "legendary") count = Math.max(0, count + localeMod);
    if (r === "common" && localeMod < 0) count += 2;
    count = Math.max(0, Math.round(count * scale));

    let picked: (ShopItem & { rarity: Rarity })[];
    if (size === "large" && r === "common" && scale >= 0.66) {
      picked = buckets[r];
    } else {
      picked = pickMany(buckets[r], count);
    }
    for (const p of picked) {
      out.push({
        ...p,
        stock: p.limitedStock ? roll(3) : roll(6) + 2,
        priceTier,
        shopTypeId: type.id,
        shopTypeLabel: type.label,
      });
    }
  });
  return out;
}

export function generateShop(opts: ShopOptions): GeneratedShopItem[] {
  const active = opts.types.filter((t) => t.weight > 0);
  if (active.length === 0) return [];
  const totalWeight = active.reduce((s, t) => s + t.weight, 0);

  const out: GeneratedShopItem[] = [];
  const seen = new Set<string>();
  for (const t of active) {
    const type = SHOP_TYPES.find((x) => x.id === t.id);
    if (!type) continue;
    // share = weight/total, but min 0.25 so a niche shop still shows something
    const share = Math.max(0.25, t.weight / totalWeight) * Math.min(active.length, 2);
    for (const it of generateForType(type, opts.size, opts.locale, share)) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      out.push(it);
    }
  }
  return out;
}
