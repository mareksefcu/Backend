const PDFDocument = require("pdfkit");
const zapisekDao = require("../dao/zapisek.js");

async function DownloadAbl(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        code: "missingName",
        message: "Missing 'name' in request body.",
      });
    }

    // Fetch the zapisek by name
    const zapisky = await zapisekDao.list();
    const zapisek = zapisky.find(z => z.name === name);

    if (!zapisek) {
      return res.status(404).json({
        code: "zapisekNotFound",
        message: `No zapisek found with name '${name}'.`,
      });
    }

    // Create the PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename="${name}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text(zapisek.name, { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Category: ${zapisek.categoryName || "N/A"}`);
    doc.moveDown();
    doc.fontSize(12).text(`Details:\n${zapisek.details || "No details provided."}`);
    doc.moveDown();
    doc.fontSize(10).text(`Generated at: ${new Date().toLocaleString()}`);

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({
      code: "failedToGeneratePdf",
      message: "Could not generate PDF.",
      error: err.message,
    });
  }
}

module.exports = DownloadAbl;
