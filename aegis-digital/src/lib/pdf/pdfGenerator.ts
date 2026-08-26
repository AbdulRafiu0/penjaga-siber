import jsPDF from "jspdf";
import type { jsPDFOptions } from "jspdf";

export interface TemplateOptions {
  orientation?: "portrait" | "landscape";
  format?: jsPDFOptions["format"];
  imageType?: "PNG" | "JPEG";
}

const DEFAULT_OPTIONS: TemplateOptions = {
  orientation: "portrait",
  format: "a4",
  imageType: "PNG",
};

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function createTemplatePDF(
  templatePath: string,
  options: TemplateOptions = DEFAULT_OPTIONS
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: "mm",
    format: options.format,
  });

  const img = await loadImage(templatePath);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Unable to create canvas.");

  ctx.drawImage(img, 0, 0);

  const data = canvas.toDataURL(
    options.imageType === "JPEG" ? "image/jpeg" : "image/png"
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addImage(data, options.imageType || "PNG", 0, 0, pageWidth, pageHeight);
  return doc;
}

export function addCenteredText(
  doc: jsPDF,
  text: string,
  y: number,
  fontSize = 12,
  font = "helvetica",
  style: "normal" | "bold" | "italic" = "normal",
  color = "#0f2347"
) {
  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  
  const width = doc.internal.pageSize.getWidth();
  doc.text(text, width / 2, y, { align: "center" });
}

export function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize = 10,
  style: "normal" | "bold" | "italic" = "normal",
  align: "left" | "center" | "right" = "left",
  font = "helvetica",
  color = "#333333"
) {
  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  doc.setTextColor(color);
  doc.text(text, x, y, { align });
}

/**
 * Like addText, but shrinks the font (down to minFontSize) until the
 * string fits within maxWidthMm. Use this for any field placed in a
 * fixed-width gap in these templates (inline text between two pieces of
 * baked-in artwork, a value squeezed between an icon and the next
 * column, etc.) where the incoming data length isn't guaranteed — a
 * fixed font size that happens to fit "Rahman" or "SEC-2026-C843" will
 * silently overflow for a longer name or ID.
 */
export function addTextFit(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidthMm: number,
  fontSize = 11,
  style: "normal" | "bold" | "italic" = "normal",
  align: "left" | "center" | "right" = "left",
  font = "helvetica",
  color = "#333333",
  minFontSize = 6
) {
  doc.setFont(font, style);
  let size = fontSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidthMm && size > minFontSize) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  doc.setTextColor(color);
  doc.text(text, x, y, { align });
  return size;
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Compact "24 Jul - 24 Oct 2026" style range for tight spaces (e.g. the
 * certificate's bottom info row, which only has a few mm of vertical
 * clearance and no room for a full "July 24, 2026 - October 24, 2026"
 * string). Falls back to the raw strings if either date can't be parsed.
 */
export function formatDateRangeShort(
  start?: string | Date | null,
  end?: string | Date | null
): string {
  if (!start || !end) return "";
  const ds = new Date(start);
  const de = new Date(end);
  if (isNaN(ds.getTime()) || isNaN(de.getTime())) {
    return `${start} - ${end}`;
  }
  const dayMonth = (d: Date) =>
    d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  const dayMonthYear = (d: Date) =>
    d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  if (ds.getFullYear() === de.getFullYear()) {
    return `${dayMonth(ds)} - ${dayMonthYear(de)}`;
  }
  return `${dayMonthYear(ds)} - ${dayMonthYear(de)}`;
}

export function savePDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}