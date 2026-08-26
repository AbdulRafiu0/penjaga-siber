/**
 * All coordinates are in millimeters (jsPDF unit = mm).
 *
 * These were NOT eyeballed — each one was measured by loading the actual
 * template PNGs, converting px -> mm using the known page sizes, and
 * detecting the real pixel bounds of the printed labels / blank lines /
 * rule lines with a threshold-based bounding-box scan. Where a field sits
 * on a shared row (e.g. the offer-letter table, the certificate's bottom
 * info bar), the anchor points (colon glyphs, icon columns) were detected
 * directly rather than assumed to be evenly spaced.
 *
 *   Certificate:     landscape 210x150 mm  (source PNG: 1024x731 px)
 *   Offer Letter:    A4 portrait 210x297 mm (source PNG: 1055x1491 px)
 *   Recommendation:  A4 portrait 210x297 mm (source PNG: 1080x1526 px)
 *
 * Conversion formula used: mm = (pixel / img_px) * page_mm
 *
 * IMPORTANT FIX vs the previous version of this file: the offer-letter
 * table rows are ~9mm apart, NOT ~17mm apart. The old y-values assumed
 * 17mm spacing, which pushed every value below "Intern Name" one full row
 * (or more) below its real label — that's why "Intern ID" was landing on
 * the "Department" line, "Program" was landing on "Duration", etc. The
 * certificate's bottom info row (period / duration / department / intern
 * ID / date of issue) had the opposite problem: all six values were
 * placed AT the icon/label row itself instead of below it, so values
 * were printing on top of the icons and labels.
 */

export const OFFER = {
  // Top-right date. The decorative dark header shape extends to ~y=38mm,
  // and the "INTERNSHIP OFFER LETTER" title starts at y=58.8mm, so this
  // sits in the clear band between them. Right-aligned so the date can
  // never run past the page edge (the old left-aligned x=185.1 did).
  issueDate: { x: 195, y: 48 },

  // "Dear ___" blank line runs from x=21 to x=62 at y=84.6-84.8 (baseline).
  internNameGreeting: { x: 24, y: 84.0 },

  // "Department: ___" blank line runs from x=170 to x=197.3, same baseline row.
  departmentHeader: { x: 173, y: 84.0 },

  // Internship Details table. Rows are anchored on the ":" glyph in each
  // label, measured at y = 131.0 / 140.6 / 149.6 / 158.6 / 167.8 (all five
  // rows, both columns share the same 5 baselines). Values start ~3mm
  // after the colon on each side.
  internName: { x: 59, y: 131.0 },
  internId: { x: 59, y: 140.6 },
  departmentTable: { x: 59, y: 149.6 },
  programTable: { x: 59, y: 158.6 },
  duration: { x: 59, y: 167.8 },

  startDate: { x: 150, y: 131.0 },
  endDate: { x: 150, y: 140.6 },
  internshipType: { x: 150, y: 149.6 },
  supervisor: { x: 150, y: 158.6 },
  mode: { x: 150, y: 167.8 },
};

export const CERTIFICATE = {
  // "CERTIFICATE ID:" label sits at y=10-11.6, its underline at y=17.5,
  // x=164.6-193.6. Value sits just above the line.
  certificateId: { x: 167, y: 16.8 },

  // The blank gold rule between the laurels (where the name goes) is at
  // y=70.6-71.6. "This is to certify that" ends at y=59.7, so there's
  // room for a large name baseline-aligned just above the rule.
  internName: { x: 105, y: 69.8 },

  // There is no separate blank line for the program name — the template's
  // baked-in text reads "...has successfully completed the ___ at Penjaga
  // Siber...", so the value must continue in-line right after "the".
  // MEASURED FIX: "the" actually ends at x=124.5mm (not 139.7 as previously
  // assumed) — the old x=141 left a ~16.5mm dead gap that made the program
  // name look like a disconnected floating label instead of a continuation
  // of the sentence. x=126 leaves a normal single-word gap after "the".
  program: { x: 126, y: 80.5 },

  // The intern name, repeated inline at the START of the same
  // "has successfully completed the ___" line (that line's static text
  // begins at x=80 — this sits in the gap just before it, on the same
  // baseline).
  internNameInline: { x: 64, y: 80.5 },

  // Bottom info row: icon+label pairs were measured at these x-centers
  // (icon left edge to end of label text): period 18.9-44.1 (mid 31.5),
  // duration 54.6-72.4 (mid 63.5), department 89.4-119.4 (mid 104.4),
  // intern ID 129.0-145.6 (mid 137.3), date of issue 158.1-178.4 (mid
  // 168.25). The label row itself sits at y=99.5-101.3, and the
  // signature block ("Abdul Rafiu") starts at y=105 directly under the
  // period/duration columns — so values must sit in the narrow y=104.3
  // band below the labels and just above the signature.
  //
  // NOTE ON THIS ROW: the icon glyphs bottom out at y=102.7mm and the
  // signature block starts at y=105mm — only ~2.3mm of clear space for
  // period/duration, which sit directly under the signature. There is no
  // coordinate fix for that; it is a template layout constraint. Small
  // font sizes below are deliberate, not a mistake. department/internId/
  // dateOfIssue have more room (the seal badge doesn't start until
  // y=111.7).
  //
  // ALIGNMENT FIX: department/internId/issueDate previously sat at
  // y=105.3 while period/duration sat at y=104.6 — a rendered baseline
  // that's ~1mm lower, which reads as a visibly uneven row (measured on
  // the actual output: baselines at px 825/822 vs 832/828/832). All five
  // now share the same y=104.6 baseline. This is safe for
  // department/internId/issueDate — moving them UP takes them further
  // from the seal badge (y=111.7), not closer to anything.
  //
  // period is LEFT-aligned (not centered) starting right after the
  // calendar icon (which ends at x=24.6). The other bottom row fields
  // follow the same left-aligned pattern, shifted ~8mm from their column start
  // to ensure sufficient clearance from the icons.
  period: { x: 26, y: 104.6 },
  duration: { x: 63, y: 104.6 },
  department: { x: 99, y: 104.6 },
  internId: { x: 138, y: 104.6 },
  issueDate: { x: 167, y: 104.6 },
};

export const RECOMMENDATION = {
  // "Date:" label is at x=154.4-163.1, y=60.1-62.7. Value follows it.
  issueDate: { x: 166, y: 62.5 },

  // "It is my pleasure to recommend ___ (Intern ID: [ ___ ]) for future..."
  // Name blank runs x=71.8-102.9. ID blank runs x=122.1-145.9. Both sit
  // on the same text baseline, measured at y=81.3 (not y=80.4 — close,
  // but the previous value was still slightly high).
  internName: { x: 74, y: 81.3 },
  // Paired with 8pt in recommendation.ts (not the name's 12pt) so a
  // full-length ID like "SEC-2026-C843" clears the "]" bracket at
  // x=145.9 with real margin instead of running right up against it.
  internId: { x: 122, y: 81.3 },
};

// ============================================================================
// CERTIFICATE GENERATION WIRING
// ============================================================================

export const generateCertificate = async ({ application, internName, offerFields }: any) => {
  console.log("Certificate generation triggered with data:", { application, internName, offerFields });
  alert("Certificate generation is being wired up. Check the console for the passed data!");
};