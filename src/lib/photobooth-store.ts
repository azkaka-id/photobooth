import { create } from "zustand";
import type { FilterId } from "./frames";

interface PhotoboothState {
  frameId: string | null;
  photos: string[]; // data URLs
  filter: FilterId;
  setFrame: (id: string) => void;
  addPhoto: (dataUrl: string) => void;
  resetPhotos: () => void;
  removePhoto: (i: number) => void;
  setFilter: (f: FilterId) => void;
  reset: () => void;
}

export const usePhotobooth = create<PhotoboothState>((set) => ({
  frameId: null,
  photos: [],
  filter: "normal",
  setFrame: (id) => set({ frameId: id, photos: [], filter: "normal" }),
  addPhoto: (dataUrl) => set((s) => ({ photos: [...s.photos, dataUrl] })),
  resetPhotos: () => set({ photos: [] }),
  removePhoto: (i) => set((s) => ({ photos: s.photos.filter((_, idx) => idx !== i) })),
  setFilter: (f) => set({ filter: f }),
  reset: () => set({ frameId: null, photos: [], filter: "normal" }),
}));
