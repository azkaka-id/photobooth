import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { readLocalOriginalSession, type OriginalPhotoSession } from "@/lib/original-photo-session";

export const Route = createFileRoute("/download")({
  head: () => ({ meta: [{ title: "Download Original Photos" }] }),
  component: DownloadOriginalsPage,
});

function filename(index: number) {
  return `photobooth-original-${index + 1}.jpg`;
}

function DownloadOriginalsPage() {
  const { id } = Route.useSearch() as { id?: string };
  const [session, setSession] = useState<OriginalPhotoSession | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }

    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch(`/api/originals?id=${encodeURIComponent(id)}`);
        if (response.ok) {
          const data = (await response.json()) as OriginalPhotoSession;
          if (!cancelled) {
            setSession(data);
            setStatus("ready");
          }
          return;
        }
      } catch {
        // Local fallback below keeps same-browser sessions usable offline.
      }

      const localSession = readLocalOriginalSession(id);
      if (!cancelled) {
        setSession(localSession);
        setStatus(localSession ? "ready" : "missing");
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const downloadAll = () => {
    session?.photos.forEach((photo, index) => {
      const a = document.createElement("a");
      a.href = photo;
      a.download = filename(index);
      a.click();
    });
  };

  return (
    <div className="page-fade min-h-screen max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-maroon hover:opacity-80">
          photobooth
        </Link>
        {session && (
          <button
            onClick={downloadAll}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-maroon text-primary-foreground hover:opacity-90 shadow-soft"
          >
            <Download className="w-4 h-4" /> Download all
          </button>
        )}
      </div>

      <h1 className="mt-8 text-4xl md:text-5xl font-display font-bold text-maroon text-center">
        Original <span className="italic">photos</span>
      </h1>
      <p className="text-center text-muted-foreground mt-2">
        Camera photos only, without frame or photostrip layout.
      </p>

      {status === "loading" && (
        <div className="mt-10 text-center text-muted-foreground">Loading photos...</div>
      )}

      {status === "missing" && (
        <div className="mt-10 glass rounded-3xl p-8 text-center shadow-soft">
          <ImageOff className="w-10 h-10 mx-auto text-maroon" />
          <p className="mt-4 font-medium text-maroon">Original photos are not available.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The download link may have expired, or the photobooth server was restarted.
          </p>
        </div>
      )}

      {session && (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {session.photos.map((photo, index) => (
            <div key={`${session.id}-${index}`} className="glass rounded-3xl p-3 shadow-soft">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={photo}
                  alt={`Original photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <a
                href={photo}
                download={filename(index)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border hover:bg-secondary text-sm"
              >
                <Download className="w-4 h-4" /> Photo {index + 1}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
