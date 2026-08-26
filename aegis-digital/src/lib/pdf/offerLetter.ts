import type { DocumentData } from "./types";
import {
  createTemplatePDF,
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
  const doc = await createTemplatePDF("/templates/offerletter.png");

  const internId = application.internId || "Pending";
  const program = application.programName ?? "Internship Program";
  const issueDate = formatDate(new Date());

  const themeBlue = "#0f2347";
  const themeGray = "#333333";

  // --- Header: date (right-aligned so it can never overrun the page edge) ---
  addText(doc, issueDate, OFFER.issueDate.x, OFFER.issueDate.y, 10, "normal", "right", "helvetica", themeGray);

  // --- Greeting line: "Dear ___" / "Department: ___" ---
  addText(doc, internName, OFFER.internNameGreeting.x, OFFER.internNameGreeting.y, 12, "bold", "left", "times", themeBlue);
  addText(doc, offerFields.department, OFFER.departmentHeader.x, OFFER.departmentHeader.y, 9.5, "normal", "left", "helvetica", themeGray);

  // --- Internship Details table (5 rows, ~9mm apart) ---
  addText(doc, internName, OFFER.internName.x, OFFER.internName.y, 10, "bold", "left", "times", themeBlue);
  addText(doc, internId, OFFER.internId.x, OFFER.internId.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.department, OFFER.departmentTable.x, OFFER.departmentTable.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, program, OFFER.programTable.x, OFFER.programTable.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.duration, OFFER.duration.x, OFFER.duration.y, 9, "normal", "left", "helvetica", themeGray);

  addText(doc, offerFields.startDate, OFFER.startDate.x, OFFER.startDate.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.endDate, OFFER.endDate.x, OFFER.endDate.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.internshipMode, OFFER.internshipType.x, OFFER.internshipType.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.supervisor, OFFER.supervisor.x, OFFER.supervisor.y, 9, "normal", "left", "helvetica", themeGray);
  addText(doc, offerFields.mode, OFFER.mode.x, OFFER.mode.y, 9, "normal", "left", "helvetica", themeGray);

  savePDF(doc, `${internName}-Offer-Letter.pdf`);
}