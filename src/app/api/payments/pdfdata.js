// pages/api/pdfdata.js
import fs from "fs";
import path from "path";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export default async function handler(req, res) {
  const pdfPath = path.resolve("./public/sample.pdf"); // PDF path
  const pdfData = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  const allText = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str);
    allText.push(pageText);
  }

  // Example: simple table parse (depends on your PDF structure)
  // Assume CSV-like: each row is separated by "\n", each column by whitespace
  const tableData = allText.flat().map((line) => line.split(/\s+/));

  res.status(200).json({ tableData });
}
