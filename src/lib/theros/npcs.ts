import { pick, pickMany } from "./random";

export type Race =
  | "Human"
  | "Leonin"
  | "Centaur"
  | "Minotaur"
  | "Triton"
  | "Satyr"
  | "Tiefling"
  | "Elf"
  | "Returned";

interface NameSet { male: string[]; female: string[]; neutral?: string[]; surnames?: string[] }

export const NAMES: Record<Race, NameSet> = {
  Human: {
    male: ["Adros","Akros","Brontes","Calix","Damian","Eron","Galen","Hektor","Iason","Kallias","Linos","Myron","Nikon","Orion","Petros","Stavros","Theron","Vasilis","Xanthos","Zenon"],
    female: ["Althaea","Berenike","Chryseis","Daphne","Elara","Galene","Helia","Iolanthe","Kalliope","Leda","Melia","Nyssa","Phaidra","Rhea","Selene","Thalia","Xanthe","Zoe"],
    surnames: ["of Akros","of Meletis","of Setessa","of Asphodel","Stormborn","Sunhallowed","Sea-Touched","Polis-Born"],
  },
  Leonin: {
    male: ["Brimaz","Ajani","Kemba","Raksha","Tirias","Pharsalus","Rharo","Suresh","Jazal","Mowu"],
    female: ["Nasari","Lisette","Khorvath","Tanari","Selah","Mythri","Lirah","Yenneka"],
    surnames: ["of Oreskos","Sunmane","Pridestrider","Goldfang","Skyhunter"],
  },
  Centaur: {
    male: ["Anthousa","Klymenos","Pheres","Nessus","Chiron","Eurytus","Hylonome","Pholos"],
    female: ["Aiantha","Eulia","Korystia","Penthia","Thelxiope","Xanthippe"],
    surnames: ["of the Lampad Glade","Stormhoof","of Karametra","Thicketrunner","Greenstride"],
  },
  Minotaur: {
    male: ["Kragma","Tymaret","Voltaak","Brakhul","Drogoskos","Mogis-Touched","Karth","Vorgath"],
    female: ["Aklara","Selukha","Tharaka","Ymora","Brakara"],
    surnames: ["of the Crimson Foothills","Skullsmasher","Bloodhorn","of Mogis","Ashen-Hide"],
  },
  Triton: {
    male: ["Thrasios","Kydoros","Phaeris","Nelios","Murranos","Phorkys"],
    female: ["Thessia","Kallia","Nereia","Phorea","Athanae","Selephia"],
    surnames: ["of the Deep Shoals","Thassa-Spoken","Pearlborn","Reefweaver","Tidewalker"],
  },
  Satyr: {
    male: ["Anthousios","Bricolus","Damosthes","Iroas-Drunk","Kynnos","Olethros","Pheres","Renata","Solon","Xenagos"],
    female: ["Anthousa","Brimea","Daphnis","Hesperia","Kynna","Lykia","Olethria","Phaedra","Renia","Sileia"],
    surnames: ["the Reveler","Wineblood","of the Skola Vale","Hoof-Light","Mirthsong"],
  },
  Tiefling: {
    male: ["Akros","Asphodel","Ebrios","Karthos","Mogiskar","Phorkyn","Skotos","Vrenn"],
    female: ["Anastrais","Ebonia","Mogira","Nyxia","Phorsia","Skotia","Vrenna"],
    surnames: ["the Shunned","Erebos-Marked","Underworld-Born","Ash-Touched"],
  },
  Elf: {
    male: ["Aelar","Caelum","Faelar","Heian","Korith","Nymeris","Quarion","Theren","Varis"],
    female: ["Aelirenn","Caelynn","Drusilia","Faelyn","Ielenia","Lia","Mialee","Naivara","Sylphae","Theirastra"],
    surnames: ["Greenleaf","of Nylea's Grove","Moonwhisper","Starwhisper","Dawnstrider"],
  },
  Returned: {
    male: ["The One Once Known","The Pale Sorrow","Husk-of-Akros","The Veiled","The Forgotten Hoplite"],
    female: ["The Quiet Weeper","Veil-of-Ash","The Nameless Lady","She-Who-Was","The Hollow Bride"],
    surnames: ["(Returned)","(Asphodel-Bound)","(Memory-Lost)"],
  },
};

const PERSONALITIES = [
  "Boastful, always invoking the names of dead heroes.",
  "Soft-spoken, weighed by an old oath to a forgotten god.",
  "Brash and reckless — drinks the wine of three mortals.",
  "Calculating; counts every coin and every favor owed.",
  "Mystic; speaks in oracles and half-remembered dreams.",
  "Loyal to the death, but only to one chosen friend.",
  "Hot-tempered, quick to draw bronze.",
  "Cheerful, tells stories from the polis nightly.",
  "Mournful; lost a loved one to the Returned.",
  "Curious about the stars and the constellations of Nyx.",
  "Pious to the point of fanaticism for one god.",
  "Pragmatic and cynical about the gods entirely.",
  "Hopeful, believes destiny shapes every step.",
  "Suspicious of foreigners and planeswalkers.",
  "Generous with food and shelter, miserly with secrets.",
];

const LOOKS = [
  "Sun-bronzed skin and a single silver torc at the throat.",
  "Robes dyed seafoam green, sandals worn to the bone.",
  "A scar shaped like a lightning bolt across one cheek — Keranos's mark.",
  "Hair braided with olive leaves and small bronze coins.",
  "One eye milky white, blinded by a god's vision.",
  "Wears a bronze breastplate dented in three places.",
  "A laurel tattoo coiling down one forearm.",
  "Smells of myrrh and wine; fingers stained with ink.",
  "Carries a cracked oracle's mask on a leather strap.",
  "Wears a chiton patched with mismatched cloth.",
  "Tall and gaunt; eyes the color of storm clouds.",
  "Short and powerfully built; calloused hands of a stonecutter.",
  "Hair stark white though the face is young — Nyx-touched.",
  "Carries a small clay cup of poured libation at the belt.",
];

const QUIRKS = [
  "Whistles a Thracian funeral hymn when nervous.",
  "Refuses to step on cracks — it offends the underworld.",
  "Pours a drop of every drink to the floor for the gods.",
  "Counts beads on a worn string between sentences.",
  "Wears mismatched sandals and never explains why.",
  "Always knows the exact phase of the moon.",
  "Claims to have spoken with a god, once. Will not say which.",
];

export interface NPC {
  name: string;
  race: Race;
  gender: "male" | "female";
  pronouns: string;
  personality: string;
  appearance: string;
  quirk: string;
}

export function generateNPC(race: Race, gender?: "male" | "female"): NPC {
  const g = gender ?? (Math.random() < 0.5 ? "male" : "female");
  const set = NAMES[race];
  const base = pick(set[g]);
  const sur = set.surnames ? pick(set.surnames) : "";
  const name = sur ? `${base} ${sur}` : base;
  return {
    name,
    race,
    gender: g,
    pronouns: g === "male" ? "he/him" : "she/her",
    personality: pick(PERSONALITIES),
    appearance: pick(LOOKS),
    quirk: pick(QUIRKS),
  };
}

export function generateParty(race: Race, n: number): NPC[] {
  const out: NPC[] = [];
  const used = new Set<string>();
  let tries = 0;
  while (out.length < n && tries < n * 20) {
    const npc = generateNPC(race);
    if (!used.has(npc.name)) { used.add(npc.name); out.push(npc); }
    tries++;
  }
  return out;
}

// re-export for unused warning suppression
export const _u = pickMany;
