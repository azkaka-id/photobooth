import { createFileRoute } from "@tanstack/react-router";

type OriginalPhotoSession = {
  id: string;
  photos: string[];
  frameId: string;
  filter: string;
  createdAt: number;
  expiresAt: number;
};

const ONE_DAY = 24 * 60 * 60 * 1000;
const MAX_PHOTOS = 4;
const MAX_PHOTO_SIZE = 8_000_000;

const globalStore = globalThis as typeof globalThis & {
  __photoboothOriginals?: Map<string, OriginalPhotoSession>;
};

const sessions = globalStore.__photoboothOriginals ?? new Map<string, OriginalPhotoSession>();
globalStore.__photoboothOriginals = sessions;

function makeId() {
  return crypto.randomUUID();
}

function isValidId(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(value);
}

function cleanupExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt < now) sessions.delete(id);
  }
}

function isPhotoDataUrl(value: unknown) {
  return (
    typeof value === "string" && value.startsWith("data:image/") && value.length <= MAX_PHOTO_SIZE
  );
}

export const Route = createFileRoute("/api/originals")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        cleanupExpired();

        const body = (await request.json().catch(() => null)) as {
          id?: unknown;
          photos?: unknown;
          frameId?: unknown;
          filter?: unknown;
        } | null;

        if (!body || !Array.isArray(body.photos)) {
          return Response.json({ error: "Missing photos" }, { status: 400 });
        }

        const photos = body.photos.filter(isPhotoDataUrl);
        if (
          photos.length === 0 ||
          photos.length > MAX_PHOTOS ||
          photos.length !== body.photos.length
        ) {
          return Response.json({ error: "Invalid photos" }, { status: 400 });
        }

        const now = Date.now();
        const session: OriginalPhotoSession = {
          id: isValidId(body.id) ? body.id : makeId(),
          photos,
          frameId: typeof body.frameId === "string" ? body.frameId : "unknown",
          filter: typeof body.filter === "string" ? body.filter : "normal",
          createdAt: now,
          expiresAt: now + ONE_DAY,
        };

        sessions.set(session.id, session);
        return Response.json(session);
      },

      GET: async ({ request }) => {
        cleanupExpired();

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

        const session = sessions.get(id);
        if (!session) return Response.json({ error: "Not found" }, { status: 404 });

        return Response.json(session);
      },
    },
  },
});
