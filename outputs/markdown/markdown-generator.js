/**
 * Markdown Generator - CyberSec Reporting Engine
 *
 * Reads finding data from JSON/YAML, assembles complete markdown reports using
 * handlebar-style {{variable}} template substitution, generates Mermaid diagrams,
 * and validates output against a JSON schema.
 *
 * @module markdown-generator
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { Validator } from 'jsonschema';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const VALIDATION_SCHEMA = {
  id: '/ReportSchema',
  type: 'object',
  required: ['metadata', 'sections'],
  properties: {
    metadata: {
      type: 'object',
      required: ['title', 'generatedAt', 'version'],
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        classification: {
          type: 'string',
          enum: ['UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TOP SECRET', 'TLP:CLEAR', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
        },
        generatedAt: { type: 'string' },
        version: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          severity: { type: 'string' },
          findings: { type: 'array' },
          tables: { type: 'array' },
          diagrams: { type: 'array' },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------

/**
 * Substitute {{variable}} placeholders with values from a context object.
 * Supports dot-path access (e.g. {{metadata.title}}) and nested contexts.
 */
function substituteVariables(template, context) {
  return template.replace(/\{\{(.+?)\}\}/g, (_, path) => {
    const keys = path.trim().split('.');
    let value = context;
    for (const k of keys) {
      if (value == null) break;
      value = value[k];
    }
    return value != null ? String(value) : `{{${path}}}`;
  });
}

// ---------------------------------------------------------------------------
// Mermaid diagram builder
// ---------------------------------------------------------------------------

/**
 * Build a Mermaid diagram declaration from structured diagram data.
 * Supported types: flowchart, gantt, pie, sequence.
 */
function buildMermaidDiagram(diagram) {
  const type = diagram.type || 'flowchart';
  const title = diagram.title ? `\ntitle: ${diagram.title}\n` : '';

  const builders = {
    flowchart: (d) => {
      const lines = [d.direction ? `flowchart ${d.direction}` : 'flowchart TD'];
      for (const node of d.nodes || []) {
        const shape = node.shape || 'rect';
        const shapes = { rect: '[]', round: '()', diamond: '{}', circle: '(())' };
        const s = shapes[shape] || '[]';
        lines.push(`    ${node.id}${s[0]}"${node.label}"${s[1]}`);
      }
      for (const edge of d.edges || []) {
        const label = edge.label ? `|${edge.label}|` : '';
        lines.push(`    ${edge.from} -->${label} ${edge.to}`);
      }
      return lines.join('\n');
    },

    gantt: (d) => {
      const lines = ['gantt'];
      if (d.dateFormat) lines.push(`    dateFormat ${d.dateFormat}`);
      if (d.title) lines.push(`    title ${d.title}`);
      for (const section of d.sections || []) {
        lines.push(`    section ${section.name}`);
        for (const task of section.tasks || []) {
          const status = task.status ? task.status : '';
          lines.push(`    ${task.name} :${status} ${task.start}, ${task.duration}`);
        }
      }
      return lines.join('\n');
    },

    pie: (d) => {
      const lines = ['pie'];
      if (d.title) lines.push(`    title ${d.title}`);
      for (const slice of d.slices || []) {
        lines.push(`    "${slice.label}" : ${slice.value}`);
      }
      return lines.join('\n');
    },

    sequence: (d) => {
      const lines = ['sequenceDiagram'];
      for (const participant of d.participants || []) {
        lines.push(`    participant ${participant.id} as ${participant.label}`);
      }
      for (const msg of d.messages || []) {
        const arrow = msg.type === 'dashed' ? '-->>' : '->>';
        lines.push(`    ${msg.from}${arrow}${msg.to}: ${msg.text}`);
      }
      return lines.join('\n');
    },
  };

  const fn = builders[type];
  if (!fn) throw new Error(`Unsupported diagram type: ${type}`);
  return '```mermaid\n' + fn(diagram) + '\n```';
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildExecutiveSummary(context) {
  const tpl = `# Executive Summary\n\n` +
    `**Report ID:** {{metadata.id}}\n` +
    `**Generated:** {{metadata.generatedAt}}\n` +
    `**Classification:** {{metadata.classification}}\n\n` +
    `{{executiveSummary}}\n`;
  return substituteVariables(tpl, context);
}

function buildFindingSection(finding) {
  const tpl = `### {{title}}\n\n` +
    `**Severity:** ${renderSeverityBadge(finding.severity)}\n\n` +
    `**CVE:** {{cve}}\n\n` +
    `**CVSS Score:** {{cvssScore}}\n\n` +
    `**Affected Systems:** {{affectedSystems}}\n\n` +
    `#### Description\n\n{{description}}\n\n` +
    `#### Impact\n\n{{impact}}\n\n` +
    `#### Remediation\n\n{{remediation}}\n\n` +
    `#### References\n\n{{references}}\n\n` +
    `---\n`;
  return substituteVariables(tpl, finding);
}

function renderSeverityBadge(severity) {
  const map = {
    critical: '🔴 CRITICAL',
    high: '🟠 HIGH',
    medium: '🟡 MEDIUM',
    low: '🟢 LOW',
    info: '🔵 INFO',
  };
  return map[severity?.toLowerCase()] || severity || 'UNKNOWN';
}

function buildTableMd(table) {
  if (!table.headers || !table.rows) return '';
  const headerRow = '| ' + table.headers.join(' | ') + ' |';
  const sepRow = '| ' + table.headers.map(() => '---').join(' | ') + ' |';
  const bodyRows = table.rows.map((row) => '| ' + row.map(String).join(' | ') + ' |');
  return [headerRow, sepRow, ...bodyRows].join('\n');
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export class MarkdownGenerator {
  constructor(opts = {}) {
    this.templateDir = opts.templateDir || join(__dirname, 'templates');
    this.schema = opts.schema || VALIDATION_SCHEMA;
    this.validator = new Validator();
  }

  /**
   * Load finding data from a JSON or YAML file.
   */
  async loadData(filePath) {
    const raw = await readFile(filePath, 'utf-8');
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      return parseYaml(raw);
    }
    return JSON.parse(raw);
  }

  /**
   * Load a named template from the template directory.
   */
  async loadTemplate(name) {
    const paths = [
      join(this.templateDir, `${name}.md`),
      join(this.templateDir, `${name}.md.tpl`),
      join(this.templateDir, name),
    ];
    for (const p of paths) {
      try {
        return await readFile(p, 'utf-8');
      } catch {
        /* continue */
      }
    }
    throw new Error(`Template "${name}" not found in ${this.templateDir}`);
  }

  /**
   * Validate report data against the JSON schema.
   */
  validate(data) {
    const result = this.validator.validate(data, this.schema);
    return {
      valid: result.valid,
      errors: result.errors.map((e) => ({
        path: e.property,
        message: e.message,
      })),
    };
  }

  /**
   * Generate a complete markdown report from finding data.
   *
   * @param {object} data - The structured finding data
   * @param {object} [opts] - Generation options
   * @param {string} [opts.template] - Template name to use
   * @returns {Promise<string>} The generated markdown string
   */
  async generate(data, opts = {}) {
    const { valid, errors } = this.validate(data);
    if (!valid) {
      throw new Error(`Validation failed: ${JSON.stringify(errors, null, 2)}`);
    }

    const context = { ...data, ...data.metadata };

    // If a named template is provided, use it as the base and inject sections
    let output = '';
    if (opts.template) {
      const tpl = await this.loadTemplate(opts.template);
      output = substituteVariables(tpl, context);
    } else {
      output = this._assembleDefault(data, context);
    }

    return output.trim() + '\n';
  }

  /**
   * Assemble the default report structure.
   */
  _assembleDefault(data, context) {
    const lines = [];

    // Cover / title
    lines.push(`# ${context.title || 'Security Assessment Report'}`);
    lines.push('');
    lines.push(`**Classification:** ${context.classification || 'CONFIDENTIAL'}`);
    lines.push(`**Generated:** ${context.generatedAt || new Date().toISOString()}`);
    lines.push(`**Version:** ${context.version || '1.0.0'}`);
    lines.push('');

    // Executive summary
    if (data.executiveSummary) {
      lines.push(buildExecutiveSummary(context));
      lines.push('');
    }

    // Table of contents placeholder
    lines.push('## Table of Contents');
    lines.push('');
    for (const section of data.sections || []) {
      lines.push(`- [${section.title}](#${section.id})`);
    }
    lines.push('');

    // Sections
    for (const section of data.sections || []) {
      lines.push(`## ${section.title} {#${section.id}}`);
      lines.push('');

      if (section.content) {
        lines.push(substituteVariables(section.content, context));
        lines.push('');
      }

      // Findings within section
      for (const finding of section.findings || []) {
        lines.push(buildFindingSection(finding));
        lines.push('');
      }

      // Tables
      for (const table of section.tables || []) {
        if (table.title) lines.push(`### ${table.title}`);
        lines.push(buildTableMd(table));
        lines.push('');
      }

      // Diagrams
      for (const diagram of section.diagrams || []) {
        lines.push(buildMermaidDiagram(diagram));
        lines.push('');
      }

      lines.push(''); // section separator
    }

    // Appendix
    lines.push('## Appendix');
    lines.push('');
    lines.push(`Report generated by CyberSec Reporting Engine v${context.version || '1.0.0'}`);

    return lines.join('\n');
  }

  /**
   * Generate a report from a data file and write to an output file.
   *
   * @param {string} inputPath - Path to findings JSON/YAML file
   * @param {string} outputPath - Path for the output markdown file
   * @param {object} [opts] - Generation options
   */
  async generateFromFile(inputPath, outputPath, opts = {}) {
    try {
      const data = await this.loadData(inputPath);
      const md = await this.generate(data, opts);
      await writeFile(outputPath, md, 'utf-8');
      return { success: true, outputPath, size: Buffer.byteLength(md) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

export async function runMarkdownGenerator(args) {
  const { input, output, template } = args;
  const gen = new MarkdownGenerator();
  const result = await gen.generateFromFile(input, output, { template });
  if (!result.success) {
    console.error(`ERROR: ${result.error}`);
    process.exitCode = 1;
  } else {
    console.log(`Generated: ${result.outputPath} (${result.size} bytes)`);
  }
  return result;
}
