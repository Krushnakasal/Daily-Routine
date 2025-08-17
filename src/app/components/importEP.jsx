"use client";

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function FileTableViewer() {
  const [pdfjs, setPdfjs] = useState(null);
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load PDF.js dynamically
  useEffect(() => {
    (async () => {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");

      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      setPdfjs(pdfjsLib);
    })();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setTableData([]);
    setLoading(true);

    if (selectedFile.type === "application/pdf") {
      // PDF processing
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjs.getDocument(typedarray).promise;

        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const rowText = content.items.map((item) => item.str);
          const rows = rowText.map((line) => line.split(/\s{2,}/));
          rows.forEach((r) => pages.push(r));
        }
        setTableData(pages);
        setLoading(false);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } else if (
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selectedFile.type === "application/vnd.ms-excel"
    ) {
      // Excel processing
      const fileReader = new FileReader();
      fileReader.onload = function (evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setTableData(json);
        setLoading(false);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      alert("Unsupported file type");
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    XLSX.writeFile(workbook, "table_data.xlsx");
  };

  const uploadExcel = async () => {
    const worksheet = XLSX.utils.aoa_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "table_data.xlsx"
    );

    const res = await fetch("/api/upload-excel", {
      method: "POST",
      body: formData,
    });

    if (res.ok) alert("Excel uploaded successfully!");
    else alert("Failed to upload Excel.");
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload PDF or Excel</h1>
      <input
        type="file"
        accept=".pdf, .xlsx, .xls"
        onChange={handleFileChange}
        className="mb-4"
      />

      {loading && <p>Processing file...</p>}

      {tableData.length > 0 && (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="border-collapse border border-gray-300 w-full">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border px-2 py-1 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Download Excel
            </button>

            <button
              onClick={uploadExcel}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Upload Excel to Backend
            </button>
          </div>
        </>
      )}
    </div>
  );
}
