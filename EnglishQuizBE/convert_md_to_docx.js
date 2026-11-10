/**
 * Converter: Markdown (docs/course-project-report.md) -> Microsoft Word (.docx)
 * Specifically builds a professional academic report matching Group 5 format.
 * Fixes text overlapping by enforcing LineRuleType.AUTO and proper paragraph margins.
 * Only 2 team members: Lê Duy and Nguyễn Tuấn Minh.
 */

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  ImageRun,
  LineRuleType,
} = require("docx");

// Color Palette
const COLOR_PRIMARY = "1E3A8A"; // Deep Navy
const COLOR_SECONDARY = "2563EB"; // Blue
const COLOR_TEXT = "1F2937"; // Charcoal
const COLOR_MUTED = "4B5563"; // Slate
const COLOR_BORDER = "CBD5E1"; // Light Slate
const COLOR_BG_HEADER = "F1F5F9"; // Light blue-gray
const COLOR_CODE_BG = "F8FAFC"; // Code background
const COLOR_CODE_TEXT = "0F766E"; // Dark Teal

// Helper to parse inline bold, italics, code, links
function parseInline(rawText, baseOpts = {}) {
  if (!rawText) return [new TextRun({ text: "", ...baseOpts })];

  // Clean markdown links [text](url) -> text
  // Replace newlines with spaces inside inline text so Word does not suffer line corruption
  let cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  const runs = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: cleaned.substring(lastIndex, match.index),
          size: 22, // 11pt
          font: "Arial",
          color: COLOR_TEXT,
          ...baseOpts,
        })
      );
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          bold: true,
          size: 22,
          font: "Arial",
          color: COLOR_TEXT,
          ...baseOpts,
        })
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
          size: 22,
          font: "Arial",
          color: COLOR_TEXT,
          ...baseOpts,
        })
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: "Consolas",
          color: COLOR_CODE_TEXT,
          size: 20,
          ...baseOpts,
        })
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    runs.push(
      new TextRun({
        text: cleaned.substring(lastIndex),
        size: 22,
        font: "Arial",
        color: COLOR_TEXT,
        ...baseOpts,
      })
    );
  }

  return runs.length > 0
    ? runs
    : [new TextRun({ text: cleaned, size: 22, font: "Arial", color: COLOR_TEXT, ...baseOpts })];
}

// Extract true JPEG dimensions from buffer header
function getJpegDimensions(buf) {
  try {
    for (let i = 0; i < buf.length - 8; i++) {
      if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        if (w > 0 && h > 0) return { w, h };
      }
    }
  } catch (e) {
    // fallback
  }
  return { w: 520, h: 320 };
}

// Fetch Mermaid Diagram as Image Buffer
async function fetchMermaidImage(mermaidCode) {
  try {
    const cleanCode = mermaidCode.trim();
    const b64 = Buffer.from(cleanCode).toString("base64");
    const url = `https://mermaid.ink/img/${b64}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 500) {
        return buffer;
      }
    }
  } catch (err) {
    console.warn(`[Mermaid] Warning: Unable to render diagram via mermaid.ink: ${err.message}`);
  }
  return null;
}

// Format a clean Code Block table
function createCodeBlock(codeText) {
  const lines = codeText.split("\n");
  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: line || " ",
            font: "Consolas",
            size: 18,
            color: "1E293B",
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 16, color: COLOR_SECONDARY },
      right: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: COLOR_CODE_BG },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  });
}

async function convertMarkdownToDocx() {
  const mdPath = path.join(__dirname, "..", "docs", "course-project-report.md");
  const outputPath = path.join(
    __dirname,
    "..",
    "docs",
    "Course Project Report - EnglishQuiz Platform.docx"
  );
  const outputRoot = path.join(
    __dirname,
    "..",
    "Course Project Report - EnglishQuiz Platform.docx"
  );

  console.log(`Reading Markdown from: ${mdPath}`);
  const mdContent = fs.readFileSync(mdPath, "utf-8");

  // Dynamic import of marked
  const markedModule = await import("marked");
  const tokens = markedModule.marked.lexer(mdContent);
  console.log(`Parsed ${tokens.length} markdown tokens.`);

  const children = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "heading") {
      const text = token.text;
      const depth = token.depth;

      // Add page breaks before major top-level chapters
      const shouldPageBreak =
        depth === 1 &&
        (text.startsWith("I. ") ||
          text.startsWith("II. ") ||
          text.startsWith("III. ") ||
          text.startsWith("IV. ") ||
          text.startsWith("V. ") ||
          text.startsWith("VI. ") ||
          text.includes("Table of Contents") ||
          text.includes("Record of Changes") ||
          text.includes("Conclusion"));

      if (depth === 1) {
        children.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: shouldPageBreak,
            spacing: { before: 360, after: 160, line: 360, lineRule: LineRuleType.AUTO },
            run: { size: 30, bold: true, color: COLOR_PRIMARY, font: "Arial" },
          })
        );
      } else if (depth === 2) {
        children.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 260, after: 120, line: 320, lineRule: LineRuleType.AUTO },
            run: { size: 26, bold: true, color: COLOR_SECONDARY, font: "Arial" },
          })
        );
      } else {
        children.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 80, line: 280, lineRule: LineRuleType.AUTO },
            run: { size: 22, bold: true, color: COLOR_TEXT, font: "Arial" },
          })
        );
      }
    } else if (token.type === "paragraph") {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80, line: 280, lineRule: LineRuleType.AUTO },
          children: parseInline(token.text),
        })
      );
    } else if (token.type === "blockquote") {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 120, line: 280, lineRule: LineRuleType.AUTO },
          border: {
            left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SECONDARY, space: 10 },
          },
          shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
          children: parseInline(token.text, { italics: true, color: COLOR_MUTED }),
        })
      );
    } else if (token.type === "list") {
      for (const item of token.items) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 50, after: 50, line: 280, lineRule: LineRuleType.AUTO },
            children: parseInline(item.text),
          })
        );
      }
    } else if (token.type === "table") {
      const tableRows = [];

      // Header row
      tableRows.push(
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: token.header.map((col) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: COLOR_BG_HEADER },
              margins: { top: 140, bottom: 140, left: 160, right: 160 },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40, line: 240, lineRule: LineRuleType.AUTO },
                  children: parseInline(col.text, { bold: true, color: COLOR_PRIMARY }),
                }),
              ],
            })
          ),
        })
      );

      // Body rows
      for (const row of token.rows) {
        tableRows.push(
          new TableRow({
            cantSplit: true,
            children: row.map((cell) =>
              new TableCell({
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 40, line: 240, lineRule: LineRuleType.AUTO },
                    children: parseInline(cell.text),
                  }),
                ],
              })
            ),
          })
        );
      }

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
          },
          rows: tableRows,
        })
      );

      children.push(new Paragraph({ spacing: { after: 120 } }));
    } else if (token.type === "code") {
      const lang = (token.lang || "").toLowerCase();

      if (lang === "mermaid") {
        console.log(`Processing Mermaid diagram [${token.text.substring(0, 30).replace(/\n/g, " ")}...]`);
        const imgBuffer = await fetchMermaidImage(token.text);

        if (imgBuffer) {
          // Compute proportional dimensions to avoid image squishing
          const { w, h } = getJpegDimensions(imgBuffer);
          const maxWidth = 520;
          let targetW = Math.min(w, maxWidth);
          let targetH = Math.round(h * (targetW / w));
          if (targetH > 560) {
            targetH = 560;
            targetW = Math.round(w * (560 / h));
          }

          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 160, after: 160 },
              children: [
                new ImageRun({
                  data: imgBuffer,
                  transformation: {
                    width: targetW,
                    height: targetH,
                  },
                }),
              ],
            })
          );
        } else {
          // Fallback to formatted diagram code block
          children.push(createCodeBlock(token.text));
        }
      } else {
        // Monospace Code / Directory tree in neat single-cell container
        children.push(createCodeBlock(token.text));
      }
    }
  }

  // Create Document with proper default paragraph spacing
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22, color: COLOR_TEXT },
          paragraph: {
            spacing: {
              line: 280,
              lineRule: LineRuleType.AUTO,
              before: 80,
              after: 80,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: "SDN302 — Course Project Report — EnglishQuiz Platform (Lê Duy & Nguyễn Tuấn Minh)",
                alignment: AlignmentType.RIGHT,
                run: { size: 16, italics: true, color: "94A3B8", font: "Arial" },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Page ", size: 16, color: "94A3B8", font: "Arial" }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "94A3B8",
                    font: "Arial",
                  }),
                  new TextRun({ text: " of ", size: 16, color: "94A3B8", font: "Arial" }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: "94A3B8",
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  console.log("Packing Document to Buffer...");
  const buffer = await Packer.toBuffer(doc);

  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Created DOCX at: ${outputPath} (${buffer.length} bytes)`);

  fs.writeFileSync(outputRoot, buffer);
  console.log(`✓ Created DOCX at root: ${outputRoot} (${buffer.length} bytes)`);

  return { outputPath, outputRoot, size: buffer.length };
}

convertMarkdownToDocx()
  .then((res) => {
    console.log(`🎉 SUCCESS: Course Project Report successfully generated as Word Document! Size: ${res.size} bytes.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("FATAL ERROR generating Word doc:", err);
    process.exit(1);
  });
