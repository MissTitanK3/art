import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

const PAGE_MARGIN = 48;
const TITLE_FONT_SIZE = 20;
const HEADING_FONT_SIZE = 14;
const LABEL_FONT_SIZE = 12;
const BODY_FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const SECTION_SPACING = 20;
const FIELD_SPACING = 10;
const BULLET_INDENT = 12;

export interface GeneratePDFOptions {
  title: string;
  sections: Array<{
    heading: string;
    fields: Record<string, unknown>;
  }>;
}

interface PrintableLine {
  text: string;
  indent?: number;
}

export async function generatePDF(options: GeneratePDFOptions): Promise<Blob> {
  const document = await PDFDocument.create();
  let page = document.addPage();
  const pageSize = () => page.getSize();
  let cursorY = pageSize().height - PAGE_MARGIN;

  const regularFont = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);

  const ensureSpace = (linesNeeded = 1) => {
    if (cursorY - linesNeeded * LINE_HEIGHT <= PAGE_MARGIN) {
      page = document.addPage();
      cursorY = pageSize().height - PAGE_MARGIN;
    }
  };

  const wrapText = (
    text: string,
    font: PDFFont,
    fontSize: number,
    availableWidth: number,
  ) => {
    if (text.length === 0) {
      return [""];
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const tentativeLine = currentLine ? `${currentLine} ${word}` : word;
      const tentativeWidth = font.widthOfTextAtSize(tentativeLine, fontSize);

      if (tentativeWidth <= availableWidth) {
        currentLine = tentativeLine;
        return;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // Handle extremely long word by splitting manually.
      if (font.widthOfTextAtSize(word, fontSize) > availableWidth) {
        let remainder = word;
        while (
          remainder.length > 0 &&
          font.widthOfTextAtSize(remainder, fontSize) > availableWidth
        ) {
          let slice = remainder;
          while (
            font.widthOfTextAtSize(slice, fontSize) > availableWidth &&
            slice.length > 1
          ) {
            slice = slice.slice(0, -1);
          }
          if (slice.length === 0) {
            break;
          }
          lines.push(slice);
          remainder = remainder.slice(slice.length);
        }
        currentLine = remainder;
      } else {
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const drawLines = (
    lines: PrintableLine[],
    font: PDFFont,
    fontSize: number,
  ) => {
    lines.forEach(({ text, indent }) => {
      const x = PAGE_MARGIN + (indent ?? 0);
      const availableWidth = pageSize().width - x - PAGE_MARGIN;
      const wrapped = wrapText(text, font, fontSize, availableWidth);

      wrapped.forEach((line) => {
        ensureSpace();
        page.drawText(line, {
          x,
          y: cursorY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        cursorY -= LINE_HEIGHT;
      });
    });
  };

  const formatKey = (key: string) => {
    const spaced = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1);
    return capitalized
      .replace(/\bId\b/gi, "ID")
      .replace(/\bA number\b/gi, "A-Number");
  };

  const renderScalar = (value: unknown): string => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  const formatValue = (value: unknown): PrintableLine[] => {
    if (value instanceof Date) {
      return [{ text: value.toISOString() }];
    }

    if (Array.isArray(value)) {
      const rows: PrintableLine[] = [];
      value.forEach((entry) => {
        if (entry === undefined || entry === null) {
          return;
        }
        if (
          typeof entry === "string" ||
          typeof entry === "number" ||
          typeof entry === "boolean"
        ) {
          rows.push({
            text: `• ${renderScalar(entry)}`,
            indent: BULLET_INDENT,
          });
          return;
        }
        if (Array.isArray(entry)) {
          const flattened = entry.map((item) => renderScalar(item)).join(", ");
          if (flattened.trim().length > 0) {
            rows.push({ text: `• ${flattened}`, indent: BULLET_INDENT });
          }
          return;
        }
        if (typeof entry === "object") {
          const summary = Object.entries(entry as Record<string, unknown>)
            .filter(([, val]) => {
              if (val === undefined || val === null) {
                return false;
              }
              if (typeof val === "string") {
                return val.trim().length > 0;
              }
              if (Array.isArray(val)) {
                return val.length > 0;
              }
              return true;
            })
            .map(([key, val]) => `${formatKey(key)}: ${renderScalar(val)}`)
            .join("; ");

          if (summary.length > 0) {
            rows.push({ text: `• ${summary}`, indent: BULLET_INDENT });
          }
          return;
        }
        rows.push({ text: `• ${String(entry)}`, indent: BULLET_INDENT });
      });
      return rows.length > 0 ? rows : [{ text: "—", indent: BULLET_INDENT }];
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, val]) => {
          if (val === undefined || val === null) {
            return false;
          }
          if (typeof val === "string") {
            return val.trim().length > 0;
          }
          if (Array.isArray(val)) {
            return val.length > 0;
          }
          return true;
        })
        .map(([key, val]) => `${formatKey(key)}: ${renderScalar(val)}`);

      return entries.length > 0
        ? entries.map((text) => ({ text, indent: BULLET_INDENT }))
        : [{ text: "—" }];
    }

    const scalar = renderScalar(value);
    return scalar.length > 0 ? [{ text: scalar }] : [{ text: "—" }];
  };

  const drawTitle = () => {
    const { width } = pageSize();
    const titleWidth = boldFont.widthOfTextAtSize(
      options.title,
      TITLE_FONT_SIZE,
    );
    ensureSpace();
    page.drawText(options.title, {
      x: (width - titleWidth) / 2,
      y: cursorY,
      size: TITLE_FONT_SIZE,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= LINE_HEIGHT * 1.5;
  };

  const drawSectionHeading = (heading: string) => {
    ensureSpace();
    page.drawText(heading, {
      x: PAGE_MARGIN,
      y: cursorY,
      size: HEADING_FONT_SIZE,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= LINE_HEIGHT;
  };

  drawTitle();

  options.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      cursorY -= SECTION_SPACING - LINE_HEIGHT;
    }

    const entries = Object.entries(section.fields ?? {}).filter(
      ([, value]) => value !== undefined && value !== null,
    );

    if (entries.length === 0) {
      return;
    }

    drawSectionHeading(section.heading);

    entries.forEach(([rawKey, rawValue]) => {
      const label = `${formatKey(rawKey)}:`;
      drawLines([{ text: label }], boldFont, LABEL_FONT_SIZE);

      const valueLines = formatValue(rawValue);
      drawLines(valueLines, regularFont, BODY_FONT_SIZE);
      cursorY -= FIELD_SPACING;
    });
  });

  const pdfBytes = await document.save();
  const byteArray = pdfBytes.slice();
  return new Blob([byteArray], { type: "application/pdf" });
}
