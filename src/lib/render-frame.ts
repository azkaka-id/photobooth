import type { FrameTemplate } from "./frames";

const imgCache = new Map<string, HTMLImageElement>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imgCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function parseGradient(bg: string, ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Very small parser for "linear-gradient(180deg, #aaa 0%, #bbb 100%)"
  const m = bg.match(/linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]+)[^,]*,\s*(#[0-9a-fA-F]+)/);
  if (!m) {
    ctx.fillStyle = bg;
    return;
  }
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, m[2]);
  g.addColorStop(1, m[3]);
  ctx.fillStyle = g;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "#111";
  let cursor = x;
  let i = 0;
  while (cursor < x + w) {
    const bar = [3, 5, 2, 7, 4, 2, 6, 3][i % 8];
    const gap = [2, 3, 4, 2, 5, 2][i % 6];
    ctx.fillRect(cursor, y, bar, h);
    cursor += bar + gap;
    i += 1;
  }
  ctx.restore();
}

function drawCameraIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  color = "#62070a",
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  roundRectPath(ctx, 0, s * 0.22, s, s * 0.55, s * 0.08);
  ctx.fill();
  ctx.fillRect(s * 0.18, s * 0.08, s * 0.25, s * 0.18);
  ctx.fillRect(s * 0.7, s * 0.13, s * 0.16, s * 0.1);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(s * 0.58, s * 0.5, s * 0.19, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s * 0.58, s * 0.5, s * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPetalFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  petal: string,
  center = "#fff7d6",
) {
  ctx.save();
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(a) * s * 0.55,
      cy + Math.sin(a) * s * 0.55,
      s * 0.45,
      s * 0.28,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDashedRule(
  ctx: CanvasRenderingContext2D,
  y: number,
  x = 70,
  w = 460,
  color = "#66080b",
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.setLineDash([22, 12]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.25, y - r * 0.25);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x + r * 0.25, y + r * 0.25);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.25, y + r * 0.25);
  ctx.lineTo(x - r, y);
  ctx.lineTo(x - r * 0.25, y - r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.2, x - s * 0.5, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.5, y - s, x + s, y - s * 0.2, x, y + s * 0.35);
  ctx.fill();
  ctx.restore();
}

function drawBow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.08;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.33, y, s * 0.35, s * 0.22, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.33, y, s * 0.35, s * 0.22, 0.25, 0, Math.PI * 2);
  ctx.fill();
  roundRectPath(ctx, x - s * 0.1, y - s * 0.11, s * 0.2, s * 0.22, s * 0.05);
  ctx.fill();
  ctx.restore();
}

function drawKawaiiPopFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  roundRectPath(ctx, 34, 46, W - 68, H - 92, 34);
  ctx.fill();

  ctx.strokeStyle = "#e64b83";
  ctx.lineWidth = 7;
  ctx.setLineDash([18, 16]);
  roundRectPath(ctx, 52, 64, W - 104, H - 128, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#e64b83";
  ctx.font = "900 42px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, 104);
  ctx.font = 'italic 700 39px "Playfair Display", serif';
  ctx.fillText("happy day", W / 2, 146);

  drawHeart(ctx, 94, 110, 22, "#ff6b9e");
  drawHeart(ctx, W - 92, 118, 18, "#ff8aa6");
  drawSparkle(ctx, 135, 70, 17, "#f5c849");
  drawSparkle(ctx, W - 132, 72, 14, "#60b9ff");
  drawSparkle(ctx, 88, H - 95, 18, "#60b9ff");
  drawHeart(ctx, W - 92, H - 88, 22, "#ff6b9e");

  ctx.fillStyle = "#ff8aa6";
  for (let y = 220; y < H - 180; y += 160) {
    ctx.beginPath();
    ctx.arc(36, y, 14, 0, Math.PI * 2);
    ctx.arc(W - 36, y + 78, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawAestheticNotesFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "#fbf7eb";
  roundRectPath(ctx, 44, 50, W - 88, H - 100, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(81, 98, 79, 0.35)";
  ctx.lineWidth = 2;
  for (let y = 185; y < H - 150; y += 46) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(W - 70, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#51624f";
  ctx.font = 'italic 700 42px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText("little notes", W / 2, 102);
  ctx.font = "600 18px Inter, sans-serif";
  ctx.globalAlpha = 0.75;
  ctx.fillText(frame.caption, W / 2, 134);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#d3b88c";
  ctx.rotate(-0.08);
  ctx.fillRect(68, 46, 130, 38);
  ctx.rotate(0.08);
  ctx.rotate(0.06);
  ctx.fillRect(W - 198, 86, 124, 34);
  ctx.rotate(-0.06);

  ctx.strokeStyle = "#51624f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(82, H - 120);
  ctx.bezierCurveTo(190, H - 165, 250, H - 80, 370, H - 130);
  ctx.bezierCurveTo(420, H - 150, 465, H - 140, 510, H - 110);
  ctx.stroke();

  drawSparkle(ctx, 102, 146, 12, "#d3b88c");
  drawSparkle(ctx, W - 102, H - 105, 14, "#d3b88c");
  ctx.restore();
}

function drawElegantNoirFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.strokeStyle = "#d8b46a";
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 42, W - 76, H - 84);
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 60, W - 112, H - 120);

  ctx.fillStyle = "#d8b46a";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("THE PHOTO SALON", W / 2, 82);
  ctx.font = 'italic 700 47px "Playfair Display", serif';
  ctx.fillText(frame.caption, W / 2, 1435);
  ctx.font = "500 18px Inter, sans-serif";
  ctx.globalAlpha = 0.75;
  ctx.fillText("timeless portraits", W / 2, 1470);
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.moveTo(86, 118);
  ctx.lineTo(232, 118);
  ctx.moveTo(W - 232, 118);
  ctx.lineTo(W - 86, 118);
  ctx.stroke();

  drawSparkle(ctx, W / 2, 118, 14, "#d8b46a");
  drawSparkle(ctx, 83, H - 87, 12, "#d8b46a");
  drawSparkle(ctx, W - 83, H - 87, 12, "#d8b46a");
  ctx.restore();
}

function drawCoquettePearlFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "#fffafd";
  roundRectPath(ctx, 42, 48, W - 84, H - 96, 28);
  ctx.fill();

  ctx.fillStyle = "#f3bacb";
  ctx.globalAlpha = 0.9;
  for (let y = 84; y < H - 84; y += 30) {
    ctx.beginPath();
    ctx.arc(60, y, 5, 0, Math.PI * 2);
    ctx.arc(W - 60, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawBow(ctx, W / 2, 94, 105, "#9c3f61");
  drawBow(ctx, 102, H - 98, 70, "#d97b9d");
  drawBow(ctx, W - 102, H - 98, 70, "#d97b9d");

  ctx.fillStyle = "#9c3f61";
  ctx.font = 'italic 700 43px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, H - 142);
  ctx.font = "600 16px Inter, sans-serif";
  ctx.fillText("ribbon booth", W / 2, H - 112);
  ctx.restore();
}

function drawLaceRoseDeluxeFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  roundRectPath(ctx, 38, 44, W - 76, H - 88, 30);
  ctx.fill();

  ctx.strokeStyle = "#9a4f78";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(62, 70, W - 124, H - 140);

  ctx.strokeStyle = "rgba(154, 79, 120, 0.75)";
  ctx.lineWidth = 2;
  for (let x = 70; x < W - 70; x += 22) {
    ctx.beginPath();
    ctx.arc(x, 82, 10, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, H - 82, 10, 0, Math.PI);
    ctx.stroke();
  }

  ctx.fillStyle = "#9a4f78";
  ctx.font = 'italic 700 46px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, 105);
  ctx.font = "600 16px Inter, sans-serif";
  ctx.globalAlpha = 0.72;
  ctx.fillText("rose ribbon studio", W / 2, 132);
  ctx.globalAlpha = 1;

  drawPetalFlower(ctx, 88, 116, 25, "#e994b5");
  drawPetalFlower(ctx, W - 88, H - 118, 27, "#d985a9");
  drawHeart(ctx, W - 95, 115, 18, "#c85b8b");
  drawHeart(ctx, 92, H - 118, 17, "#c85b8b");
  drawSparkle(ctx, 127, 76, 12, "#d7b8e6");
  drawSparkle(ctx, W - 128, H - 78, 12, "#d7b8e6");
  ctx.restore();
}

function drawFlowerGardenDeluxeFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 246, 0.88)";
  roundRectPath(ctx, 34, 42, W - 68, H - 84, 24);
  ctx.fill();

  ctx.strokeStyle = "#3f7a56";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 12]);
  roundRectPath(ctx, 54, 62, W - 108, H - 124, 20);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "#5f9b65";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(78, 112);
  ctx.bezierCurveTo(150, 55, 240, 155, 318, 92);
  ctx.bezierCurveTo(395, 32, 455, 92, 522, 70);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(72, H - 124);
  ctx.bezierCurveTo(180, H - 72, 250, H - 165, 360, H - 105);
  ctx.bezierCurveTo(420, H - 72, 480, H - 130, 528, H - 104);
  ctx.stroke();

  ctx.fillStyle = "#3f7a56";
  ctx.font = 'italic 700 43px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, 115);
  ctx.font = "700 15px Inter, sans-serif";
  ctx.fillText("fresh blooms · sunny smiles", W / 2, H - 82);

  drawPetalFlower(ctx, 92, 92, 22, "#ffb2c0");
  drawPetalFlower(ctx, 505, 92, 20, "#ffd86f");
  drawPetalFlower(ctx, 82, H - 96, 20, "#c7dd78");
  drawPetalFlower(ctx, W - 92, H - 116, 25, "#ff9fb2");
  drawSparkle(ctx, 130, H - 73, 12, "#ffd86f");
  drawHeart(ctx, W - 126, 134, 15, "#f08c9b");
  ctx.restore();
}

function drawRomanticRougeDeluxeFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.strokeStyle = "#f3c66f";
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 40, W - 68, H - 80);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(54, 62, W - 108, H - 124);

  ctx.fillStyle = "rgba(255, 210, 221, 0.08)";
  roundRectPath(ctx, 68, 86, W - 136, H - 172, 20);
  ctx.fill();

  ctx.fillStyle = "#ffd2dd";
  ctx.font = 'italic 700 47px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, 96);
  ctx.font = "700 16px Inter, sans-serif";
  ctx.globalAlpha = 0.82;
  ctx.fillText("after dark photo club", W / 2, 128);
  ctx.globalAlpha = 1;

  drawCameraIcon(ctx, 78, H - 128, 82, "#ffd2dd");
  drawHeart(ctx, W - 92, 105, 24, "#ff7fa2");
  drawHeart(ctx, W - 130, H - 116, 17, "#f3c66f");
  drawSparkle(ctx, 92, 116, 14, "#f3c66f");
  drawSparkle(ctx, W - 92, H - 83, 13, "#ffd2dd");

  ctx.strokeStyle = "#f3c66f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, H - 82);
  ctx.lineTo(W - 100, H - 82);
  ctx.stroke();
  ctx.restore();
}

function drawRomanticBlushDeluxeFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
  roundRectPath(ctx, 38, 42, W - 76, H - 84, 32);
  ctx.fill();

  ctx.fillStyle = "#ffc1d2";
  for (let y = 76; y < H - 76; y += 34) {
    ctx.beginPath();
    ctx.arc(58, y, 5.5, 0, Math.PI * 2);
    ctx.arc(W - 58, y, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#b54870";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 12]);
  roundRectPath(ctx, 66, 70, W - 132, H - 140, 20);
  ctx.stroke();
  ctx.setLineDash([]);

  drawBow(ctx, W / 2, 94, 96, "#b54870");
  drawBow(ctx, 96, H - 95, 64, "#d87598");
  drawBow(ctx, W - 96, H - 95, 64, "#d87598");

  ctx.fillStyle = "#b54870";
  ctx.font = 'italic 700 43px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText(frame.caption, W / 2, H - 142);
  ctx.font = "700 15px Inter, sans-serif";
  ctx.fillText("sweethearts only", W / 2, 132);

  drawHeart(ctx, 100, 126, 17, "#e76791");
  drawHeart(ctx, W - 104, 126, 17, "#e76791");
  drawSparkle(ctx, 126, H - 130, 12, "#f7b6c9");
  drawSparkle(ctx, W - 126, H - 130, 12, "#f7b6c9");
  ctx.restore();
}

function drawTicketBody(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;
  const bodyX = 36;
  const bodyY = 46;
  const bodyW = W - bodyX * 2;
  const bodyH = H - 92;

  ctx.save();
  roundRectPath(ctx, bodyX, bodyY, bodyW, bodyH, 26);
  ctx.fillStyle = "#fffdf9";
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  const notchR = 30;
  const notches = [0.14, 0.5, 0.86];
  for (const p of notches) {
    ctx.beginPath();
    ctx.arc(bodyX, bodyY + bodyH * p, notchR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bodyX + bodyW, bodyY + bodyH * p, notchR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawSpecialDayFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;

  drawTicketBody(ctx, frame);
  ctx.save();
  ctx.fillStyle = "#fffdf9";
  ctx.fillRect(0, 0, W, 44);
  ctx.fillRect(0, H - 44, W, 44);

  ctx.fillStyle = "#fff";
  ctx.font = "700 25px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PIXELBOOTH", W / 2, 30);

  drawBarcode(ctx, 72, 82, 456, 105);
  drawDashedRule(ctx, 235);
  drawDashedRule(ctx, 1345);

  ctx.fillStyle = "#66080b";
  ctx.font = 'italic 700 64px "Playfair Display", serif';
  ctx.textAlign = "center";
  ctx.fillText("Special", W / 2 - 10, 1430);
  ctx.fillText("Day", W / 2 + 55, 1500);

  drawCameraIcon(ctx, 72, 1450, 105);
  ctx.fillStyle = "#ff6082";
  ctx.font = "700 24px Inter, sans-serif";
  ctx.fillText("♥", 165, 1450);
  ctx.fillText("♥", 190, 1470);
  ctx.restore();
}

function drawMovieTicketFrame(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H } = frame;
  const bodyX = 50;
  const bodyY = 36;
  const bodyW = W - bodyX * 2;
  const bodyH = H - 72;

  ctx.save();
  roundRectPath(ctx, bodyX, bodyY, bodyW, bodyH, 10);
  ctx.fillStyle = "#f8f1df";
  ctx.fill();

  ctx.strokeStyle = "#a94b4f";
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX + 14, bodyY + 14, bodyW - 28, bodyH - 28);

  ctx.globalCompositeOperation = "destination-out";
  for (let y = bodyY + 30; y < bodyY + bodyH - 30; y += 22) {
    ctx.beginPath();
    ctx.arc(bodyX, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bodyX + bodyW, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "rgba(67, 92, 101, 0.18)";
  ctx.font = "800 47px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SOLO DATE", W / 2, 105);

  ctx.fillStyle = "#8b1e24";
  ctx.font = 'italic 700 54px "Playfair Display", serif';
  ctx.fillText("Movie", W / 2, 93);
  ctx.font = "700 20px Inter, sans-serif";
  ctx.fillText("★ ★ ★", W / 2, 128);

  ctx.strokeStyle = "#b77b7c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bodyX + 14, 152);
  ctx.lineTo(bodyX + bodyW - 14, 152);
  ctx.moveTo(bodyX + 14, 205);
  ctx.lineTo(bodyX + bodyW - 14, 205);
  ctx.moveTo(235, 152);
  ctx.lineTo(235, 205);
  ctx.moveTo(340, 152);
  ctx.lineTo(340, 205);
  ctx.stroke();

  ctx.fillStyle = "#8b1e24";
  ctx.font = "600 17px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Sunday, May 25th", 140, 174);
  ctx.fillText("Row", 288, 174);
  ctx.fillText("Seat", 402, 174);
  ctx.font = "800 29px Inter, sans-serif";
  ctx.fillText("19:30", 140, 198);
  ctx.fillText("01", 288, 198);
  ctx.fillText("23", 402, 198);

  ctx.fillStyle = "#1d5782";
  ctx.font = "700 12px Inter, sans-serif";
  ctx.fillText("THANK YOU  ★  SEE YOU AGAIN  ★  THANK YOU", W / 2, 1515);

  ctx.fillStyle = "#8b1e24";
  ctx.font = "800 28px Inter, sans-serif";
  ctx.fillText("★ ADMIT MORE ★", W / 2, 1550);
  ctx.restore();
}

function drawDecor(ctx: CanvasRenderingContext2D, frame: FrameTemplate) {
  const { width: W, height: H, accent, decor } = frame;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;

  if (decor === "special-day") {
    drawSpecialDayFrame(ctx, frame);
  } else if (decor === "movie-ticket") {
    drawMovieTicketFrame(ctx, frame);
  } else if (decor === "kawaii-pop") {
    drawKawaiiPopFrame(ctx, frame);
  } else if (decor === "aesthetic-notes") {
    drawAestheticNotesFrame(ctx, frame);
  } else if (decor === "elegant-noir") {
    drawElegantNoirFrame(ctx, frame);
  } else if (decor === "coquette-pearl") {
    drawCoquettePearlFrame(ctx, frame);
  } else if (decor === "lace-rose-deluxe") {
    drawLaceRoseDeluxeFrame(ctx, frame);
  } else if (decor === "flower-garden-deluxe") {
    drawFlowerGardenDeluxeFrame(ctx, frame);
  } else if (decor === "romantic-rouge-deluxe") {
    drawRomanticRougeDeluxeFrame(ctx, frame);
  } else if (decor === "romantic-blush-deluxe") {
    drawRomanticBlushDeluxeFrame(ctx, frame);
  } else if (decor === "pearl") {
    // pearl dots down both sides
    const r = 6;
    for (let y = 24; y < H - 24; y += 22) {
      ctx.beginPath();
      ctx.arc(18, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W - 18, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (decor === "ribbon") {
    // ribbon corners
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(20, 60);
    ctx.quadraticCurveTo(W / 2, 0, W - 20, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, H - 60);
    ctx.quadraticCurveTo(W / 2, H, W - 20, H - 60);
    ctx.stroke();
  } else if (decor === "lace") {
    ctx.lineWidth = 2;
    const step = 18;
    for (let x = 8; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, 18, 8, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, H - 18, 8, 0, Math.PI);
      ctx.stroke();
    }
  } else if (decor === "flower") {
    const drawFlower = (cx: number, cy: number, s: number) => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(a) * s * 0.6,
          cy + Math.sin(a) * s * 0.6,
          s * 0.5,
          s * 0.3,
          a,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#fff7d6";
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
    };
    drawFlower(40, 40, 18);
    drawFlower(W - 40, 40, 18);
    drawFlower(40, H - 80, 18);
    drawFlower(W - 40, H - 80, 18);
  }
  ctx.restore();
}

export async function renderFrameToCanvas(
  canvas: HTMLCanvasElement,
  frame: FrameTemplate,
  photos: string[],
  filterCss: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: W, height: H } = frame;
  canvas.width = W;
  canvas.height = H;

  // background
  parseGradient(frame.bg, ctx, W, H);
  ctx.fillRect(0, 0, W, H);

  const hasCustomDecor = [
    "special-day",
    "movie-ticket",
    "kawaii-pop",
    "aesthetic-notes",
    "elegant-noir",
    "coquette-pearl",
    "lace-rose-deluxe",
    "flower-garden-deluxe",
    "romantic-rouge-deluxe",
    "romantic-blush-deluxe",
  ].includes(frame.decor);

  if (!hasCustomDecor) {
    // inner border
    ctx.strokeStyle = frame.accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.globalAlpha = 1;
  }

  drawDecor(ctx, frame);

  // slots
  for (let i = 0; i < frame.slots.length; i++) {
    const s = frame.slots[i];
    const x = s.x * W,
      y = s.y * H,
      w = s.w * W,
      h = s.h * H;

    // slot background
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(x, y, w, h);

    const src = photos[i];
    if (src) {
      try {
        const img = await loadImage(src);
        // cover fit
        const ir = img.width / img.height;
        const sr = w / h;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (ir > sr) {
          sw = img.height * sr;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / sr;
          sy = (img.height - sh) / 2;
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        (ctx as unknown as { filter: string }).filter = filterCss || "none";
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        (ctx as unknown as { filter: string }).filter = "none";
        ctx.restore();
      } catch {
        /* ignore */
      }
    } else {
      ctx.fillStyle = frame.accent;
      ctx.globalAlpha = 0.4;
      ctx.font = `500 ${Math.floor(h * 0.08)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Photo ${i + 1}`, x + w / 2, y + h / 2);
      ctx.globalAlpha = 1;
    }

    // photo border
    ctx.strokeStyle = hasCustomDecor ? frame.accent : frame.accent;
    ctx.globalAlpha = hasCustomDecor ? 0.9 : 0.35;
    ctx.lineWidth = hasCustomDecor ? 6 : 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }

  if (hasCustomDecor) return;

  // caption
  ctx.fillStyle = frame.accent;
  ctx.textAlign = "center";
  ctx.font = `italic 600 ${Math.floor(H * 0.028)}px "Playfair Display", serif`;
  ctx.fillText(frame.caption, W / 2, H - H * 0.08);
  ctx.font = `400 ${Math.floor(H * 0.018)}px Inter, sans-serif`;
  ctx.globalAlpha = 0.7;
  ctx.fillText("photostrip · lovable", W / 2, H - H * 0.05);
  ctx.globalAlpha = 1;
}
