#!/usr/bin/env node
/**
 * Bundle config file contents for the Command Center UI
 * Reads all .claude config files and outputs them as JSON
 *
 * Usage: node scripts/bundle-config.js
 * Output: tools/explorer/public/config-data.json
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Read file safely
function readFileSafe(path) {
  try {
    if (existsSync(path)) {
      return readFileSync(path, 'utf-8');
    }
  } catch (e) {
    console.warn(`Warning: Could not read ${path}`);
  }
  return null;
}

// Get all files in directory with extension filter
function getFiles(dir, extensions) {
  const files = [];
  if (!existsSync(dir)) return files;

  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      files.push({
        name: file,
        path: fullPath,
        relativePath: fullPath.replace(PROJECT_ROOT + '/', ''),
      });
    } else if (stat.isDirectory()) {
      // Check for skill directories (contain SKILL.md or prompt.md)
      for (const skillFile of ['SKILL.md', 'prompt.md']) {
        const skillPath = join(fullPath, skillFile);
        if (existsSync(skillPath)) {
          files.push({
            name: file,
            path: skillPath,
            relativePath: skillPath.replace(PROJECT_ROOT + '/', ''),
            isSkillDir: true,
          });
          break;
        }
      }
    }
  }
  return files;
}

// Build config data
function buildConfigData() {
  const data = {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    claudeMd: null,
    agents: [],
    rules: [],
    skills: [],
    hooks: [],
    mcpConfig: null,
  };

  // CLAUDE.md
  const claudeMdPath = join(PROJECT_ROOT, 'CLAUDE.md');
  data.claudeMd = readFileSafe(claudeMdPath);

  // Agents (templates/subagents/**/*.md, excluding README.md)
  const agentsDirs = [
    join(PROJECT_ROOT, 'templates/subagents/ideation'),
    join(PROJECT_ROOT, 'templates/subagents/generic'),
    join(PROJECT_ROOT, 'templates/subagents/domains'),
    join(PROJECT_ROOT, 'templates/subagents/specialists'),
    join(PROJECT_ROOT, 'templates/subagents/ingestion'),
    join(PROJECT_ROOT, 'templates/subagents/system'),
    join(PROJECT_ROOT, '.claude/agents'), // Also check here if exists
  ];

  for (const agentsDir of agentsDirs) {
    for (const file of getFiles(agentsDir, ['.md'])) {
      // Skip README files
      if (file.name.toLowerCase() === 'readme.md') continue;

      const content = readFileSafe(file.path);
      if (content) {
        const agentId = basename(file.name, '.md');
        // Extract category from path
        const pathParts = file.relativePath.split('/');
        const category = pathParts[pathParts.length - 2] || 'other';

        // Try to extract description from first paragraph or heading
        const lines = content.split('\n').filter(l => l.trim());
        const firstLine = lines[0] || '';
        const desc = firstLine.startsWith('#')
          ? (lines[1] || '').replace(/^[#\s]+/, '').slice(0, 100)
          : firstLine.slice(0, 100);

        data.agents.push({
          id: agentId,
          name: agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          cmd: `@${agentId}`,
          path: file.relativePath,
          category,
          desc: desc || 'Agent configuration',
          content,
        });
      }
    }
  }

  // Rules (.claude/rules/*.md)
  const rulesDir = join(PROJECT_ROOT, '.claude/rules');
  for (const file of getFiles(rulesDir, ['.md'])) {
    const content = readFileSafe(file.path);
    if (content) {
      data.rules.push({
        id: basename(file.name, '.md'),
        name: basename(file.name, '.md').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        path: file.relativePath,
        content,
      });
    }
  }

  // Skills (.claude/skills/*/prompt.md)
  const skillsDir = join(PROJECT_ROOT, '.claude/skills');
  for (const file of getFiles(skillsDir, ['.md'])) {
    const content = readFileSafe(file.path);
    if (content) {
      const skillName = file.isSkillDir ? file.name : basename(file.name, '.md');
      data.skills.push({
        id: skillName,
        name: skillName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        cmd: `/${skillName}`,
        path: file.relativePath,
        content,
      });
    }
  }

  // Hooks (.claude/hooks/*.sh)
  const hooksDir = join(PROJECT_ROOT, '.claude/hooks');
  for (const file of getFiles(hooksDir, ['.sh'])) {
    const content = readFileSafe(file.path);
    if (content) {
      data.hooks.push({
        id: basename(file.name, '.sh'),
        name: basename(file.name, '.sh').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        path: file.relativePath,
        content,
      });
    }
  }

  // MCP config (.mcp.json)
  const mcpPath = join(PROJECT_ROOT, '.mcp.json');
  const mcpContent = readFileSafe(mcpPath);
  if (mcpContent) {
    data.mcpConfig = {
      path: '.mcp.json',
      content: mcpContent,
    };
  }

  return data;
}

// Main
const configData = buildConfigData();
const outputPath = join(PROJECT_ROOT, 'tools/explorer/public/config-data.json');

writeFileSync(outputPath, JSON.stringify(configData, null, 2));

console.log(`Generated config data:`);
console.log(`  - CLAUDE.md: ${configData.claudeMd ? 'yes' : 'no'}`);
console.log(`  - Agents: ${configData.agents.length}`);
console.log(`  - Rules: ${configData.rules.length}`);
console.log(`  - Skills: ${configData.skills.length}`);
console.log(`  - Hooks: ${configData.hooks.length}`);
console.log(`  - MCP config: ${configData.mcpConfig ? 'yes' : 'no'}`);
console.log(`\nOutput: ${outputPath}`);
