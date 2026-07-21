import type { DocumentData } from "./types";
import {
  createTemplatePDF,
  generateQRCode,
  addQRCode,
  addCenteredText,
  addText,
  formatDate,
  savePDF,
} from "./pdfGenerator";

import { CERTIFICATE } from "./coordinates";

export async function generateCertificate({
  application,
  internName,
  offerFields,
}: DocumentData): Promise<void> {
const doc = await createTemplatePDF(
  "/templates/certificate.png",
  {
    orientation: "landscape",
    format: [210, 150],
  }
);

  // ---------------------------------
  // Extract Data
  // ---------------------------------

  const internId = application.internId ?? "Pending";

  const program = application.programName ?? "Internship Program";

  const department = offerFields.department;

  const duration = offerFields.duration;

  const startDate = offerFields.startDate;

  const endDate = offerFields.endDate;

  const issueDate = formatDate(application.createdAt);

  const certificateId = application.id;

  // ---------------------------------
  // QR Code
  // ---------------------------------

  const verificationURL =
    `${window.location.origin}/verify/${certificateId}`;

  const qr = await generateQRCode(
    verificationURL
  );

  // ---------------------------------
  // Fill Certificate
  // ---------------------------------

  addText(
    doc,
    certificateId,
    CERTIFICATE.certificateId.x,
    CERTIFICATE.certificateId.y,
    11,
    "bold"
  );

  // Large centered name
  addCenteredText(
    doc,
    internName,
    CERTIFICATE.internName.y,
    24,
    "times",
    "bold"
  );

  addText(
    doc,
    program,
    CERTIFICATE.program.x,
    CERTIFICATE.program.y,
    13
  );

  addText(
    doc,
    startDate,
    CERTIFICATE.periodStart.x,
    CERTIFICATE.periodStart.y
  );

  addText(
    doc,
    endDate,
    CERTIFICATE.periodEnd.x,
    CERTIFICATE.periodEnd.y
  );

  addText(
    doc,
    duration,
    CERTIFICATE.duration.x,
    CERTIFICATE.duration.y
  );

  addText(
    doc,
    department,
    CERTIFICATE.department.x,
    CERTIFICATE.department.y
  );

  addText(
    doc,
    internId,
    CERTIFICATE.internId.x,
    CERTIFICATE.internId.y
  );

  addText(
    doc,
    issueDate,
    CERTIFICATE.issueDate.x,
    CERTIFICATE.issueDate.y
  );

  addQRCode(
    doc,
    qr,
    CERTIFICATE.qr.x,
    CERTIFICATE.qr.y,
    CERTIFICATE.qr.size
  );

  // ---------------------------------
  // Download
  // ---------------------------------

  savePDF(
    doc,
    `${internName}-Internship-Certificate.pdf`
  );
}