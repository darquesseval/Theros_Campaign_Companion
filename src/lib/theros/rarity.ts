export type Rarity = "common" | "uncommon" | "rare" | "very-rare" | "legendary";

export function rarityFromCostCp(cp: number): Rarity {
  if (cp < 5000) return "common";          // < 50 gp
  if (cp < 50000) return "uncommon";       // < 500 gp
  if (cp < 500000) return "rare";          // < 5 000 gp
  if (cp < 2500000) return "very-rare";    // < 25 000 gp
  return "legendary";
}

export const rarityLabel: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "very-rare": "Very Rare",
  legendary: "Legendary",
};

export const rarityColor: Record<Rarity, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  "very-rare": "text-rarity-very-rare",
  legendary: "text-rarity-legendary",
};

export const rarityBorder: Record<Rarity, string> = {
  common: "border-rarity-common/30",
  uncommon: "border-rarity-uncommon/50",
  rare: "border-rarity-rare/50",
  "very-rare": "border-rarity-very-rare/60",
  legendary: "border-rarity-legendary/70",
};
