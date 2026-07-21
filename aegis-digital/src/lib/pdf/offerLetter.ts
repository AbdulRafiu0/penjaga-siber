import type { DocumentData } from "./types";
import {
  createTemplatePDF,
  generateQRCode,
  addQRCode,
  addText,
  formatDate,
  savePDF,
} from "./pdfGenerator";

import { OFFER } from "./coordinates";

export async function generateOfferLetter({
  application,
  internName,
  offerFields,
}: DocumentData) {
  // Initialize the PDF document from the template
const doc = await createTemplatePDF("/templates/offerletter.png");

  // -----------------------------
  // Extract Data (Mapped via Step 3)
  // -----------------------------

  const internId = application.internId || "Pending";

  const program = application.programName ?? "Internship Program";

  const department = offerFields.department;

  const supervisor = offerFields.supervisor;

  const duration = offerFields.duration;

  const internshipMode = offerFields.internshipMode;

  const startDate = offerFields.startDate;

  const endDate = offerFields.endDate;

  const issueDate = formatDate(new Date());

  const offerId = application.id;

  // -----------------------------
  // QR
  // -----------------------------

  const verificationURL = `${window.location.origin}/verify/${offerId}`;

  const qr = await generateQRCode(verificationURL);

  // -----------------------------
  // Fill Template
  // -----------------------------

  addText(doc, issueDate, OFFER.issueDate.x, OFFER.issueDate.y, 11);

  addText(doc, offerId, OFFER.offerIdTop.x, OFFER.offerIdTop.y, 12, "bold");

  addText(
    doc,
    offerId,
    OFFER.offerIdBottom.x,
    OFFER.offerIdBottom.y,
    11,
    "bold"
  );

  addText(
    doc,
    internName,
    OFFER.internNameGreeting.x,
    OFFER.internNameGreeting.y,
    12,
    "bold"
  );

  addText(doc, department, OFFER.department.x, OFFER.department.y);

  addText(doc, program, OFFER.program.x, OFFER.program.y);

  addText(doc, internName, OFFER.internName.x, OFFER.internName.y);

  addText(doc, internId, OFFER.internId.x, OFFER.internId.y);

  addText(doc, department, OFFER.departmentTable.x, OFFER.departmentTable.y);

  addText(doc, program, OFFER.programTable.x, OFFER.programTable.y);

  addText(doc, duration, OFFER.duration.x, OFFER.duration.y);

  addText(doc, startDate, OFFER.startDate.x, OFFER.startDate.y);

  addText(doc, endDate, OFFER.endDate.x, OFFER.endDate.y);

  addText(
    doc,
    internshipMode,
    OFFER.internshipType.x,
    OFFER.internshipType.y
  );

  addText(doc, supervisor, OFFER.supervisor.x, OFFER.supervisor.y);

  addText(doc, offerFields.mode, OFFER.mode.x, OFFER.mode.y);

  addQRCode(
    doc,
    qr,
    OFFER.qr.x,
    OFFER.qr.y,
    OFFER.qr.size
  );

  // -----------------------------
  // Download
  // -----------------------------

  savePDF(
    doc,
    `${internName}-Offer-Letter.pdf`
  );
}