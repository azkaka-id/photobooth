export type OriginalPhotoSession = {
  id: string;
  photos: string[];
  photoUrls?: string[];
  frameId: string;
  filter: string;
  createdAt: number;
  expiresAt?: number;
};

const LOCAL_PREFIX = "photobooth:originals:";
const memorySessions = new Map<string, OriginalPhotoSession>();
const DEFAULT_BUCKET = "photobooth-originals";

type SupabaseManifest = {
  id: string;
  photoUrls: string[];
  frameId: string;
  filter: string;
  createdAt: number;
};

function getSupabaseConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const bucket = env.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET;

  if (!url || !anonKey) return null;
  return { url, anonKey, bucket };
}

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

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

function publicStorageUrl(path: string) {
  const config = getSupabaseConfig();
  if (!config) return null;

  return `${config.url}/storage/v1/object/public/${config.bucket}/${path}`;
}

async function uploadStorageObject(path: string, body: Blob | string, contentType: string) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured");

  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${config.anonKey}`,
      "content-type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Supabase upload failed: ${response.status}`);
  }
}

async function uploadSupabaseOriginalSession(session: OriginalPhotoSession) {
  const config = getSupabaseConfig();
  if (!config) return session;

  const folder = `sessions/${session.id}`;
  const photoUrls: string[] = [];

  for (let index = 0; index < session.photos.length; index += 1) {
    const path = `${folder}/photo-${index + 1}.jpg`;
    await uploadStorageObject(path, dataUrlToBlob(session.photos[index]), "image/jpeg");
    const url = publicStorageUrl(path);
    if (url) photoUrls.push(url);
  }

  const manifest: SupabaseManifest = {
    id: session.id,
    photoUrls,
    frameId: session.frameId,
    filter: session.filter,
    createdAt: session.createdAt,
  };

  await uploadStorageObject(
    `${folder}/manifest.json`,
    JSON.stringify(manifest),
    "application/json",
  );

  return { ...session, photoUrls };
}

export async function readSupabaseOriginalSession(
  id: string,
): Promise<OriginalPhotoSession | null> {
  const manifestUrl = publicStorageUrl(`sessions/${id}/manifest.json`);
  if (!manifestUrl) return null;

  try {
    const response = await fetch(`${manifestUrl}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;

    const manifest = (await response.json()) as SupabaseManifest;
    if (!Array.isArray(manifest.photoUrls) || manifest.photoUrls.length === 0) return null;

    return {
      id: manifest.id,
      photos: manifest.photoUrls,
      photoUrls: manifest.photoUrls,
      frameId: manifest.frameId,
      filter: manifest.filter,
      createdAt: manifest.createdAt,
    };
  } catch {
    return null;
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

  saveLocalSession(localSession);

  try {
    const supabaseSession = await uploadSupabaseOriginalSession(localSession);
    saveLocalSession(supabaseSession);
  } catch {
    // Keep local/API fallbacks available if Supabase is not configured or upload fails.
  }

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
