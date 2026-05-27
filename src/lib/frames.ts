export type FrameStyle =
  | "aesthetic"
  | "vintage"
  | "ribbon"
  | "pearl"
  | "lace"
  | "flower"
  | "romantic"
  | "ticket"
  | "cute"
  | "elegant";

export interface FrameSlot {
  // normalized 0..1 coords inside the frame canvas
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameTemplate {
  id: string;
  name: string;
  style: FrameStyle;
  count: 3 | 4;
  // canvas dimensions (px) at design time
  width: number;
  height: number;
  bg: string; // CSS background (gradient or solid)
  accent: string; // border/decor color
  decor:
    | "ribbon"
    | "pearl"
    | "lace"
    | "flower"
    | "special-day"
    | "movie-ticket"
    | "kawaii-pop"
    | "aesthetic-notes"
    | "elegant-noir"
    | "coquette-pearl"
    | "lace-rose-deluxe"
    | "flower-garden-deluxe"
    | "romantic-rouge-deluxe"
    | "romantic-blush-deluxe"
    | "none";
  caption: string;
  slots: FrameSlot[];
}

// Standard strip canvas: 600 x 1600 with photos stacked.
const makeStrip = (count: 3 | 4): FrameSlot[] => {
  const padX = 0.08;
  const top = count === 3 ? 0.08 : 0.06;
  const bottom = 0.18; // room for caption
  const gap = 0.025;
  const usable = 1 - top - bottom - gap * (count - 1);
  const h = usable / count;
  return Array.from({ length: count }, (_, i) => ({
    x: padX,
    y: top + i * (h + gap),
    w: 1 - padX * 2,
    h,
  }));
};

const specialDayStrip = (): FrameSlot[] => [
  { x: 0.12, y: 0.18, w: 0.76, h: 0.19 },
  { x: 0.12, y: 0.405, w: 0.76, h: 0.19 },
  { x: 0.12, y: 0.63, w: 0.76, h: 0.19 },
];

const movieTicketStrip = (): FrameSlot[] => [
  { x: 0.12, y: 0.17, w: 0.76, h: 0.18 },
  { x: 0.12, y: 0.375, w: 0.76, h: 0.18 },
  { x: 0.12, y: 0.58, w: 0.76, h: 0.18 },
  { x: 0.12, y: 0.785, w: 0.76, h: 0.16 },
];

const tallHeaderStrip = (count: 3 | 4): FrameSlot[] => {
  const padX = 0.11;
  const top = count === 3 ? 0.18 : 0.16;
  const bottom = count === 3 ? 0.14 : 0.1;
  const gap = count === 3 ? 0.035 : 0.025;
  const usable = 1 - top - bottom - gap * (count - 1);
  const h = usable / count;

  return Array.from({ length: count }, (_, i) => ({
    x: padX,
    y: top + i * (h + gap),
    w: 1 - padX * 2,
    h,
  }));
};

const elegantNoirStrip = (): FrameSlot[] => [
  { x: 0.115, y: 0.13, w: 0.77, h: 0.23 },
  { x: 0.115, y: 0.395, w: 0.77, h: 0.23 },
  { x: 0.115, y: 0.66, w: 0.77, h: 0.23 },
];

export const FRAMES: FrameTemplate[] = [
  {
    id: "aesthetic-3",
    name: "Aesthetic Cream",
    style: "aesthetic",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fbf6ef 0%, #f3e7d8 100%)",
    accent: "#6b2a2a",
    decor: "none",
    caption: "moments · 2026",
    slots: makeStrip(3),
  },
  {
    id: "vintage-4",
    name: "Vintage Maroon",
    style: "vintage",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #5a1f1f 0%, #3b1414 100%)",
    accent: "#f0d9b5",
    decor: "none",
    caption: "remember when",
    slots: makeStrip(4),
  },
  {
    id: "ribbon-3",
    name: "Ribbon Blush",
    style: "ribbon",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fde7ed 0%, #f6c8d2 100%)",
    accent: "#b34a5e",
    decor: "ribbon",
    caption: "with love",
    slots: makeStrip(3),
  },
  {
    id: "pearl-4",
    name: "Pearl Ivory",
    style: "pearl",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fffaf3 0%, #f4ead8 100%)",
    accent: "#7a5a3a",
    decor: "pearl",
    caption: "softly yours",
    slots: makeStrip(4),
  },
  {
    id: "lace-3",
    name: "Lace Rose",
    style: "lace",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fff7fb 0%, #eaf3ff 100%)",
    accent: "#9a4f78",
    decor: "lace-rose-deluxe",
    caption: "dreamy lace",
    slots: makeStrip(3),
  },
  {
    id: "flower-4",
    name: "Flower Garden",
    style: "flower",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #ecf8ea 0%, #fff2c8 100%)",
    accent: "#3f7a56",
    decor: "flower-garden-deluxe",
    caption: "garden party",
    slots: makeStrip(4),
  },
  {
    id: "romantic-3",
    name: "Romantic Rouge",
    style: "romantic",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #24030c 0%, #7a102b 100%)",
    accent: "#ffd2dd",
    decor: "romantic-rouge-deluxe",
    caption: "midnight romance",
    slots: makeStrip(3),
  },
  {
    id: "romantic-4",
    name: "Romantic Blush",
    style: "romantic",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fff2f6 0%, #ffd4df 100%)",
    accent: "#b54870",
    decor: "romantic-blush-deluxe",
    caption: "love letters",
    slots: makeStrip(4),
  },
  {
    id: "special-day-ticket-3",
    name: "Special Day Ticket",
    style: "ticket",
    count: 3,
    width: 600,
    height: 1600,
    bg: "#66080b",
    accent: "#66080b",
    decor: "special-day",
    caption: "Special Day",
    slots: specialDayStrip(),
  },
  {
    id: "movie-ticket-4",
    name: "Movie Ticket",
    style: "ticket",
    count: 4,
    width: 600,
    height: 1600,
    bg: "#126aa5",
    accent: "#8b1e24",
    decor: "movie-ticket",
    caption: "ADMIT MORE",
    slots: movieTicketStrip(),
  },
  {
    id: "kawaii-pop-4",
    name: "Kawaii Pop",
    style: "cute",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #ffd9ea 0%, #fff4bd 100%)",
    accent: "#e64b83",
    decor: "kawaii-pop",
    caption: "CUTIE BOOTH",
    slots: tallHeaderStrip(4),
  },
  {
    id: "aesthetic-notes-3",
    name: "Aesthetic Notes",
    style: "aesthetic",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #f8f4e8 0%, #dce8dd 100%)",
    accent: "#51624f",
    decor: "aesthetic-notes",
    caption: "today's little moments",
    slots: tallHeaderStrip(3),
  },
  {
    id: "elegant-noir-3",
    name: "Elegant Noir",
    style: "elegant",
    count: 3,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #111111 0%, #251715 100%)",
    accent: "#d8b46a",
    decor: "elegant-noir",
    caption: "ELEGANCE",
    slots: elegantNoirStrip(),
  },
  {
    id: "coquette-pearl-4",
    name: "Coquette Pearl",
    style: "cute",
    count: 4,
    width: 600,
    height: 1600,
    bg: "linear-gradient(180deg, #fff5f8 0%, #f7d6df 100%)",
    accent: "#9c3f61",
    decor: "coquette-pearl",
    caption: "sweet memories",
    slots: tallHeaderStrip(4),
  },
];

export const getFrame = (id: string) => FRAMES.find((f) => f.id === id);

export const FILTERS = [
  { id: "normal", name: "Normal", css: "none" },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(0.35) contrast(1.05) saturate(0.9) brightness(1.02)",
  },
  { id: "bw", name: "Black & White", css: "grayscale(1) contrast(1.05)" },
  { id: "warm", name: "Warm", css: "saturate(1.15) hue-rotate(-8deg) brightness(1.05)" },
  { id: "cool", name: "Cool", css: "saturate(1.1) hue-rotate(12deg) brightness(1.02)" },
  {
    id: "soft-pink",
    name: "Soft Pink",
    css: "sepia(0.2) saturate(1.3) hue-rotate(-15deg) brightness(1.05)",
  },
  { id: "sepia", name: "Sepia", css: "sepia(0.8) contrast(1.05)" },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];
