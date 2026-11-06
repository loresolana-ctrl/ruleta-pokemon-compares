export type Rarity = 'common' | 'uncommon' | 'rare' | 'rare-holo' | 'ultra-rare' | 'secret-rare';

export type PokemonCard = {
  name: string;
  type: string;
  rarity: Rarity;
  emoji: string;
  hp: number;
};

export type PackType = {
  id: number;
  name: string;
  shortName: string;
  color: string;
  accentColor: string;
  emoji: string;
  year: string;
};

export type BonusType = {
  id: number;
  name: string;
  description: string;
  emoji: string;
  color: string;
  effect: 'double_cards' | 'all_holo' | 'extra_ultra' | 'random_pack' | 'none';
};

export const PACK_TYPES: PackType[] = [
  { id: 0, name: "Base Set", shortName: "Base", color: "#CC2200", accentColor: "#FFD700", emoji: "🎴", year: "1999" },
  { id: 1, name: "Jungle", shortName: "Jungle", color: "#2D6A1F", accentColor: "#ADFF2F", emoji: "🌿", year: "1999" },
  { id: 2, name: "Fossil", shortName: "Fossil", color: "#7B6B4E", accentColor: "#C8C8C8", emoji: "🦕", year: "1999" },
  { id: 3, name: "Team Rocket", shortName: "Rocket", color: "#1C1C2E", accentColor: "#FF3333", emoji: "💀", year: "2000" },
  { id: 4, name: "Neo Genesis", shortName: "Neo", color: "#4B0082", accentColor: "#DDA0DD", emoji: "⭐", year: "2000" },
  { id: 5, name: "EX Series", shortName: "EX", color: "#C45B00", accentColor: "#FFD166", emoji: "💎", year: "2003" },
  { id: 6, name: "Diamond & Pearl", shortName: "D&P", color: "#3B2F8C", accentColor: "#87CEEB", emoji: "💜", year: "2007" },
  { id: 7, name: "HeartGold SS", shortName: "HGSS", color: "#8B6914", accentColor: "#C0C0C0", emoji: "🌟", year: "2010" },
  { id: 8, name: "Black & White", shortName: "BW", color: "#2A2A2A", accentColor: "#DDDDDD", emoji: "⚫", year: "2011" },
  { id: 9, name: "XY Series", shortName: "XY", color: "#AA0000", accentColor: "#0033AA", emoji: "✖️", year: "2014" },
  { id: 10, name: "Sun & Moon", shortName: "SM", color: "#C06000", accentColor: "#0055CC", emoji: "🌺", year: "2017" },
  { id: 11, name: "Sword & Shield", shortName: "SwSh", color: "#0D47A1", accentColor: "#AD1457", emoji: "⚔️", year: "2020" },
  { id: 12, name: "Scarlet & Violet", shortName: "SV", color: "#7B1717", accentColor: "#6A1B9A", emoji: "🌸", year: "2023" },
  { id: 13, name: "30 Aniversario", shortName: "30th", color: "#8B6914", accentColor: "#FF8C00", emoji: "🏆", year: "2026" },
];

export const BONUS_TYPES: BonusType[] = [
  { id: 0, name: "¡Sin Bonus!", description: "Solo el sobre normal", emoji: "📦", color: "#6B7280", effect: "none" },
  { id: 1, name: "¡Doble Cartas!", description: "El doble de cartas en el sobre", emoji: "✌️", color: "#2563EB", effect: "double_cards" },
  { id: 2, name: "¡Todo Holográfico!", description: "Todas las cartas brillan", emoji: "✨", color: "#7C3AED", effect: "all_holo" },
  { id: 3, name: "¡Ultra Rara Garantizada!", description: "Una carta ultra rara segura", emoji: "🌟", color: "#D97706", effect: "extra_ultra" },
  { id: 4, name: "¡Sobre Sorpresa!", description: "Un sobre extra aleatorio", emoji: "🎁", color: "#DC2626", effect: "random_pack" },
];

const SECRET_RARES: PokemonCard[] = [
  { name: "Arceus VSTAR", type: "Normal", rarity: "secret-rare", emoji: "✨", hp: 240 },
  { name: "Charizard ex SAR", type: "Fire/Flying", rarity: "secret-rare", emoji: "🔥", hp: 330 },
  { name: "Pikachu SAR", type: "Electric", rarity: "secret-rare", emoji: "⚡", hp: 60 },
];

const ULTRA_RARES: PokemonCard[] = [
  { name: "Mewtwo V", type: "Psychic", rarity: "ultra-rare", emoji: "👾", hp: 200 },
  { name: "Mew VMAX", type: "Psychic", rarity: "ultra-rare", emoji: "💫", hp: 270 },
  { name: "Lugia VSTAR", type: "Psychic/Flying", rarity: "ultra-rare", emoji: "🕊️", hp: 240 },
  { name: "Ho-Oh V", type: "Fire/Flying", rarity: "ultra-rare", emoji: "🦜", hp: 220 },
  { name: "Rayquaza VMAX", type: "Dragon/Flying", rarity: "ultra-rare", emoji: "🐍", hp: 320 },
  { name: "Dialga VSTAR", type: "Steel/Dragon", rarity: "ultra-rare", emoji: "⌚", hp: 240 },
  { name: "Palkia VSTAR", type: "Water/Dragon", rarity: "ultra-rare", emoji: "🌌", hp: 240 },
  { name: "Giratina VSTAR", type: "Ghost/Dragon", rarity: "ultra-rare", emoji: "👁️", hp: 280 },
  { name: "Reshiram V", type: "Dragon/Fire", rarity: "ultra-rare", emoji: "⚪", hp: 200 },
  { name: "Zekrom V", type: "Dragon/Electric", rarity: "ultra-rare", emoji: "⚫", hp: 210 },
  { name: "Xerneas VSTAR", type: "Fairy", rarity: "ultra-rare", emoji: "🦌", hp: 260 },
  { name: "Solgaleo GX", type: "Psychic/Steel", rarity: "ultra-rare", emoji: "☀️", hp: 230 },
  { name: "Lunala GX", type: "Psychic/Ghost", rarity: "ultra-rare", emoji: "🌙", hp: 250 },
  { name: "Zacian V", type: "Fairy/Steel", rarity: "ultra-rare", emoji: "⚔️", hp: 220 },
  { name: "Koraidon ex", type: "Fighting/Dragon", rarity: "ultra-rare", emoji: "🏛️", hp: 320 },
  { name: "Miraidon ex", type: "Electric/Dragon", rarity: "ultra-rare", emoji: "🤖", hp: 340 },
];

const RARE_HOLOS: PokemonCard[] = [
  { name: "Charizard", type: "Fire/Flying", rarity: "rare-holo", emoji: "🔥", hp: 120 },
  { name: "Blastoise", type: "Water", rarity: "rare-holo", emoji: "🌊", hp: 100 },
  { name: "Venusaur", type: "Grass/Poison", rarity: "rare-holo", emoji: "🌿", hp: 100 },
  { name: "Pikachu", type: "Electric", rarity: "rare-holo", emoji: "⚡", hp: 60 },
  { name: "Gengar", type: "Ghost/Poison", rarity: "rare-holo", emoji: "👻", hp: 80 },
  { name: "Gyarados", type: "Water/Flying", rarity: "rare-holo", emoji: "🐉", hp: 130 },
  { name: "Lapras", type: "Water/Ice", rarity: "rare-holo", emoji: "❄️", hp: 130 },
  { name: "Dragonite", type: "Dragon/Flying", rarity: "rare-holo", emoji: "🐲", hp: 100 },
  { name: "Gardevoir", type: "Psychic/Fairy", rarity: "rare-holo", emoji: "💎", hp: 110 },
  { name: "Lucario", type: "Fighting/Steel", rarity: "rare-holo", emoji: "⭐", hp: 110 },
  { name: "Garchomp", type: "Dragon/Ground", rarity: "rare-holo", emoji: "🦈", hp: 140 },
  { name: "Sylveon", type: "Fairy", rarity: "rare-holo", emoji: "💕", hp: 100 },
  { name: "Umbreon", type: "Dark", rarity: "rare-holo", emoji: "🌙", hp: 110 },
  { name: "Greninja", type: "Water/Dark", rarity: "rare-holo", emoji: "💧", hp: 130 },
  { name: "Tyranitar", type: "Rock/Dark", rarity: "rare-holo", emoji: "🦖", hp: 140 },
  { name: "Flygon", type: "Ground/Dragon", rarity: "rare-holo", emoji: "🐛", hp: 100 },
  { name: "Espeon", type: "Psychic", rarity: "rare-holo", emoji: "🔮", hp: 100 },
  { name: "Togekiss", type: "Fairy/Flying", rarity: "rare-holo", emoji: "🕊️", hp: 120 },
  { name: "Alakazam", type: "Psychic", rarity: "rare-holo", emoji: "🥄", hp: 80 },
  { name: "Nidoking", type: "Poison/Ground", rarity: "rare-holo", emoji: "👑", hp: 90 },
];

const UNCOMMONS: PokemonCard[] = [
  { name: "Jolteon", type: "Electric", rarity: "uncommon", emoji: "⚡", hp: 70 },
  { name: "Vaporeon", type: "Water", rarity: "uncommon", emoji: "💧", hp: 80 },
  { name: "Flareon", type: "Fire", rarity: "uncommon", emoji: "🔥", hp: 70 },
  { name: "Raichu", type: "Electric", rarity: "uncommon", emoji: "⚡", hp: 80 },
  { name: "Arcanine", type: "Fire", rarity: "uncommon", emoji: "🐕", hp: 100 },
  { name: "Rapidash", type: "Fire", rarity: "uncommon", emoji: "🐎", hp: 80 },
  { name: "Slowbro", type: "Water/Psychic", rarity: "uncommon", emoji: "🧠", hp: 80 },
  { name: "Haunter", type: "Ghost/Poison", rarity: "uncommon", emoji: "👻", hp: 60 },
  { name: "Electabuzz", type: "Electric", rarity: "uncommon", emoji: "⚡", hp: 70 },
  { name: "Magmar", type: "Fire", rarity: "uncommon", emoji: "🔥", hp: 70 },
  { name: "Scyther", type: "Bug/Flying", rarity: "uncommon", emoji: "🗡️", hp: 70 },
  { name: "Starmie", type: "Water/Psychic", rarity: "uncommon", emoji: "⭐", hp: 60 },
  { name: "Tauros", type: "Normal", rarity: "uncommon", emoji: "🐂", hp: 60 },
  { name: "Meowth", type: "Normal", rarity: "uncommon", emoji: "🐱", hp: 50 },
  { name: "Kangaskhan", type: "Normal", rarity: "uncommon", emoji: "🦘", hp: 90 },
  { name: "Mr. Mime", type: "Psychic/Fairy", rarity: "uncommon", emoji: "🎭", hp: 50 },
  { name: "Chansey", type: "Normal", rarity: "uncommon", emoji: "🥚", hp: 120 },
  { name: "Hitmonlee", type: "Fighting", rarity: "uncommon", emoji: "🦵", hp: 60 },
  { name: "Hitmonchan", type: "Fighting", rarity: "uncommon", emoji: "🥊", hp: 70 },
  { name: "Lickitung", type: "Normal", rarity: "uncommon", emoji: "👅", hp: 80 },
];

const COMMONS: PokemonCard[] = [
  { name: "Bulbasaur", type: "Grass/Poison", rarity: "common", emoji: "🌱", hp: 45 },
  { name: "Charmander", type: "Fire", rarity: "common", emoji: "🦎", hp: 39 },
  { name: "Squirtle", type: "Water", rarity: "common", emoji: "🐢", hp: 44 },
  { name: "Caterpie", type: "Bug", rarity: "common", emoji: "🐛", hp: 45 },
  { name: "Pidgey", type: "Normal/Flying", rarity: "common", emoji: "🐦", hp: 40 },
  { name: "Rattata", type: "Normal", rarity: "common", emoji: "🐀", hp: 30 },
  { name: "Ekans", type: "Poison", rarity: "common", emoji: "🐍", hp: 35 },
  { name: "Jigglypuff", type: "Normal/Fairy", rarity: "common", emoji: "🎵", hp: 45 },
  { name: "Zubat", type: "Poison/Flying", rarity: "common", emoji: "🦇", hp: 40 },
  { name: "Oddish", type: "Grass/Poison", rarity: "common", emoji: "🌿", hp: 45 },
  { name: "Psyduck", type: "Water", rarity: "common", emoji: "🦆", hp: 50 },
  { name: "Geodude", type: "Rock/Ground", rarity: "common", emoji: "🪨", hp: 40 },
  { name: "Slowpoke", type: "Water/Psychic", rarity: "common", emoji: "🌀", hp: 90 },
  { name: "Magnemite", type: "Electric/Steel", rarity: "common", emoji: "🔩", hp: 25 },
  { name: "Seel", type: "Water", rarity: "common", emoji: "🦭", hp: 65 },
  { name: "Drowzee", type: "Psychic", rarity: "common", emoji: "🧠", hp: 60 },
  { name: "Krabby", type: "Water", rarity: "common", emoji: "🦀", hp: 30 },
  { name: "Cubone", type: "Ground", rarity: "common", emoji: "💀", hp: 50 },
  { name: "Rhyhorn", type: "Ground/Rock", rarity: "common", emoji: "🦏", hp: 80 },
  { name: "Staryu", type: "Water", rarity: "common", emoji: "⭐", hp: 30 },
  { name: "Chikorita", type: "Grass", rarity: "common", emoji: "🍀", hp: 45 },
  { name: "Cyndaquil", type: "Fire", rarity: "common", emoji: "🔥", hp: 39 },
  { name: "Totodile", type: "Water", rarity: "common", emoji: "🐊", hp: 50 },
  { name: "Treecko", type: "Grass", rarity: "common", emoji: "🦎", hp: 40 },
  { name: "Torchic", type: "Fire", rarity: "common", emoji: "🐔", hp: 45 },
  { name: "Mudkip", type: "Water", rarity: "common", emoji: "🌊", hp: 50 },
  { name: "Turtwig", type: "Grass", rarity: "common", emoji: "🐢", hp: 55 },
  { name: "Chimchar", type: "Fire", rarity: "common", emoji: "🐒", hp: 44 },
  { name: "Piplup", type: "Water", rarity: "common", emoji: "🐧", hp: 53 },
  { name: "Snivy", type: "Grass", rarity: "common", emoji: "🌿", hp: 45 },
  { name: "Tepig", type: "Fire", rarity: "common", emoji: "🐷", hp: 65 },
  { name: "Oshawott", type: "Water", rarity: "common", emoji: "🦦", hp: 55 },
  { name: "Chespin", type: "Grass", rarity: "common", emoji: "🌰", hp: 56 },
  { name: "Fennekin", type: "Fire", rarity: "common", emoji: "🦊", hp: 40 },
  { name: "Froakie", type: "Water", rarity: "common", emoji: "🐸", hp: 41 },
  { name: "Rowlet", type: "Grass/Flying", rarity: "common", emoji: "🦉", hp: 68 },
  { name: "Litten", type: "Fire", rarity: "common", emoji: "🐱", hp: 45 },
  { name: "Popplio", type: "Water", rarity: "common", emoji: "🦭", hp: 50 },
  { name: "Grookey", type: "Grass", rarity: "common", emoji: "🐵", hp: 50 },
  { name: "Scorbunny", type: "Fire", rarity: "common", emoji: "🐰", hp: 50 },
  { name: "Sobble", type: "Water", rarity: "common", emoji: "🦎", hp: 50 },
  { name: "Sprigatito", type: "Grass", rarity: "common", emoji: "🐈", hp: 40 },
  { name: "Fuecoco", type: "Fire", rarity: "common", emoji: "🐊", hp: 67 },
  { name: "Quaxly", type: "Water", rarity: "common", emoji: "🦆", hp: 55 },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePackCards(bonus?: BonusType): PokemonCard[] {
  const cards: PokemonCard[] = [];
  const isAllHolo = bonus?.effect === 'all_holo';
  const hasExtraUltra = bonus?.effect === 'extra_ultra';
  const isDouble = bonus?.effect === 'double_cards';

  const count = isDouble ? 2 : 1;

  for (let d = 0; d < count; d++) {
    for (let i = 0; i < 6; i++) {
      const card = { ...pickRandom(COMMONS) };
      if (isAllHolo) card.rarity = 'rare-holo';
      cards.push(card);
    }
    for (let i = 0; i < 3; i++) {
      const card = { ...pickRandom(UNCOMMONS) };
      if (isAllHolo) card.rarity = 'rare-holo';
      cards.push(card);
    }
    const roll = Math.random();
    if (roll < 0.08) {
      cards.push({ ...pickRandom(SECRET_RARES) });
    } else if (roll < 0.28) {
      cards.push({ ...pickRandom(ULTRA_RARES) });
    } else {
      const card = { ...pickRandom(RARE_HOLOS) };
      if (isAllHolo) card.rarity = 'rare-holo';
      cards.push(card);
    }
  }

  if (hasExtraUltra) {
    cards.push({ ...pickRandom(ULTRA_RARES) });
  }

  return cards;
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; border: string }> = {
  'common': { label: 'Común', color: '#6B7280', glow: 'shadow-gray-500/30', border: 'border-gray-500' },
  'uncommon': { label: 'Poco Común', color: '#2563EB', glow: 'shadow-blue-500/40', border: 'border-blue-500' },
  'rare': { label: 'Rara', color: '#16A34A', glow: 'shadow-green-500/40', border: 'border-green-500' },
  'rare-holo': { label: 'Rara Holográfica', color: '#9333EA', glow: 'shadow-purple-500/50', border: 'border-purple-500' },
  'ultra-rare': { label: 'Ultra Rara', color: '#D97706', glow: 'shadow-amber-500/60', border: 'border-amber-500' },
  'secret-rare': { label: 'Secreta ✨', color: '#EC4899', glow: 'shadow-pink-500/70', border: 'border-pink-500' },
};
