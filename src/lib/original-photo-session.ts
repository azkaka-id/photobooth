export type OriginalPhotoSession = {
  id: string;
  photos: string[];
  frameId: string;
  filter: string;
  createdAt: number;
  expiresAt?: number;
};

const LOCAL_PREFIX = "photobooth:originals:";
const memorySessions = new Map<string, OriginalPhotoSession>();

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function saveLocalSession(session: OriginalPhotoSession) {
  memorySessions.set(session.id, session);

  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${LOCAL_PREFIX}${session.id}`, JSON.stringify(session));
  } catch {
    // Large camera data URLs can exceed browser storage quota. Keep the app alive
    // and rely on memory/server storage for the download link.
  }
}

export function createLocalOriginalPhotoSession(
  photos: string[],
  frameId: string,
  filter: string,
): OriginalPhotoSession {
  const session: OriginalPhotoSession = {
    id: makeId(),
    photos,
    frameId,
    filter,
    createdAt: Date.now(),
  };

  saveLocalSession(session);
  return session;
}

export function readLocalOriginalSession(id: string): OriginalPhotoSession | null {
  const memorySession = memorySessions.get(id);
  if (memorySession) return memorySession;

  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(`${LOCAL_PREFIX}${id}`);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OriginalPhotoSession;
  } catch {
    return null;
  }
}

export async function createOriginalPhotoSession(
  photos: string[],
  frameId: string,
  filter: string,
  id = makeId(),
) {
  const localSession: OriginalPhotoSession = {
    id,
    photos,
    frameId,
    filter,
    createdAt: Date.now(),
  };

  try {
    const response = await fetch("/api/originals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, photos, frameId, filter }),
    });

    if (!response.ok) throw new Error("Failed to create original photo session");

    const session = (await response.json()) as OriginalPhotoSession;
    saveLocalSession(session);
    return session;
  } catch {
    saveLocalSession(localSession);
    return localSession;
  }
}
