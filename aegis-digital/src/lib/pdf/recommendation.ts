import type { DocumentData } from "./types";
import {
  createTemplatePDF,
  addText,
  addTextFit,
  formatDate,
  savePDF,
} from "./pdfGenerator";
import { RECOMMENDATION } from "./coordinates";

export async function generateRecommendation({
  application,
  internName,
}: DocumentData): Promise<void> {
  const doc = await createTemplatePDF("/templates/recommendation.png");

  const internId = application.internId ?? "Pending";
  const issueDate = formatDate(application.createdAt);

  const themeBlue = "#0f2347";
  const themeGray = "#333333";

  addText(doc, issueDate, RECOMMENDATION.issueDate.x, RECOMMENDATION.issueDate.y, 10, "normal", "left", "helvetica", themeGray);

  addText(doc, internName, RECOMMENDATION.internName.x, RECOMMENDATION.internName.y, 12, "bold", "left", "times", themeBlue);
  // This sits inside "(Intern ID: [ ___ ])" — the closing bracket is only
  // ~24mm from the start of the value, so addTextFit shrinks longer IDs
  // instead of letting them run past the "]".
  // FIX: was 9pt/normal/gray, which rendered visibly smaller and a
  // different color than the bold navy "(Intern ID: [ ... ])" text
  // wrapped around it — looked like a stray subscript instead of a filled
  // field. Matched it to the same bold/navy treatment used for the name.
  addTextFit(doc, internId, RECOMMENDATION.internId.x, RECOMMENDATION.internId.y, 23, 11, "bold", "left", "helvetica", themeBlue);

  savePDF(doc, `${internName}-Recommendation-Letter.pdf`);
}