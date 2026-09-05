import { chartSections, type ChartRow } from "./chart";

const W = 1200;
const H = 1800;
const BG = "#07140d";
const INK = "#f4ecd6";
const GOLD = "#d4b45a";
const MUTED = "#9caf98";
const FAINT = "#6d8570";

export interface BagCardMeta {
  mph: number;
  gender: "men" | "women";
  loftLabel: string;
  place?: string;
  flightPct?: number;
}

export function bagCardFilename(mph: number) {
  return `bag-chart-${mph}mph.png`;
}

export async function renderBagCardPng(rows: ChartRow[], meta: BagCardMeta): Promise<Blob> {
  await Promise.race([
    document.fonts.ready,
    new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  drawBagCard(ctx, rows, meta);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not export card");
  return blob;
}

function isAppleTouch() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export async function saveBagCardPng(rows: ChartRow[], meta: BagCardMeta) {
  const blob = await renderBagCardPng(rows, meta);
  const name = bagCardFilename(meta.mph);
  const file = new File([blob], name, { type: "image/png" });
  if (isAppleTouch()) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Bag Chart" });
        return "shared";
      }
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return "downloaded";
}

function drawBagCard(ctx: CanvasRenderingContext2D, rows: ChartRow[], meta: BagCardMeta) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.strokeStyle = "rgba(212,180,90,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.fillStyle = GOLD;
  ctx.font = "italic 500 72px Fraunces, Times New Roman, serif";
  ctx.textAlign = "center";
  ctx.fillText("Bag Chart", W / 2, 160);

  ctx.fillStyle = MUTED;
  ctx.font = "500 28px Figtree, sans-serif";
  const bits = [
    `${meta.mph} mph`,
    `Dr ${meta.loftLabel}°`,
    meta.gender === "women" ? "Women" : "Men",
  ];
  ctx.fillText(bits.join("  ·  "), W / 2, 214);

  if (meta.place && meta.flightPct) {
    ctx.fillStyle = FAINT;
    ctx.font = "400 24px Figtree, sans-serif";
    ctx.fillText(`${meta.place}  ·  ${meta.flightPct}% flight`, W / 2, 256);
  }

  const top = meta.place && meta.flightPct ? 300 : 268;
  ctx.strokeStyle = "rgba(244,236,214,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(88, top);
  ctx.lineTo(W - 88, top);
  ctx.stroke();

  const footerY = H - 130;
  const tableTop = top + 28;
  const headerH = 44;
  const tableH = footerY - 40 - tableTop - headerH;
  const sections = chartSections(rows);
  // Club rows + one slot per section header so PNG matches the Chart card.
  const slotCount =
    rows.length === 0 ? 1 : rows.length + sections.length;
  const rowH = tableH / Math.max(slotCount, 1);

  ctx.fillStyle = FAINT;
  ctx.font = "600 22px Figtree, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CLUB", 110, tableTop + 32);
  ctx.textAlign = "right";
  ctx.fillText("CARRY", W - 320, tableTop + 32);
  ctx.fillText("TOTAL", W - 110, tableTop + 32);

  if (rows.length === 0) {
    ctx.fillStyle = MUTED;
    ctx.font = "500 32px Figtree, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Turn on clubs in Bag", W / 2, tableTop + tableH / 2);
  } else {
    let slot = 0;
    for (const section of sections) {
      const hy = tableTop + headerH + rowH * slot + rowH * 0.62;
      ctx.fillStyle = FAINT;
      ctx.font = "600 20px Figtree, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(section.label.toUpperCase(), 110, hy);
      slot += 1;
      for (const row of section.rows) {
        const y = tableTop + headerH + rowH * slot + rowH * 0.68;
        ctx.fillStyle = INK;
        ctx.font = "600 40px Figtree, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(row.label, 110, y);
        if (row.isYours) {
          const tw = ctx.measureText(row.label).width;
          ctx.fillStyle = GOLD;
          ctx.font = "700 18px Figtree, sans-serif";
          ctx.fillText("YOURS", 110 + tw + 16, y - 4);
        }
        ctx.fillStyle = GOLD;
        ctx.font = "600 48px Figtree, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round(row.carry)), W - 320, y);
        ctx.fillStyle = INK;
        ctx.fillText(String(Math.round(row.total)), W - 110, y);
        slot += 1;
      }
    }
  }

  ctx.strokeStyle = "rgba(244,236,214,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(88, footerY - 24);
  ctx.lineTo(W - 88, footerY - 24);
  ctx.stroke();

  ctx.fillStyle = FAINT;
  ctx.font = "500 24px Figtree, sans-serif";
  ctx.textAlign = "center";
  const yours = rows.filter((r) => r.isYours).length;
  const foot = [
    "Yards",
    yours ? `${yours} YOURS` : "Model",
    new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
  ];
  ctx.fillText(foot.join("  ·  "), W / 2, footerY + 20);
}
