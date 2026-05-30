import data from "@/data/encounters.json";
import { chance } from "./random";

const tables = data as Record<Biome, string[]>;

export type Biome = "forest" | "roads" | "sea" | "polis" | "villages";

export interface EncounterResult {
  occurred: boolean;
  biome: Biome;
  index?: number;
  text?: string;
  isCombat?: boolean;
  partyLevel?: number;
  tags?: ThreatTag[];
  advice?: string[];
}

// Tag-based classifier ported from Random_Encounter_in_Theros.html
type ThreatTag =
  | "boss"
  | "bandits"
  | "undead_group"
  | "tough_combat"
  | "swarm_skirmish"
  | "hazard"
  | "social";

const THREAT_MAP: { keys: string[]; tag: ThreatTag }[] = [
  { tag: "boss", keys: ["hydra", "purple worm", "adult green dragon", "bronze dragon", "young bronze dragon", "young kraken", "kraken", "leviathan", "storm giant", "roc", "basilisk", "chimera", "sphinx", "gorgon", "medusa", "nightmare", "manticore", "owlbear", "treant", "green dragon", "sea serpent"] },
  { tag: "bandits", keys: ["bandit", "bandits", "bandit captain", "thieves", "pirate", "pirates", "raiders", "mercenaries", "thug", "thugs", "assassin", "cult fanatic", "cultists", "sahuagin"] },
  { tag: "undead_group", keys: ["returned", "zombie", "skeleton", "specter", "wight", "ghoul", "banshee", "ghost"] },
  { tag: "tough_combat", keys: ["giant wolf", "dire wolf", "dire wolves", "giant spiders", "giant bats", "giant crabs", "giant rats", "giant frogs", "giant scorpions", "ankheg", "minotaur", "cyclops", "giant ape", "harpies", "harpy", "ogre", "merrow", "giant shark", "giant octopus", "giant constrictor", "veteran", "gladiator", "water elemental", "air elemental", "magma mephit", "peryton", "perytons"] },
  { tag: "swarm_skirmish", keys: ["swarm", "stirge", "wasp", "wasps", "beetle", "beetles", "wolf spiders", "stirges", "rats", "flying snakes", "quippers", "reef sharks", "hunter sharks", "jackals", "wolves"] },
  { tag: "hazard", keys: ["mimic", "trap", "quicksand", "quickmud", "earthquake", "wildfire", "flood", "storm", "dust storm", "poisonous", "plague", "curse", "whirlpool", "riptide", "shipwreck", "drowning", "tidal wave", "squall", "fire breaks out", "fire has destroyed"] },
  { tag: "social", keys: ["oracle", "priest", "priestess", "unicorn", "centaur", "satyr", "bard", "merchant", "druid", "naiad", "nymph", "nereid", "pegasus", "avatar", "philosopher", "magistrate", "elder", "festival", "wedding", "child", "children", "monk", "noble", "patron", "hierophant", "tinker"] },
];

export function classify(text: string): ThreatTag[] {
  const t = text.toLowerCase();
  const out = new Set<ThreatTag>();
  for (const m of THREAT_MAP) {
    for (const k of m.keys) {
      if (t.includes(k)) { out.add(m.tag); break; }
    }
  }
  return Array.from(out);
}

export function adviceFor(tags: ThreatTag[], level: number): string[] {
  const lvl = Math.max(1, Math.min(20, level));
  const low = lvl <= 4;
  const mid = lvl >= 5 && lvl <= 10;
  const adv: string[] = [];

  if (tags.includes("boss")) {
    if (low) adv.push("Boss creature: convert to a smaller/juvenile variant, or run it as a non-combat / chase scene.");
    else if (mid) adv.push("Boss creature: use a weaker stat block, reduce legendary actions or number of heads.");
    else adv.push("Boss creature: full stat block. Consider lair effects or minions for drama.");
  }
  if (tags.includes("bandits")) {
    if (low) adv.push("Bandits: halve the number, or use the weaker bandit profile (CR 1/4–1).");
    else adv.push("Bandits: numbers as written, or add a bandit captain to raise difficulty.");
  }
  if (tags.includes("undead_group")) {
    if (low) adv.push("Undead group: reduce numbers, or swap in weaker undead. Avoid multiattackers.");
    else adv.push("Undead group: numbers as written work for a tense group fight.");
  }
  if (tags.includes("tough_combat")) {
    if (low) adv.push("Tough creatures: reduce count, or swap to a weaker variant (CR 1–3).");
    else adv.push("Tough creatures: keep as written, or bump HP/damage slightly for challenge.");
  }
  if (tags.includes("swarm_skirmish")) {
    adv.push(low
      ? "Swarm/skirmish: cut counts roughly in half so the fight stays short."
      : "Swarm/skirmish: good short fight. Increase counts at higher levels.");
  }
  if (tags.includes("hazard")) {
    adv.push(low
      ? "Hazard: lower DCs (DC 10–12), shorten duration, halve damage for low-level parties."
      : "Hazard: standard DCs (13–16). Scale damage to roughly 1d6 per tier.");
  }
  if (tags.includes("social")) {
    adv.push("Social encounter: no combat scaling needed. Scale any rewards or boons to party level.");
  }
  if (adv.length === 0) {
    adv.push("No specific threat tags found — run as written and adjust if it feels too easy or too hard.");
  }
  return adv;
}

const COMBAT_TAGS: ThreatTag[] = ["boss", "bandits", "undead_group", "tough_combat", "swarm_skirmish"];

export interface RollOptions {
  biome: Biome;
  probability: number;
  partyLevel: number;
}

export function rollEncounter(opts: RollOptions): EncounterResult {
  if (!chance(opts.probability)) return { occurred: false, biome: opts.biome };
  const list = tables[opts.biome];
  const i = Math.floor(Math.random() * list.length);
  const text = list[i];
  const tags = classify(text);
  const isCombat = tags.some((t) => COMBAT_TAGS.includes(t));
  return {
    occurred: true,
    biome: opts.biome,
    index: i,
    text,
    isCombat,
    partyLevel: opts.partyLevel,
    tags,
    advice: adviceFor(tags, opts.partyLevel),
  };
}

export const BIOME_LABEL: Record<Biome, string> = {
  forest: "Forest of Theros",
  roads: "Roads & Plains",
  sea: "Sea & Coast",
  polis: "Polis (City)",
  villages: "Village & Hamlet",
};
