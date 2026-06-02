#!/usr/bin/env python3
"""
DOCX Generator - CyberSec Reporting Engine

Converts markdown/YAML report data to Word documents (.docx) using python-docx.
Applies corporate styling: fonts, colors, headers/footers, heading hierarchy,
styled tables, page breaks, table of contents, cover page, and classification
headers/footers.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import yaml
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
from docx.shared import Inches, Pt, RGBColor, Cm, Emu
from docx.opc.constants import RELATIONSHIP_TYPE as RT


# =============================================================================
# Configuration defaults
# =============================================================================

DEFAULT_STYLE = {
    "font_body": "Calibri",
    "font_heading": "Calibri Light",
    "font_mono": "Consolas",
    "font_size_body": 11,
    "font_size_small": 9,
    "color_primary": "1A56DB",      # accent blue
    "color_text": "1A1A1A",
    "color_muted": "6B7280",
    "color_critical": "DC2626",
    "color_high": "EA580C",
    "color_medium": "CA8A04",
    "color_low": "16A34A",
    "page_margin_cm": 2.54,
    "classification": "CONFIDENTIAL",
    "company_name": "CyberSec Inc.",
    "logo_path": None,
}

SEVERITY_COLORS = {
    "critical": DEFAULT_STYLE["color_critical"],
    "high": DEFAULT_STYLE["color_high"],
    "medium": DEFAULT_STYLE["color_medium"],
    "low": DEFAULT_STYLE["color_low"],
    "info": DEFAULT_STYLE["color_muted"],
}

# =============================================================================
# Utility helpers
# =============================================================================


def hex_to_rgb(hex_color: str) -> RGBColor:
    """Convert hex color string to RGBColor."""
    h = hex_color.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def cm_to_emu(cm_val: float) -> Emu:
    """Convert centimetres to EMU (English Metric Units)."""
    return Cm(cm_val)


def load_data(file_path: str) -> dict:
    """Load finding data from JSON or YAML file."""
    raw = Path(file_path).read_text(encoding="utf-8")
    if file_path.endswith((".yml", ".yaml")):
        return yaml.safe_load(raw)
    return json.loads(raw)


# =============================================================================
# DOCX Generator
# =============================================================================


class DocxGenerator:
    """Generate professional .docx reports from structured finding data."""

    def __init__(self, style_overrides: Optional[dict] = None):
        self.style = {**DEFAULT_STYLE, **(style_overrides or {})}

    # ------------------------------------------------------------------
    # Document setup
    # ------------------------------------------------------------------

    def _create_document(self) -> Document:
        doc = Document()

        # Page margins
        for section in doc.sections:
            m = cm_to_emu(self.style["page_margin_cm"])
            section.top_margin = m
            section.bottom_margin = m
            section.left_margin = m
            section.right_margin = m

        # Default font
        style = doc.styles["Normal"]
        font = style.font
        font.name = self.style["font_body"]
        font.size = Pt(self.style["font_size_body"])
        font.color.rgb = hex_to_rgb(self.style["color_text"])

        return doc

    def _set_heading_styles(self, doc: Document) -> None:
        """Configure heading styles with corporate fonts and colors."""
        accent = hex_to_rgb(self.style["color_primary"])
        for level in range(1, 5):
            style_name = f"Heading {level}"
            style = doc.styles[style_name]
            style.font.name = self.style["font_heading"]
            style.font.color.rgb = accent
            sizes = {1: 24, 2: 18, 3: 14, 4: 12}
            style.font.size = Pt(sizes.get(level, 12))
            style.font.bold = level <= 2

    # ------------------------------------------------------------------
    # Headers & Footers
    # ------------------------------------------------------------------

    def _add_header_footer(self, doc: Document, classification: str) -> None:
        """Add headers and footers with classification markings."""
        for section in doc.sections:
            # Header
            header = section.header
            header.is_linked_to_previous = False
            hp = header.paragraphs[0]
            hp.text = f"{classification} — CyberSec Reporting Engine"
            hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            run = hp.runs[0]
            run.font.size = Pt(self.style["font_size_small"])
            run.font.color.rgb = hex_to_rgb(self.style["color_muted"])
            run.font.italic = True

            # Footer with page numbers
            footer = section.footer
            footer.is_linked_to_previous = False
            fp = footer.paragraphs[0]
            fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            fp.style = doc.styles["Normal"]

            # "Page X of Y"
            run1 = fp.add_run("Page ")
            run1.font.size = Pt(self.style["font_size_small"])
            run1.font.color.rgb = hex_to_rgb(self.style["color_muted"])

            # PAGE field
            fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
            instrText1 = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
            fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
            run_page = fp.add_run()
            run_page._r.append(fldChar1)
            run_page._r.append(instrText1)
            run_page._r.append(fldChar2)

            run2 = fp.add_run(" of ")
            run2.font.size = Pt(self.style["font_size_small"])
            run2.font.color.rgb = hex_to_rgb(self.style["color_muted"])

            # NUMPAGES field
            fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
            instrText2 = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> NUMPAGES </w:instrText>')
            fldChar4 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
            run_total = fp.add_run()
            run_total._r.append(fldChar3)
            run_total._r.append(instrText2)
            run_total._r.append(fldChar4)

    # ------------------------------------------------------------------
    # Cover page
    # ------------------------------------------------------------------

    def _add_cover_page(self, doc: Document, data: dict) -> None:
        """Insert a styled cover page."""
        metadata = data.get("metadata", {})
        classification = metadata.get("classification", self.style["classification"])
        title = metadata.get("title", "Security Assessment Report")

        # Title block
        for _ in range(6):
            doc.add_paragraph()

        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_t = p_title.add_run(title)
        run_t.font.size = Pt(32)
        run_t.font.bold = True
        run_t.font.color.rgb = hex_to_rgb(self.style["color_primary"])
        run_t.font.name = self.style["font_heading"]

        doc.add_paragraph()

        # Classification
        p_class = doc.add_paragraph()
        p_class.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_c = p_class.add_run(f"[ {classification} ]")
        run_c.font.size = Pt(14)
        run_c.font.bold = True
        run_c.font.color.rgb = hex_to_rgb(self.style["color_critical"])

        doc.add_paragraph()

        # Metadata lines
        meta_fields = [
            ("Prepared by", metadata.get("author", "CyberSec Team")),
            ("Date", metadata.get("generatedAt", datetime.now().isoformat())),
            ("Version", metadata.get("version", "1.0.0")),
        ]
        for label, value in meta_fields:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r1 = p.add_run(f"{label}: ")
            r1.font.bold = True
            r2 = p.add_run(str(value))

        # Page break after cover
        doc.add_page_break()

    # ------------------------------------------------------------------
    # Table of contents
    # ------------------------------------------------------------------

    def _add_table_of_contents(self, doc: Document) -> None:
        """Insert a Word TOC field."""
        doc.add_heading("Table of Contents", level=1)
        paragraph = doc.add_paragraph()
        run = paragraph.add_run()

        fldChar_begin = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
        instrText = parse_xml(
            f'<w:instrText {nsdecls("w")} xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText>'
        )
        fldChar_sep = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
        fldChar_end = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')

        run._r.append(fldChar_begin)
        run._r.append(instrText)
        run._r.append(fldChar_sep)
        run._r.append(fldChar_end)

        doc.add_paragraph("[ Right-click and select 'Update Field' to populate the TOC ]")
        doc.add_page_break()

    # ------------------------------------------------------------------
    # Table builder
    # ------------------------------------------------------------------

    def _add_table(self, doc: Document, table_data: dict) -> None:
        """Create a styled table from structured data."""
        headers = table_data.get("headers", [])
        rows = table_data.get("rows", [])

        if not headers:
            return

        table = doc.add_table(rows=1 + len(rows), cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.style = "Table Grid"

        # Header row
        hdr_cells = table.rows[0].cells
        for i, header in enumerate(headers):
            hdr_cells[i].text = str(header)
            for paragraph in hdr_cells[i].paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.bold = True
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(255, 255, 255)
            # Header background
            shading = parse_xml(
                f'<w:shd {nsdecls("w")} w:fill="{self.style["color_primary"]}" w:val="clear"/>'
            )
            hdr_cells[i]._tc.get_or_add_tcPr().append(shading)

        # Data rows
        for r, row_data in enumerate(rows):
            row_cells = table.rows[r + 1].cells
            for c, val in enumerate(row_data):
                if c < len(headers):
                    row_cells[c].text = str(val)
                    for paragraph in row_cells[c].paragraphs:
                        for run in paragraph.runs:
                            run.font.size = Pt(10)
            # Alternate row shading
            if r % 2 == 0:
                for c in range(len(headers)):
                    shading = parse_xml(
                        f'<w:shd {nsdecls("w")} w:fill="F3F4F6" w:val="clear"/>'
                    )
                    row_cells[c]._tc.get_or_add_tcPr().append(shading)

        doc.add_paragraph()  # spacing after table

    # ------------------------------------------------------------------
    # Severity badge (text-based)
    # ------------------------------------------------------------------

    def _severity_text(self, severity: str) -> str:
        badges = {
            "critical": "[!! CRITICAL !!]",
            "high": "[! HIGH !]",
            "medium": "[* MEDIUM *]",
            "low": "[- LOW -]",
            "info": "[i INFO]",
        }
        return badges.get(str(severity).lower(), str(severity).upper())

    # ------------------------------------------------------------------
    # Markdown-to-DOCX converter
    # ------------------------------------------------------------------

    def _render_markdown_section(self, doc: Document, text: str) -> None:
        """Convert basic markdown to docx paragraphs."""
        lines = text.strip().split("\n")
        i = 0
        while i < len(lines):
            line = lines[i]

            # Headings
            h_match = re.match(r"^(#{1,5})\s+(.+)", line)
            if h_match:
                level = min(len(h_match.group(1)), 5)
                doc.add_heading(h_match.group(2).strip(), level=level)
                i += 1
                continue

            # Horizontal rule
            if re.match(r"^[-*_]{3,}\s*$", line):
                doc.add_paragraph("─" * 60)
                i += 1
                continue

            # Bullet list
            if re.match(r"^[\s]*[-*+]\s+", line):
                items = []
                while i < len(lines) and re.match(r"^[\s]*[-*+]\s+", lines[i]):
                    items.append(re.sub(r"^[\s]*[-*+]\s+", "", lines[i]))
                    i += 1
                for item in items:
                    p = doc.add_paragraph(item, style="List Bullet")
                continue

            # Code block
            if line.startswith("```"):
                code_lines = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    code_lines.append(lines[i])
                    i += 1
                i += 1  # skip closing ```
                if code_lines:
                    p = doc.add_paragraph()
                    run = p.add_run("\n".join(code_lines))
                    run.font.name = self.style["font_mono"]
                    run.font.size = Pt(9)
                continue

            # Bold text
            line = re.sub(r"\*\*(.+?)\*\*", lambda m: self._bold_placeholder(m.group(1)), line)

            # Regular paragraph
            if line.strip():
                doc.add_paragraph(line.strip())

            i += 1

    def _bold_placeholder(self, text: str) -> str:
        """Mark bold ranges — handled later via paragraph processing."""
        return text  # simplification: bold markers already in text

    # ------------------------------------------------------------------
    # Main generation
    # ------------------------------------------------------------------

    def generate(self, data: dict) -> Document:
        """Generate a complete .docx document from structured data.

        Parameters
        ----------
        data : dict
            Report data with keys: metadata, sections, findings, etc.

        Returns
        -------
        Document
            The python-docx Document object ready for saving.
        """
        metadata = data.get("metadata", {})
        classification = metadata.get("classification", self.style["classification"])

        doc = self._create_document()
        self._set_heading_styles(doc)
        self._add_header_footer(doc, classification)

        # Cover page
        self._add_cover_page(doc, data)

        # Table of contents
        self._add_table_of_contents(doc)

        # Executive summary
        if data.get("executiveSummary"):
            doc.add_heading("Executive Summary", level=1)
            doc.add_paragraph(data["executiveSummary"])
            doc.add_page_break()

        # Sections
        for section in data.get("sections", []):
            doc.add_heading(section.get("title", "Untitled"), level=1)

            if section.get("content"):
                self._render_markdown_section(doc, section["content"])

            # Findings
            for finding in section.get("findings", []):
                sev = finding.get("severity", "info")
                title = finding.get("title", "Finding")
                doc.add_heading(f"{self._severity_text(sev)} {title}", level=2)

                fields = [
                    ("CVE", finding.get("cve")),
                    ("CVSS Score", finding.get("cvssScore")),
                    ("Affected Systems", finding.get("affectedSystems")),
                ]
                for label, val in fields:
                    if val:
                        p = doc.add_paragraph()
                        run_l = p.add_run(f"{label}: ")
                        run_l.font.bold = True
                        p.add_run(str(val))

                if finding.get("description"):
                    doc.add_heading("Description", level=3)
                    self._render_markdown_section(doc, finding["description"])

                if finding.get("impact"):
                    doc.add_heading("Impact", level=3)
                    self._render_markdown_section(doc, finding["impact"])

                if finding.get("remediation"):
                    doc.add_heading("Remediation", level=3)
                    self._render_markdown_section(doc, finding["remediation"])

                doc.add_paragraph("─" * 60)  # separator

            # Tables
            for table_data in section.get("tables", []):
                if table_data.get("title"):
                    doc.add_heading(table_data["title"], level=3)
                self._add_table(doc, table_data)

            # Page break between major sections
            doc.add_page_break()

        # Appendix
        doc.add_heading("Appendix", level=1)
        doc.add_paragraph(
            f"Report generated by CyberSec Reporting Engine v{metadata.get('version', '1.0.0')} "
            f"on {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}"
        )

        return doc

    def generate_from_file(self, input_path: str, output_path: str) -> dict:
        """Load data from file, generate DOCX, save to output path."""
        data = load_data(input_path)
        doc = self.generate(data)
        doc.save(output_path)
        size = Path(output_path).stat().st_size
        return {"success": True, "outputPath": output_path, "size": size}


# =============================================================================
# CLI entry point
# =============================================================================


def main():
    import argparse

    parser = argparse.ArgumentParser(description="CyberSec DOCX Report Generator")
    parser.add_argument("input", help="Path to findings JSON/YAML file")
    parser.add_argument("output", help="Path for output .docx file")
    parser.add_argument("--classification", default="CONFIDENTIAL", help="Document classification")
    args = parser.parse_args()

    gen = DocxGenerator(style_overrides={"classification": args.classification})
    try:
        result = gen.generate_from_file(args.input, args.output)
        print(f"DOCX generated: {result['outputPath']} ({result['size']} bytes)")
        sys.exit(0)
    except Exception as exc:
        print(f"DOCX ERROR: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
