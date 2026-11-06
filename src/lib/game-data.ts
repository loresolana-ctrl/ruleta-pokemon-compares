export interface Pack {
  number: number;
  label: string;
  content: string;
  isOpened: boolean;
  openedOnSpin?: number;
}

export interface PriceOption {
  id: number;
  name: string;
  description: string;
  value: number; // price in pesos
  color: string;
  emoji: string;
}

export const PRICE_OPTIONS: PriceOption[] = [
  { id: 0, name: "$80",  description: "Ochenta pesos",          value: 80,  color: "#22C55E", emoji: "💚" },
  { id: 1, name: "$120", description: "Ciento veinte pesos",    value: 120, color: "#F59E0B", emoji: "💛" },
  { id: 2, name: "$140", description: "Ciento cuarenta pesos",  value: 140, color: "#EF4444", emoji: "❤️" },
];

export function createPacks(count: number): Pack[] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    label: `Sobre #${i + 1}`,
    content: "",
    isOpened: false,
  }));
}

export function getUnopenedPacks(packs: Pack[]): Pack[] {
  return packs.filter((p) => !p.isOpened);
}
