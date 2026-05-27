import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FRAMES } from "@/lib/frames";
import { FramePreview } from "@/components/FramePreview";
import { usePhotobooth } from "@/lib/photobooth-store";
import { Camera, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Photostrip — Aesthetic Photobooth" },
      {
        name: "description",
        content:
          "Pick a vintage frame, snap photos from your webcam, add a filter, and print your photostrip.",
      },
    ],
  }),
  component: FrameSelect,
});

function FrameSelect() {
  const navigate = useNavigate();
  const setFrame = usePhotobooth((s) => s.setFrame);

  const choose = (id: string) => {
    setFrame(id);
    navigate({ to: "/capture" });
  };

  return (
    <div className="page-fade min-h-screen">
      {/* decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-rose/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full bg-blush/30 blur-3xl" />
      </div>

      <header className="max-w-6xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="font-script text-3xl md:text-4xl text-maroon">photostrip by Akokk</p>
        <h1 className="mt-2 text-5xl md:text-7xl font-display font-bold text-maroon">
          Pick your <span className="italic">frame</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Choose from aesthetic, vintage, ribbon, pearl, lace, flower and romantic styles. Snap with
          your webcam, drop a filter, print the memory.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-maroon">
          <Sparkles className="w-4 h-4" />
          <span>3 or 4 photo strips · printable PNG</span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {FRAMES.map((f, i) => (
          <button
            key={f.id}
            onClick={() => choose(f.id)}
            className="group text-left rounded-3xl p-3 glass shadow-soft transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_oklch(0.36_0.13_15/0.45)] focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ ["--r" as string]: `${(i % 3) - 1}deg` } as React.CSSProperties}
          >
            <div className="rounded-2xl overflow-hidden bg-cream/60 float-slow">
              <FramePreview frame={f} />
            </div>
            <div className="mt-3 px-1 flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-maroon leading-tight">{f.name}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {f.count} photos · {f.style}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-maroon opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-4 h-4" /> use
              </span>
            </div>
          </button>
        ))}
      </section>

      <footer className="px-6 pb-8 text-center text-sm text-muted-foreground">
        2026 © Photostrip. All rights reserved.
      </footer>
    </div>
  );
}
