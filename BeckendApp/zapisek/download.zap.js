const PDFDocument = require("pdfkit");
const zapisekDao = require("../dao/zapisek.js");

async function DownloadAbl(req, res) {
  try {
    console.log("Received download request:", req.body);
    const { name } = req.body;

    if (!name) {
      console.log("Missing name in request");
      return res.status(400).json({
        code: "missingName",
        message: "Missing 'name' in request body.",
      });
    }

    // Fetch the zapisek directly using DAO
    const zapisek = await zapisekDao.getByName(name);
    console.log("Found zapisek:", zapisek);

    if (!zapisek) {
      console.log(`No zapisek found with name: ${name}`);
      return res.status(404).json({
        code: "zapisekNotFound",
        message: `No zapisek found with name '${name}'.`,
      });
    }

    try {
      // Create the PDF
      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader("Content-Disposition", `attachment; filename="${name}.pdf"`);
      res.setHeader("Content-Type", "application/pdf");
      
      // Pipe the PDF document to the response
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text(zapisek.name, { underline: true });
      doc.moveDown();
      doc.fontSize(14).text(`Category: ${zapisek.categoryName || "N/A"}`);
      doc.moveDown();
      doc.fontSize(12).text(`Details:\n${zapisek.details || "No details provided."}`);
      doc.moveDown();
      doc.fontSize(10).text(`Generated at: ${new Date().toLocaleString()}`);

      // Finalize the PDF and end the stream
      doc.end();
      
      console.log("PDF generated successfully for:", name);
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return res.status(500).json({
        code: "pdfGenerationError",
        message: "Error generating PDF document",
        error: pdfError.message,
      });
    }
  } catch (err) {
    console.error("Error in download handler:", err);
    res.status(500).json({
      code: "failedToGeneratePdf",
      message: "Could not generate PDF.",
      error: err.message,
    });
  }
}

module.exports = DownloadAbl;
