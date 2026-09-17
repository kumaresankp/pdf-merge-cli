#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

async function mergePDFs(inputFiles, outputFile) {
  const mergedPdf = await PDFDocument.create();

  for (const file of inputFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    if (path.extname(file).toLowerCase() !== ".pdf") {
      throw new Error(`Not a PDF file: ${file}`);
    }

    console.log(`Adding: ${file}`);

    const pdfBytes = fs.readFileSync(file);
    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    pages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  const mergedBytes = await mergedPdf.save();

  fs.writeFileSync(outputFile, mergedBytes);
}

function showHelp() {
  console.log(`
PDF Toolkit

Usage:
  pdf-toolkit merge <files...> -o <output>

Examples:
  pdf-toolkit merge a.pdf b.pdf -o merged.pdf
  pdf-toolkit merge *.pdf -o merged.pdf

Options:
  -o, --output    Output PDF filename
  -h, --help      Show help
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  const command = args[0];

  if (command !== "merge") {
    console.error(`❌ Unknown command: ${command}`);
    console.log("Run 'pdf-toolkit --help' for usage.");
    process.exit(1);
  }

  const files = [];
  let outputFile = "merged.pdf";

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "-o" || args[i] === "--output") {
      outputFile = args[i + 1];
      i++;
    } else {
      files.push(args[i]);
    }
  }

  if (files.length < 2) {
    console.error("❌ Please provide at least two PDF files.");
    console.log(
      "Example: pdf-toolkit merge a.pdf b.pdf -o merged.pdf"
    );
    process.exit(1);
  }

  try {
    console.log("\n📄 PDF Toolkit");
    console.log("---------------");

    await mergePDFs(files, outputFile);

    console.log(`\n✅ Successfully created: ${outputFile}`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();