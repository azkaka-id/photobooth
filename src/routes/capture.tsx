import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { usePhotobooth } from "@/lib/photobooth-store";
import { getFrame } from "@/lib/frames";
import { playCountdownBeep, playShutterSound } from "@/lib/ui-sounds";
import { FramePreview } from "@/components/FramePreview";
import { ArrowLeft, Camera, RefreshCcw, Check, X } from "lucide-react";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Capture — Photostrip" }] }),
  component: Capture,
});

function Capture() {
  const navigate = useNavigate();
  const { frameId, photos, addPhoto, resetPhotos, removePhoto } = usePhotobooth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const frame = frameId ? getFrame(frameId) : null;

  useEffect(() => {
    if (!frame) navigate({ to: "/" });
  }, [frame, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error(e);
        setError("Camera access denied. Please allow webcam permission and reload.");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // mirror so preview matches webcam
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    playShutterSound();
    setPending(canvas.toDataURL("image/jpeg", 0.92));
  };

  const startCountdown = () => {
    if (countdown > 0) return;
    let n = 3;
    setCountdown(n);
    playCountdownBeep();
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(0);
        snap();
      } else {
        setCountdown(n);
        playCountdownBeep();
        setTimeout(tick, 800);
      }
    };
    setTimeout(tick, 800);
  };

  const accept = () => {
    if (!pending) return;
    addPhoto(pending);
    setPending(null);
  };

  if (!frame) return null;
  const filled = photos.length;
  const total = frame.count;
  const done = filled >= total;

  return (
    <div className="page-fade min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-maroon hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" /> change frame
        </Link>
        <div className="text-sm text-muted-foreground">
          <span className="font-display text-2xl text-maroon">{filled}</span>
          <span> / {total} photos</span>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* Camera */}
        <div className="glass rounded-3xl p-4 shadow-soft">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            {error ? (
              <div className="absolute inset-0 grid place-items-center text-center p-6 text-primary-foreground bg-maroon/90">
                <p>{error}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {countdown > 0 && (
                  <div className="absolute inset-0 grid place-items-center bg-black/30">
                    <span className="font-display text-[12rem] leading-none text-white drop-shadow-2xl">
                      {countdown}
                    </span>
                  </div>
                )}
                {pending && (
                  <img
                    src={pending}
                    alt="preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            {pending ? (
              <>
                <button
                  onClick={() => setPending(null)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-card hover:bg-secondary transition"
                >
                  <RefreshCcw className="w-4 h-4" /> Retake
                </button>
                <button
                  onClick={accept}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-maroon text-primary-foreground hover:opacity-90 transition shadow-soft"
                >
                  <Check className="w-4 h-4" /> Add to frame
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startCountdown}
                  disabled={done || !!error}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-maroon text-primary-foreground hover:opacity-90 transition shadow-soft disabled:opacity-40"
                >
                  <Camera className="w-5 h-5" /> {done ? "Frame full" : "Take photo"}
                </button>
                <button
                  onClick={resetPhotos}
                  disabled={filled === 0}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-card hover:bg-secondary transition disabled:opacity-40"
                >
                  Reset
                </button>
                {done && (
                  <button
                    onClick={() => navigate({ to: "/filter" })}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition shadow-soft"
                  >
                    Choose filter →
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
              >
                {photos[i] ? (
                  <>
                    <img
                      src={photos[i]}
                      alt={`shot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
                    slot {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frame preview */}
        <div className="glass rounded-3xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3 px-2">
            <p className="font-display text-xl text-maroon">{frame.name}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">live preview</p>
          </div>
          <div className="mx-auto max-w-[280px]">
            <FramePreview frame={frame} photos={photos} />
          </div>
        </div>
      </div>
    </div>
  );
}
