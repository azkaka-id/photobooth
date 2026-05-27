import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { usePhotobooth } from "@/lib/photobooth-store";
import { getFrame, FILTERS } from "@/lib/frames";
import { renderFrameToCanvas } from "@/lib/render-frame";
import {
  createLocalOriginalPhotoSession,
  createOriginalPhotoSession,
} from "@/lib/original-photo-session";
import { ArrowLeft, Download, Printer, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "Your Photostrip" }] }),
  component: ResultPage,
});

function makeQrImageUrl(downloadUrl: string, size = 260) {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    margin: "12",
    color: "781525",
    bgcolor: "fffaf6",
    data: downloadUrl,
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

function ResultPage() {
  const navigate = useNavigate();
  const { frameId, photos, filter, reset } = usePhotobooth();
  const frame = frameId ? getFrame(frameId) : null;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionKeyRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!frame) {
      navigate({ to: "/" });
      return;
    }
    const c = canvasRef.current;
    if (!c) return;
    const css = FILTERS.find((f) => f.id === filter)?.css ?? "none";
    (async () => {
      await renderFrameToCanvas(c, frame, photos, css);
      setUrl(c.toDataURL("image/png"));
    })();
  }, [frame, photos, filter, navigate]);

  useEffect(() => {
    if (!frame || !frameId || photos.length < frame.count) return;

    const sessionKey = `${frameId}:${filter}:${photos.map((photo) => `${photo.length}:${photo.slice(0, 80)}`).join("|")}`;
    if (sessionKeyRef.current === sessionKey) return;
    sessionKeyRef.current = sessionKey;

    const localSession = createLocalOriginalPhotoSession(photos, frameId, filter);
    const link = new URL("/download", window.location.origin);
    link.searchParams.set("id", localSession.id);
    setDownloadUrl(link.toString());

    (async () => {
      await createOriginalPhotoSession(photos, frameId, filter, localSession.id);
    })();
  }, [frame, frameId, photos, filter]);

  const download = (type: "png" | "jpg") => {
    if (!url) return;
    const a = document.createElement("a");
    a.download = `photostrip.${type === "jpg" ? "jpg" : "png"}`;
    if (type === "jpg" && canvasRef.current) {
      a.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    } else {
      a.href = url;
    }
    a.click();
  };

  const print = () => {
    if (!url) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const qrSrc = downloadUrl ? makeQrImageUrl(downloadUrl, 240) : "";
    w.document.write(`
      <html><head><title>Print Photostrip</title>
      <style>
        @page { margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fffaf6; font-family: Arial, sans-serif; }
        .sheet { display: flex; align-items: center; justify-content: center; gap: 44px; padding: 28px; }
        .strip { max-height: calc(100vh - 48px); max-width: 58vw; }
        .qr-card { width: 280px; padding: 28px; border: 1px solid #efd2c9; border-radius: 28px; background: #fffaf6; text-align: center; color: #781525; }
        .qr-title { margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: 700; }
        .qr-copy { margin: 8px auto 18px; max-width: 210px; font-size: 13px; line-height: 1.3; color: #7c4742; }
        .qr-wrap { border-radius: 18px; background: #fffaf6; overflow: hidden; }
        .qr { width: 100%; height: auto; display: block; }
      </style></head>
      <body>
        <div class="sheet">
          <img class="strip" src="${url}" />
          ${
            qrSrc
              ? `<div class="qr-card"><h2 class="qr-title">Original photos</h2><p class="qr-copy">Scan to download the raw ${photos.length} photos without frame.</p><div class="qr-wrap"><img class="qr" src="${qrSrc}" /></div></div>`
              : ""
          }
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
      </body></html>
    `);
    w.document.close();
  };

  const startOver = () => {
    reset();
    navigate({ to: "/" });
  };

  if (!frame) return null;

  return (
    <div className="page-fade min-h-screen max-w-5xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between">
        <Link
          to="/filter"
          className="inline-flex items-center gap-2 text-sm text-maroon hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" /> back to filters
        </Link>
        <button
          onClick={startOver}
          className="inline-flex items-center gap-2 text-sm text-maroon hover:opacity-80"
        >
          <RotateCcw className="w-4 h-4" /> start over
        </button>
      </div>

      <h1 className="mt-6 text-4xl md:text-5xl font-display font-bold text-maroon text-center">
        Your <span className="italic">photostrip</span>
      </h1>
      <p className="text-center text-muted-foreground mt-2">Print it, or save it as a memory.</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_auto_auto] gap-6 items-center justify-center">
        <div className="glass rounded-3xl p-4 shadow-soft mx-auto w-full max-w-[340px]">
          <canvas
            ref={canvasRef}
            width={frame.width}
            height={frame.height}
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }}
          />
        </div>

        <div className="mx-auto w-full max-w-[280px] rounded-[28px] border border-[#efd2c9] bg-[#fffaf6] px-7 py-7 text-center shadow-[0_24px_70px_rgba(80,31,23,0.14)]">
          <p className="font-display text-2xl font-bold text-maroon">Original photos</p>
          <p className="mx-auto mt-2 max-w-[210px] text-sm leading-snug text-[#7c4742]">
            Scan to download the raw {photos.length} photos without frame.
          </p>
          <div className="mt-5 rounded-[18px] bg-[#fffaf6] p-1">
            {downloadUrl ? (
              <img
                src={makeQrImageUrl(downloadUrl)}
                alt="QR code to download original photos"
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-square grid place-items-center text-sm text-muted-foreground">
                Preparing QR...
              </div>
            )}
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              className="mt-4 inline-flex text-xs lowercase text-maroon hover:opacity-80"
            >
              open link
            </a>
          )}
        </div>

        <div className="flex md:flex-col gap-3 justify-center">
          <button
            onClick={() => download("png")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-maroon text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Download className="w-4 h-4" /> PNG
          </button>
          <button
            onClick={() => download("jpg")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:bg-secondary"
          >
            <Download className="w-4 h-4" /> JPG
          </button>
          <button
            onClick={print}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
