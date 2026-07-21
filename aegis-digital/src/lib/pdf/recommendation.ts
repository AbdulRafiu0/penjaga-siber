import type { DocumentData } from "./types";
import {
  createTemplatePDF,
  generateQRCode,
  addQRCode,
  addText,
  formatDate,
  savePDF,
} from "./pdfGenerator";

import { RECOMMENDATION } from "./coordinates";

export async function generateRecommendation({
  application,
  internName,
  offerFields,
}: DocumentData): Promise<void> {

  const doc = await createTemplatePDF(
    "/templates/recommendation.png"
  );

  // -----------------------------------
  // Extract Data
  // -----------------------------------

  const internId = application.internId ?? "Pending";

  const program = application.programName ?? "Internship Program";

  const startDate = offerFields.startDate;

  const endDate = offerFields.endDate;

  const issueDate = formatDate(application.createdAt);

  const recommendationId = application.id;

  // -----------------------------------
  // Verification QR
  // -----------------------------------

  const verificationURL =
    `${window.location.origin}/verify/${recommendationId}`;

  const qr =
    await generateQRCode(verificationURL);

  // -----------------------------------
  // Fill Dynamic Fields
  // -----------------------------------

  addText(
    doc,
    issueDate,
    RECOMMENDATION.issueDate.x,
    RECOMMENDATION.issueDate.y
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.greetingName.x,
    RECOMMENDATION.greetingName.y,
    11,
    "bold"
  );

  addText(
    doc,
    internId,
    RECOMMENDATION.internId.x,
    RECOMMENDATION.internId.y
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.paragraph2Name.x,
    RECOMMENDATION.paragraph2Name.y,
    11,
    "bold"
  );

  addText(
    doc,
    program,
    RECOMMENDATION.program.x,
    RECOMMENDATION.program.y
  );

  addText(
    doc,
    startDate,
    RECOMMENDATION.startDate.x,
    RECOMMENDATION.startDate.y
  );

  addText(
    doc,
    endDate,
    RECOMMENDATION.endDate.x,
    RECOMMENDATION.endDate.y
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.paragraph3Name.x,
    RECOMMENDATION.paragraph3Name.y,
    11,
    "bold"
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.paragraph4Name.x,
    RECOMMENDATION.paragraph4Name.y,
    11,
    "bold"
  );

  addText(
    doc,
    program,
    RECOMMENDATION.program2.x,
    RECOMMENDATION.program2.y
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.paragraph5Name.x,
    RECOMMENDATION.paragraph5Name.y,
    11,
    "bold"
  );

  addText(
    doc,
    internName,
    RECOMMENDATION.paragraph6Name.x,
    RECOMMENDATION.paragraph6Name.y,
    11,
    "bold"
  );

  addText(
    doc,
    recommendationId,
    RECOMMENDATION.recommendationId.x,
    RECOMMENDATION.recommendationId.y,
    10,
    "bold"
  );

  addText(
    doc,
    issueDate,
    RECOMMENDATION.issueDateBottom.x,
    RECOMMENDATION.issueDateBottom.y
  );

  addQRCode(
    doc,
    qr,
    RECOMMENDATION.qr.x,
    RECOMMENDATION.qr.y,
    RECOMMENDATION.qr.size
  );

  // -----------------------------------
  // Download
  // -----------------------------------

  savePDF(
    doc,
    `${internName}-Recommendation-Letter.pdf`
  );
}