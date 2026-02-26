import { useState, type ReactNode } from 'react';

interface ArchitectureDocsPanelProps {
  onClose: () => void;
}

interface DocSection {
  id: string;
  title: string;
  content: ReactNode;
}

function SectionHeader({
  title,
  expanded,
  onClick,
}: {
  title: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button className="arch-docs-section-header" onClick={onClick}>
      <span className="arch-docs-chevron">{expanded ? '\u25BC' : '\u25B6'}</span>
      {title}
    </button>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="arch-docs-callout">{children}</div>;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="arch-docs-code">
      <code>{children}</code>
    </pre>
  );
}

const sections: DocSection[] = [
  {
    id: 'concept',
    title: '1. The Concept',
    content: (
      <>
        <p>
          A <strong>vertical micro-agent</strong> is a domain-expertise development agent scoped to
          one area of software craft. It knows the modern best practices, patterns, libraries, and
          constraints for its domain, and it applies that knowledge when building features in the product.
        </p>
        <Callout>
          A vertical micro-agent owns one area of the software craft.
          It knows how to apply that area to any product.
          It creates, monitors, and maintains architecture within its domain.
          It always asks: <strong>"Where does AI belong in this domain — both in how we build it
          and in what the end user experiences?"</strong>
        </Callout>
        <h4>How this differs from role-based agents</h4>
        <table className="arch-docs-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Role-based agents</th>
              <th>Domain micro-agents</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Organized by</td>
              <td>Workflow phase (implement, test, review, document)</td>
              <td>Area of software craft (maps, animations, messaging, schema)</td>
            </tr>
            <tr>
              <td>Expertise</td>
              <td>General-purpose coding + quality standards</td>
              <td>Deep domain knowledge ("how to do geolocation well")</td>
            </tr>
            <tr>
              <td>Scope</td>
              <td>Any feature, any domain</td>
              <td>One domain, across all features that touch it</td>
            </tr>
            <tr>
              <td>AI lens</td>
              <td>Not a primary concern</td>
              <td>Core mandate: evaluate where AI fits in this domain</td>
            </tr>
            <tr>
              <td>Lifecycle</td>
              <td>Invoked per task, then done</td>
              <td>Ongoing ownership: create, monitor, maintain</td>
            </tr>
          </tbody>
        </table>
        <p>
          These two models are <strong>complementary</strong>. A domain micro-agent (e.g. Map Agent)
          still goes through implementation, testing, review, and documentation — it just brings deep
          domain expertise to each of those phases.
        </p>
      </>
    ),
  },
  {
    id: 'mandates',
    title: '2. The Three Mandates',
    content: (
      <>
        <p>Every micro-agent has the same three responsibilities applied to its domain:</p>
        <div className="arch-docs-mandate-grid">
          <div className="arch-docs-mandate">
            <h4>Create</h4>
            <p>
              Design and implement features within the domain. The agent knows which libraries
              are best-in-class, what patterns work at different scales, and where AI can replace
              or augment traditional approaches.
            </p>
          </div>
          <div className="arch-docs-mandate">
            <h4>Monitor</h4>
            <p>
              Observe health and behavior in production. Define metrics, logs, and alerts. Detect
              drift (API degradation, frame rate drops, data inconsistency). Surface problems
              before users notice.
            </p>
          </div>
          <div className="arch-docs-mandate">
            <h4>Maintain</h4>
            <p>
              Evolve the domain over time. Upgrade dependencies, migrate patterns, refactor when
              the domain outgrows its design, deprecate cleanly, and keep the domain consistent
              as others evolve.
            </p>
          </div>
        </div>
        <p className="arch-docs-muted">
          These are not "one-shot" assistants — they have ongoing responsibility for a part of the system.
        </p>
      </>
    ),
  },
  {
    id: 'ai-lens',
    title: '3. The AI-Vertical Lens',
    content: (
      <>
        <p>
          This is the core design principle that distinguishes this architecture from conventional
          domain-driven design.
        </p>
        <Callout>
          <strong>The question every agent must answer:</strong><br />
          "Where in this domain can AI replace, augment, or create something that didn't exist
          before — both in how we build it and in what the end user experiences?"
        </Callout>
        <p>This produces two categories:</p>
        <div className="arch-docs-ai-split">
          <div className="arch-docs-ai-col builder">
            <h4>Builder AI</h4>
            <p>AI that improves how the domain is developed and maintained:</p>
            <ul>
              <li>Auto-generating boilerplate (migrations, API stubs, test fixtures)</li>
              <li>Suggesting patterns based on domain best practices</li>
              <li>Detecting drift or degradation in domain components</li>
            </ul>
          </div>
          <div className="arch-docs-ai-col consumer">
            <h4>Consumer AI</h4>
            <p>AI that becomes a user-facing feature within the domain:</p>
            <ul>
              <li>Natural language search instead of filter dropdowns</li>
              <li>Smart replies in messaging instead of empty text boxes</li>
              <li>Predictive routing in maps instead of manual entry</li>
            </ul>
          </div>
        </div>
        <h4>Why this matters for business verticals</h4>
        <p>
          When the product's purpose is to bring AI into an industry that doesn't have it yet, each
          domain agent becomes a <strong>vector for AI penetration</strong> into the business vertical.
          A Map Agent building for logistics doesn't just implement pin-dropping — it asks: "What does
          AI-native logistics mapping look like?"
        </p>
      </>
    ),
  },
  {
    id: 'tiers',
    title: '4. Tier Model',
    content: (
      <>
        <p>Domains are organized into three tiers based on how they relate to the product:</p>
        <div className="arch-docs-tier-diagram">
          <div className="arch-docs-tier-row orchestration">
            <div className="arch-docs-tier-label">Orchestration</div>
            <div className="arch-docs-tier-items">
              <span>Product Orchestrator</span>
              <span>Domain Router</span>
            </div>
          </div>
          <div className="arch-docs-tier-arrow">{'\u25BC'}</div>
          <div className="arch-docs-tier-row experience">
            <div className="arch-docs-tier-label">Tier 3 — Experience</div>
            <div className="arch-docs-tier-items">
              <span>Animation</span>
              <span>Accessibility</span>
              <span>i18n</span>
              <span>Performance</span>
              <span>Analytics</span>
            </div>
          </div>
          <div className="arch-docs-tier-arrow">{'\u25BC'} consults</div>
          <div className="arch-docs-tier-row feature">
            <div className="arch-docs-tier-label">Tier 2 — Feature</div>
            <div className="arch-docs-tier-items">
              <span>Maps</span>
              <span>Messaging</span>
              <span>Search</span>
              <span>Payments</span>
              <span>Notifications</span>
              <span>Media</span>
            </div>
          </div>
          <div className="arch-docs-tier-arrow">{'\u25BC'} depends on</div>
          <div className="arch-docs-tier-row foundation">
            <div className="arch-docs-tier-label">Tier 1 — Foundation</div>
            <div className="arch-docs-tier-items">
              <span>Schema / Data</span>
              <span>API Connections</span>
              <span>Auth / Identity</span>
              <span>Infrastructure</span>
            </div>
          </div>
        </div>
        <h4>Dependency rules</h4>
        <ul>
          <li><strong>Tier 2 depends on Tier 1.</strong> Feature domains consume foundation primitives. They never redefine them.</li>
          <li><strong>Tier 3 influences Tier 2</strong> but doesn't own features. They operate as consultants with authority over craft quality.</li>
          <li><strong>Tier 2 domains are independent of each other.</strong> Cross-feature interactions are mediated through Tier 1 primitives.</li>
          <li><strong>The orchestrator resolves cross-cutting concerns</strong> when domains disagree.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'contracts',
    title: '5. Contract Model',
    content: (
      <>
        <p>Domains share a codebase and a running product. The contract model defines how they interact without creating entanglement.</p>
        <h4>Shared substrate (off-limits for unilateral changes)</h4>
        <ul>
          <li><strong>Database schema</strong> — changes go through the Schema agent</li>
          <li><strong>API surface</strong> — public endpoints go through the API agent</li>
          <li><strong>Auth model</strong> — permission structures go through the Auth agent</li>
          <li><strong>Event bus contracts</strong> — event names and payloads registered in a shared manifest</li>
          <li><strong>Environment config</strong> — managed by Infrastructure</li>
          <li><strong>Design tokens</strong> — consulted by Animation and Accessibility</li>
        </ul>
        <h4>Conflict resolution protocol</h4>
        <ol>
          <li>Involved agents state their position and rationale.</li>
          <li>If one domain is Tier 1 and the other is Tier 2/3, Tier 1 constraints take precedence (schema integrity beats feature convenience).</li>
          <li>If same tier, the Product Orchestrator decides based on product-level priorities.</li>
          <li>All resolutions are logged as architecture decision records.</li>
        </ol>
      </>
    ),
  },
  {
    id: 'composition',
    title: '6. Composition Model',
    content: (
      <>
        <p>
          Domain agents define <strong>what expertise</strong> is applied. Role-based agents define <strong>how work gets done</strong>. They compose on tasks via two orthogonal fields:
        </p>
        <CodeBlock>{`# tasks/maps-feature.yml
- id: MAPS_T1_location_search
  title: "Implement natural language location search"
  agent_roles: [implementation, testing]    # HOW (workflow phase)
  domain_agents: [maps-geo, search-discovery]  # WHAT (domain expertise)
  spec_refs:
    - "PDB: docs/product_design/app_pdb.md — Section 3.4"
  acceptance_criteria:
    - "User can search by natural language description"
    - "Falls back to standard geocoding when AI confidence is low"`}</CodeBlock>
        <h4>How they combine</h4>
        <table className="arch-docs-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Determines</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>agent_roles</code></td>
              <td>Which workflow phase (implement, test, review, document)</td>
              <td>Implementation Agent writes code, Testing Agent writes tests</td>
            </tr>
            <tr>
              <td><code>domain_agents</code></td>
              <td>Which domain expertise to bring in</td>
              <td>Maps agent brings geolocation patterns, Search agent brings ranking logic</td>
            </tr>
          </tbody>
        </table>
        <p>
          The Domain Router (<code>@domain-router</code>) determines which domains a task touches and populates <code>domain_agents</code>. The Query Router determines workflow phases.
        </p>
      </>
    ),
  },
  {
    id: 'critical-analysis',
    title: '7. Known Gaps and Roadmap',
    content: (
      <>
        <p>
          This section presents an honest assessment of the architecture's current state — what works well and what needs improvement.
        </p>
        <h4>Strengths</h4>
        <ul>
          <li><strong>AI-vertical lens is genuinely novel.</strong> No other multi-agent template treats "where does AI fit?" as a structural concern in every agent.</li>
          <li><strong>Tier model creates useful constraints.</strong> Foundation / Feature / Experience prevents spaghetti dependencies.</li>
          <li><strong>Composition model is clean.</strong> <code>agent_roles</code> x <code>domain_agents</code> avoids the explosion of specialized agents.</li>
          <li><strong>Design-time-first is pragmatic.</strong> Start as prompts, grow toward runtime feedback loops.</li>
        </ul>
        <h4>Weaknesses being addressed</h4>
        <div className="arch-docs-gap-list">
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Knowledge Freshness</div>
            <div className="arch-docs-gap-desc">Agent prompts encode frozen best practices. Added <code>last_reviewed</code> timestamps and knowledge source references. Cursor rule triggers freshness checks when agents are invoked.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Automatic Routing</div>
            <div className="arch-docs-gap-desc">Domain router required manual invocation. New Cursor rule auto-suggests <code>domain_agents</code> when editing task files. Skill provides bulk scan mode.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Consultation Enforcement</div>
            <div className="arch-docs-gap-desc">Tier 3 agents weren't triggered during review. Code reviewer now auto-includes <code>consultedBy</code> lenses from the task's domain agents.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Context Overload</div>
            <div className="arch-docs-gap-desc">100+ line agents overload multi-domain tasks. Added Quick Reference sections for compact loading. Rule loads full content only for primary domain.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Actionable Monitoring</div>
            <div className="arch-docs-gap-desc">Monitoring hooks listed metric names but not how to implement them. Added Monitoring Implementation sections with concrete tooling, thresholds, and dashboards.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">Product-Specific Filtering</div>
            <div className="arch-docs-gap-desc">AI applications are generic across all products. Vertical Calibrator agent now generates product-specific <code>domain-config.yml</code> with relevance ratings and AI priorities.</div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'open-questions',
    title: '8. Open Questions',
    content: (
      <>
        <p>Unresolved design decisions to address as the architecture matures:</p>
        <div className="arch-docs-gap-list">
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">1. Granularity threshold</div>
            <div className="arch-docs-gap-desc">When is a domain too small (e.g. "tooltips") vs too large (e.g. "frontend")? Heuristic: if the domain has its own best practices, libraries, and failure modes, it's a candidate.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">2. Agent knowledge freshness</div>
            <div className="arch-docs-gap-desc">Best practices evolve. How do agents stay current? Options: periodic review cycles, web search at invocation time, version-stamped knowledge with expiry dates.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">3. Cross-domain features</div>
            <div className="arch-docs-gap-desc">Some features are inherently multi-domain (e.g. "push notification on geofence entry"). The contract model handles this via Tier 1 mediation, but orchestration overhead must stay practical.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">4. Agent proliferation</div>
            <div className="arch-docs-gap-desc">At what point does the number of domains exceed coordination capacity? A large product could have 20+ domains. Governance and pruning criteria are needed.</div>
          </div>
          <div className="arch-docs-gap">
            <div className="arch-docs-gap-title">5. Measurability</div>
            <div className="arch-docs-gap-desc">How to know if a domain agent delivers value vs overhead? Possible metrics: time-to-implement, defect rate, AI feature adoption by end users.</div>
          </div>
        </div>
      </>
    ),
  },
];

export function ArchitectureDocsPanel({ onClose }: ArchitectureDocsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(sections.map(s => s.id)));
  const collapseAll = () => setExpandedSections(new Set());

  return (
    <div className="arch-docs-overlay" onClick={onClose}>
      <div className="arch-docs-panel" onClick={e => e.stopPropagation()}>
        <div className="arch-docs-header">
          <div>
            <h2 className="arch-docs-title">Domain Micro-Agent Architecture</h2>
            <p className="arch-docs-subtitle">
              Interactive guide to the vertical micro-agent system
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <button className="arch-docs-toggle-btn" onClick={expandAll}>
              Expand All
            </button>
            <button className="arch-docs-toggle-btn" onClick={collapseAll}>
              Collapse All
            </button>
            <button className="arch-docs-close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className="arch-docs-body">
          {sections.map(section => (
            <div key={section.id} className="arch-docs-section">
              <SectionHeader
                title={section.title}
                expanded={expandedSections.has(section.id)}
                onClick={() => toggleSection(section.id)}
              />
              {expandedSections.has(section.id) && (
                <div className="arch-docs-section-content">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
