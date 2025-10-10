# Weblab MCP Integration - Documentation Index

**Project:** Weblab MCP Integration  
**Status:** Phase 2 - Remote Strands Agent Implementation  
**Updated:** October 7, 2025

---

## Start Here

**CRITICAL: 2025 Scope is Read-Only**
> "We're doing MCP but for 2025 it is read-only to protect the safety of the control plane."  
> — William Josephson, PE (Oct 9, 2025)

Weblab MCP will provide read-only access (experiment details, allocations, data queries) in 2025. Write capabilities (create/modify experiments, dial-up) deferred to 2026+ to protect tier-1 service availability.

**For Stakeholders (Leadership/Management):**
- **[Technical Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md)** - Complete project plan, timeline, architecture

**For [3YAP](https://quip-amazon.com/l52lAKv6Kb93/3YAP-execution-plan) Contributors:**
- **[Use Cases & Strategy](phase-2/mcp-weblab-anywhere-use-cases-strategy.md)** - Will's primitive (Sergio's support)
- **[Technical Vision](phase-2/mcp-weblab-anywhere-technical-vision.md)** - Sergio's primitive (Doug/YJ/Arpit support)

**For Engineers (Implementation):**
- **[Phase 2 Dev Setup](phase-2/phase-2-dev-setup.md)** - Local development guide
- **[Phase 2 Strands Patterns](phase-2/strands-implementation-research/)** - Doug's reference implementations

---

## Key Decisions & Context

**Recent Updates (October 2025):**
- [MCP Everywhere Mandate](phase-2/mcp-everywhere-mandate.md) - Remote-first architecture requirement
- [Chetan Thread](../threads/chetan-amzn-mcp-thread.md) - Fork decision (merge rejected)
- [Project Restart Package](phase-2/restart-package-2025-10-02.md) - Project snapshot (for context resumption)

**Meeting Notes:**
- [Ryan (Oct 2)](weblab-mcp-meetings/ryan-10-02.md) - MCP strategy, use cases
- [Michael (Oct 2)](weblab-mcp-meetings/michael-10-02.md) - Infrastructure, security
- [YJ (Oct 2)](weblab-mcp-meetings/yj-10-02.md) - Data access (Redshift vs Athena)
- [Jakub (Oct 6)](weblab-mcp-meetings/jakub-10-06.md) - Strands development setup

---

## Project Status

**Phase 1 Complete:**
- 3 core MCP tools built and tested (details, allocations, history)
- Tested with Vignesh (director demo)
- 2179 tests passing

**Phase 2 Current:**
- Remote Strands agent architecture
- CloudAuth Python MCP SDK available (Oct 2025)
- Q1 2026 CCI deadline (P0)
- 6-week implementation timeline

**Archived:**
- 3 untested tools ([see archive](../../weblab-mcp-source-code/archive/))
- Local fork strategy ([see archive](../archive/))

---

## Document Organization

### Active Documents (Phase 2)

**Strategy & Planning:**
- [Weblab MCP - Technical Roadmap & Architecture](phase-2/mcp-weblab-anywhere-roadmap.md) - Complete project plan, timeline, data strategy, performance requirements
- [MCP/AI Use Cases and Strategy - Brainstorm](phase-2/mcp-weblab-anywhere-use-cases-strategy.md) - Customer pain points, collected use cases, 3-year vision
- [MCP/AI Technical Vision - Brainstorm](phase-2/mcp-weblab-anywhere-technical-vision.md) - Implementation approach, tech stack decisions, challenges

**Implementation & Reference:**
- [Phase 2 Development Setup - Strands Agent Local Testing](phase-2/phase-2-dev-setup.md) - Local development guide with brazil-runtime-exec patterns
- [Doug's Strands Implementation Research](phase-2/strands-implementation-research/) - Production reference implementations
- [Authentication Clarification: andes-mcp vs Direct Redshift](phase-2/authentication-clarification.md) - Auth patterns comparison
- [Toolbox Vending Guide for Weblab MCP](phase-2/toolbox-vending-guide.md) - Distribution setup and telemetry

**Decision History:**
- [MCP Everywhere Initiative - Critical Mandate Analysis](phase-2/mcp-everywhere-mandate.md) - Remote-first requirement and strategy pivot
- [Weblab MCP - Project Restart Package](phase-2/restart-package-2025-10-02.md) - Oct 2 project snapshot with decisions
- [Chetan Soni - amzn-mcp Discussion Thread](../threads/chetan-amzn-mcp-thread.md) - Fork vs merge decision
- [James McQueen & William Josephson - MCP Safety Discussion](../threads/james-william-mcp-safety-thread.md) - Read-only 2025 scope

**Meetings:**
- [All Meetings](weblab-mcp-meetings/) - Ryan, Michael, YJ, Jakub, Doug, Adam

### Reference Documents (Background)

**Testing:**
- ../testing/

**Historical (Investigation & Research):**
- historical/ - Andes integration, LangChain investigation, Strands research
- planning/ - Long-term vision, design plans

**Phase 1 (Complete - September 2025):**
- phase-1/ - All Phase 1 documentation
  - phase-1-readme.md (complete guide)
  - Local MCP setup, testing, code reviews

**Presentations & Demos:**
- presentations/ - Demo scripts, presentations, announcements

### Archived Documents (Outdated)

**Moved to docs/archive/:**
- standalone-server-analysis.md (fork analysis - obsolete)

**Can be archived (Phase 1 specific):**
- Many investigation docs (learnings captured in current docs)
- Multiple overlapping guides
- Old meeting notes from before October

---

## Quick Navigation

**I need to:**
- **Understand the project** → Read [Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md)
- **Contribute to 3YAP** → Read [Use Cases](phase-2/mcp-weblab-anywhere-use-cases-strategy.md) or [Technical Vision](phase-2/mcp-weblab-anywhere-technical-vision.md)
- **Start development** → Read [Phase 2 Dev Setup](phase-2/phase-2-dev-setup.md)
- **Understand decisions** → Read [MCP Mandate](phase-2/mcp-everywhere-mandate.md) and [Chetan Thread](../threads/chetan-amzn-mcp-thread.md)
- **See meeting outcomes** → Check [weblab-mcp-meetings/](weblab-mcp-meetings/)
- **Phase 1 reference** → Check [phase-1/](phase-1/)

---

## Document Maintenance

**Organized Structure:**
- **phase-2/** - All active Phase 2 work (roadmap, vision, dev setup, references)
- **phase-1/** - Complete Phase 1 documentation (historical reference)
- **historical/** - Investigation and research docs
- **presentations/** - Demo materials and announcements
- **planning/** - Long-term vision and planning docs
- **weblab-mcp-meetings/** - Meeting notes

---

**Need Help?** Check [Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md) first, then reach out to Sergio Ibagy

---

## Final Folder Structure

```
docs/weblab-mcp/
├── README.md                    # This file (navigation)
├── phase-2/                     # Active Phase 2 work
│   ├── mcp-weblab-anywhere-*.md (3 files: roadmap, use cases, tech vision)
│   ├── phase-2-dev-setup.md
│   ├── strands-implementation-research/
│   └── Supporting docs (auth, vending, mandate)
├── phase-1/                     # Phase 1 complete (historical)
│   └── All Phase 1 docs
├── historical/                  # Investigations & research
│   └── LangChain, Strands, Andes investigations
├── planning/                    # Vision & planning
│   └── Long-term plans, design docs
├── presentations/               # Demo materials
│   └── Scripts, slides, announcements
└── weblab-mcp-meetings/         # Meeting notes
    └── Organized by date/person
```
