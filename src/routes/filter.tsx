import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePhotobooth } from "@/lib/photobooth-store";
import { getFrame, FILTERS } from "@/lib/frames";
import { FramePreview } from "@/components/FramePreview";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/filter")({
  head: () => ({ meta: [{ title: "Filter — Photostrip" }] }),
  component: FilterPage,
});

function FilterPage() {
  const navigate = useNavigate();
  const { frameId, photos, filter, setFilter } = usePhotobooth();
  const frame = frameId ? getFrame(frameId) : null;

  useEffect(() => {
    if (!frame || photos.length < (frame?.count ?? 0)) navigate({ to: "/capture" });
  }, [frame, photos, navigate]);

  if (!frame) return null;

  return (
    <div className="page-fade min-h-screen max-w-6xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between">
        <Link to="/capture" className="inline-flex items-center gap-2 text-sm text-maroon hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> back to camera
        </Link>
        <button
          onClick={() => navigate({ to: "/result" })}
          className="px-6 py-3 rounded-full bg-maroon text-primary-foreground hover:opacity-90 shadow-soft"
        >
          Continue →
        </button>
      </div>

      <h1 className="mt-6 text-4xl md:text-5xl font-display font-bold text-maroon text-center">
        Add a <span className="italic">filter</span>
      </h1>
      <p className="text-center text-muted-foreground mt-2">Applied to every photo in your strip.</p>

      <div className="mt-8 grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
        <div className="glass rounded-3xl p-4 shadow-soft mx-auto w-full max-w-[320px]">
          <FramePreview frame={frame} photos={photos} filter={filter} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`group rounded-2xl p-2 text-left transition border ${
                  active ? "border-maroon bg-secondary shadow-soft" : "border-border bg-card hover:bg-secondary"
                }`}
              >
                <div className="rounded-xl overflow-hidden aspect-square bg-muted">
                  {photos[0] && (
                    <img
                      src={photos[0]}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      style={{ filter: f.css }}
                    />
                  )}
                </div>
                <p className="mt-2 px-1 text-sm font-medium text-maroon">{f.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
