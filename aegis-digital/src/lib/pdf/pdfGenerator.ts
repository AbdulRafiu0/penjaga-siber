import jsPDF from "jspdf";
import QRCode from "qrcode";

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

/**
 * Loads an image from /public and converts it into a DataURL
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);

    image.onerror = reject;

    image.src = src;
  });
}

/**
 * Creates a PDF with the template image as a full-page background
 */
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

  if (!ctx) {
    throw new Error("Unable to create canvas.");
  }

  ctx.drawImage(img, 0, 0);

  const data = canvas.toDataURL(
    options.imageType === "JPEG" ? "image/jpeg" : "image/png"
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addImage(
    data,
    options.imageType || "PNG",
    0,
    0,
    pageWidth,
    pageHeight
  );

  return doc;
}

/**
 * Generates a QR code as a DataURL
 */
export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "H",
  });
}

/**
 * Draw QR code onto the PDF
 */
export function addQRCode(
  doc: jsPDF,
  qr: string,
  x: number,
  y: number,
  size: number
) {
  doc.addImage(qr, "PNG", x, y, size, size);
}

/**
 * Centered text helper
 */
export function addCenteredText(
  doc: jsPDF,
  text: string,
  y: number,
  fontSize = 12,
  font = "helvetica",
  style: "normal" | "bold" = "normal"
) {
  doc.setFont(font, style);

  doc.setFontSize(fontSize);

  const width = doc.internal.pageSize.getWidth();

  doc.text(text, width / 2, y, {
    align: "center",
  });
}

/**
 * Left aligned helper
 */
export function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize = 10,
  style: "normal" | "bold" = "normal"
) {
  doc.setFont("helvetica", style);

  doc.setFontSize(fontSize);

  doc.text(text, x, y);
}

/**
 * Formats dates consistently
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Downloads the PDF
 */
export function savePDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}