# Documentation Update Recommendations: Jarvis Scraper Example

## Context
Lev Agreda's Finance team created "Jarvis" - a Playwright-based scraper that reduces 5 hours of manual APT Tool work to 10 minutes. This demonstrates clear demand for programmatic access to Amazon internal tools.

## Recommended Documentation Updates

### 1. Working Backwards Document (`docs/weblab-mcp-integration-working-backwards.md`)

**Where to add**: In the opening section after the Press Release headline

**Suggested addition**:
```markdown
### Evidence of Demand

The Finance team's recent "Jarvis" scraper, which uses Playwright to extract APT Tool metrics, demonstrates the urgent need for MCP integration. Teams are building fragile web scrapers that reduce 5 hours of manual work to 10 minutes - showing clear ROI for programmatic access. MCP provides the proper solution: stable APIs instead of brittle scrapers.
```

**Why here**: Sets the stage immediately with a concrete example of teams solving this problem themselves.

---

### 2. Customer Benefits Section (same document)

**Where to add**: After "Primary Benefits" section, add new subsection

**Suggested addition**:
```markdown
### Real-World Impact

**Finance Team Case Study**: The Jarvis scraper reduced APT Tool analysis from 5 hours to 10 minutes - a 96% time reduction. With proper MCP tools, teams can achieve similar efficiency gains without maintaining fragile scrapers or risking UI changes breaking their automation.
```

**Why here**: Provides quantifiable ROI that stakeholders care about.

---

### 3. Requirements Document (`.kiro/specs/weblab-mcp-integration/requirements.md`)

**Where to add**: In the Introduction section, after first paragraph

**Suggested addition**:
```markdown
Current evidence of this demand includes teams building their own scrapers (e.g., Finance's "Jarvis" tool) to automate manual processes, demonstrating both the need and ROI for programmatic access to internal tools.
```

**Why here**: Establishes the business need with real examples in our requirements.

---

### 4. Design Document (`.kiro/specs/weblab-mcp-integration/design.md`)

**Where to add**: In the Overview section, first paragraph

**Suggested addition**:
```markdown
The urgency of this integration is demonstrated by teams creating their own automation solutions - such as the Finance team's Jarvis scraper that reduces 5 hours of APT Tool work to 10 minutes. MCP provides the proper architectural solution to this widespread need.
```

**Why here**: Technical audience understands the fragility of scrapers vs APIs.

---

## Key Messaging Points to Emphasize

1. **96% time reduction** - Quantifiable efficiency gain
2. **Finance team credibility** - Respected team saw enough value to build their own solution
3. **Scraper fragility** - UI changes break scrapers, APIs are stable
4. **Pattern recognition** - If Finance is doing this, other teams likely are too
5. **Proper solution** - MCP is the right architectural approach vs ad-hoc scrapers

## Questions for Discussion

1. Should we mention other teams that might be scraping? (without naming them if confidential)
2. Do we want to add a "Case Studies" section to the Working Backwards doc?
3. Should we calculate potential org-wide impact? (e.g., if 10 teams save 5 hours/week...)
4. Include in our demo script when talking to Vignesh?

## Implementation Approach

Once we agree on which updates to make:
1. Update documents in priority order (Working Backwards first)
2. Keep language factual and measurement-focused 
3. Position as evidence of demand, not criticism of scraping
4. Emphasize MCP as the scalable solution
