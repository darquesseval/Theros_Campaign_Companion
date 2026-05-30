import { ALL_ITEMS, type ShopItem } from "./shops";
import { rarityFromCostCp, type Rarity } from "./rarity";
import { pick, pickMany, roll, chance } from "./random";

export type EncounterType = "noble" | "civil" | "enemy" | "monster" | "animal" | "nature";
export type EncounterSize = "small" | "medium" | "large";

export interface LootOptions {
  type: EncounterType;
  size: EncounterSize;
  level: number; // party level 1..20
}

export interface LootResult {
  gold: number;
  silver: number;
  copper: number;
  items: { name: string; rarity: Rarity; note?: string }[];
  flavor: string[];
}

const FLAVOR: Record<EncounterType, string[]> = {
  noble: [
    "A signet ring engraved with a polis crest.",
    "Silken sash dyed Meletian purple.",
    "Sealed scroll of debts owed to a noble house.",
    "Perfume vial of orange blossom and myrrh.",
    "A laurel circlet of beaten gold.",
  ],
  civil: [
    "A leather purse with a few worn coins.",
    "Iron house key on a braided cord.",
    "Half a loaf of olive bread, still warm.",
    "Wax tablet with a merchant's tally.",
    "A child's clay figurine of a hero.",
  ],
  enemy: [
    "A nicked bronze blade with dried blood.",
    "Tattered shield bearing a faded sigil.",
    "Strip of jerky and a stoppered wineskin.",
    "Crude map drawn in charcoal.",
    "Charm against the evil eye.",
  ],
  monster: [
    "A claw the size of a dagger.",
    "Bone shard humming faintly with Nyx-light.",
    "Patch of hide that resists flame.",
    "Glowing eye in a jar of brine.",
    "Tooth strung on a sinew cord.",
    "Cracked scale, still warm to the touch.",
    "Length of horn, useful for carving.",
  ],
  animal: [
    "Soft pelt, sellable for a few drachma.",
    "Pair of horns, good for carving.",
    "Pouch of musk glands (foul-smelling).",
    "Length of clean sinew.",
    "Edible meat — 1d4 days of rations.",
    "A fistful of glossy feathers.",
    "Cracked claws and teeth.",
  ],
  nature: [
    "A handful of moonpetal blossoms.",
    "Rare alchemical lichen from a cave wall.",
    "Spring water from a Thassa-touched pool.",
    "Resin from a sacred olive tree.",
    "Smooth river stones marked with ancient runes.",
  ],
};

// coin generation — animals & monsters carry no money
function baseCoinCp(opts: LootOptions): number {
  if (opts.type === "animal" || opts.type === "monster") return 0;
  const sizeMult = opts.size === "small" ? 1 : opts.size === "medium" ? 3 : 8;
  const typeMult: Record<EncounterType, number> = {
    noble: 8, civil: 1.5, enemy: 2, monster: 0, animal: 0, nature: 0.4,
  };
  const lvlMult = 1 + opts.level * 0.8;
  return Math.floor(50 * sizeMult * typeMult[opts.type] * lvlMult * (0.6 + Math.random() * 0.8));
}

const TYPE_RARITY_WEIGHTS: Record<EncounterType, Partial<Record<Rarity, number>>> = {
  noble:   { common: 2, uncommon: 4, rare: 3, "very-rare": 1, legendary: 0.2 },
  civil:   { common: 8, uncommon: 2, rare: 0.3 },
  enemy:   { common: 5, uncommon: 3, rare: 1 },
  monster: { common: 2, uncommon: 3, rare: 2, "very-rare": 0.7, legendary: 0.1 },
  animal:  { common: 6 },
  nature:  { common: 5, uncommon: 2, rare: 0.5 },
};

const TYPE_VENDORS: Record<EncounterType, string[]> = {
  noble: ["jeweler_stonecutter", "high_end_clothing", "arcane_shop", "art_and_games_theme", "tailor_textiles", "book_prices"],
  civil: ["general_store", "tailor_textiles", "market_produce_foods", "common_meal_inn_prices", "leatherworker"],
  enemy: ["blacksmith_armory", "fletcher_bowyer", "leatherworker", "adventuring_supplies", "potion_shop"],
  monster: ["arcane_shop", "potion_shop", "special_crafting_materials", "adventuring_supplies_magical_theme"],
  animal: ["market_produce_foods", "special_crafting_materials", "leatherworker"],
  nature: ["potion_shop", "special_crafting_materials", "temple_faith_supplies"],
};

// Probability that an item drops at all (per slot). Animals & monsters rarely drop crafted items.
const ITEM_DROP_CHANCE: Record<EncounterType, number> = {
  noble: 1, civil: 1, enemy: 1, monster: 0.2, animal: 0.1, nature: 1,
};

function weightedRarity(opts: LootOptions): Rarity {
  const weights = { ...TYPE_RARITY_WEIGHTS[opts.type] } as Record<Rarity, number>;
  const lvlBoost = opts.level / 20;
  weights.rare = (weights.rare ?? 0) + lvlBoost * 2;
  weights["very-rare"] = (weights["very-rare"] ?? 0) + lvlBoost * 1.5;
  weights.legendary = (weights.legendary ?? 0) + lvlBoost * 0.3;
  const entries = Object.entries(weights).filter(([, w]) => w > 0) as [Rarity, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) { if ((r -= w) <= 0) return k; }
  return "common";
}

export function generateLoot(opts: LootOptions): LootResult {
  const cp = baseCoinCp(opts);
  const gold = Math.floor(cp / 100);
  const silver = Math.floor((cp % 100) / 10);
  const copper = cp % 10;

  // Animals & monsters carry far fewer crafted items.
  const isBeast = opts.type === "animal" || opts.type === "monster";
  const baseCount = isBeast
    ? (opts.size === "large" ? 1 : 0)
    : (opts.size === "small" ? roll(2) : opts.size === "medium" ? roll(3) + 1 : roll(4) + 2);
  const itemCount = baseCount;

  const allowedVendors = TYPE_VENDORS[opts.type];
  const pool = ALL_ITEMS.filter(
    (i) => allowedVendors.includes(i.vendor) && i.cost_cp && typeof i.cost_cp.normal === "number",
  );
  const byRarity: Record<Rarity, ShopItem[]> = {
    common: [], uncommon: [], rare: [], "very-rare": [], legendary: [],
  };
  for (const it of pool) byRarity[rarityFromCostCp(it.cost_cp.normal)].push(it);

  const items: LootResult["items"] = [];
  for (let i = 0; i < itemCount; i++) {
    if (!chance(ITEM_DROP_CHANCE[opts.type])) continue;
    let r = weightedRarity(opts);
    let bucket = byRarity[r];
    let tries = 0;
    while (bucket.length === 0 && tries < 5) { r = "common"; bucket = byRarity[r]; tries++; }
    if (bucket.length === 0) continue;
    const it = pick(bucket);
    items.push({ name: it.name, rarity: r });
  }

  // More flavor for animals/monsters since that's mostly what they drop.
  const flavorCount = isBeast
    ? (opts.size === "small" ? 2 : opts.size === "medium" ? 3 : 4)
    : (opts.size === "small" ? 1 : opts.size === "medium" ? 2 : 3);
  const flavor = pickMany(FLAVOR[opts.type], Math.min(flavorCount, FLAVOR[opts.type].length));

  // Rare trophy chance for monsters (still no coins).
  if (opts.type === "monster" && chance(0.1 + opts.level * 0.015)) {
    const r: Rarity = chance(0.25) ? "very-rare" : "rare";
    const bucket = byRarity[r];
    if (bucket.length) items.push({ name: pick(bucket).name, rarity: r, note: "Rare trophy" });
  }
  if (opts.type === "noble" && chance(0.15 + opts.level * 0.02)) {
    const r: Rarity = chance(0.3) ? "very-rare" : "rare";
    const bucket = byRarity[r];
    if (bucket.length) items.push({ name: pick(bucket).name, rarity: r, note: "Hidden treasure" });
  }

  return { gold, silver, copper, items, flavor };
}
