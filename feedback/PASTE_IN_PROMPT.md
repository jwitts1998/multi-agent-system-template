# Paste-In Prompt for Generating Template Feedback

Copy everything below the line into a Cursor (or other AI assistant) session **in a project that uses the Multi-Agent Development System Template**. The AI will use your project's files as context to draft a feedback document you can save to the template repo's `feedback/` folder.

---

I need you to draft a feedback document for the **Multi-Agent Development System Template** based on how it was applied in this project. Look at the template-derived files in this repo — including `.cursorrules`, `AGENTS.md`, any task schema or task YAML files, workflow docs, and subagent configurations — to understand which template components were used and how they were customized.

Write the feedback as a single markdown document using the structure below. Be specific and cite concrete examples from this project where possible. If a section doesn't apply, say so briefly and move on.

```markdown
# Template Feedback

## Project Info

- **Project name**: <!-- fill in from this project -->
- **Project type**: <!-- mobile / web / backend / full-stack -->
- **Template version or date used**: <!-- if known -->

## Template Components Used

Which parts of the template were applied? Check all that apply.

- [ ] `.cursorrules`
- [ ] `AGENTS.md`
- [ ] Task schema / task files
- [ ] Workflow docs (multi-agent workflow, development workflow)
- [ ] Subagents — generic (code-reviewer, debugger, designer, etc.)
- [ ] Subagents — specialists (flutter, node, react, etc.)
- [ ] Ingestion agents (codebase auditor, gap analysis, documentation backfill)
- [ ] Other: <!-- describe -->

## How the Template Was Used

<!-- Describe setup approach, level of customization, and which agents were used most. -->

## What Worked Well

<!-- Specific agents, workflows, or docs that added the most value. -->

## Pain Points or Gaps

<!-- What was frustrating, confusing, or missing. -->

## Suggested Improvements

<!-- Concrete ideas: new agents, better examples, doc changes, setup flow improvements. -->

## Additional Notes

<!-- Anything else worth sharing. -->
```

To fill this out:

1. Read the `.cursorrules` file at the project root to see which base template was used and what customizations were made.
2. Read `AGENTS.md` (or `.cursor/agents/AGENTS.md` or similar) to see which agent roles are defined and how they differ from the base template.
3. Look for any task schema files (e.g. `tasks/`, `.yml` task files) to see if the task system was adopted.
4. Check for workflow docs or subagent configs that came from the template.
5. Based on what you find, fill in each section with honest, specific feedback — both positive and constructive.

Output the completed markdown document and nothing else.
