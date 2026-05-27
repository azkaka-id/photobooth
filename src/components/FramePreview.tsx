import { useEffect, useRef } from "react";
import type { FrameTemplate, FilterId } from "@/lib/frames";
import { FILTERS } from "@/lib/frames";
import { renderFrameToCanvas } from "@/lib/render-frame";

interface Props {
  frame: FrameTemplate;
  photos?: string[];
  filter?: FilterId;
  className?: string;
}

export function FramePreview({ frame, photos = [], filter = "normal", className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const filterCss = FILTERS.find(f => f.id === filter)?.css ?? "none";
    renderFrameToCanvas(canvas, frame, photos, filterCss);
  }, [frame, photos, filter]);

  return (
    <canvas
      ref={ref}
      width={frame.width}
      height={frame.height}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
