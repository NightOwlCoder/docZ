# Weblab MCP Integration - Documentation Index

**Project:** Weblab MCP Integration  
**Status:** Phase 2 - Remote Strands Agent Implementation  
**Updated:** October 7, 2025

---

## Start Here

**For Stakeholders (Leadership/Management):**
- **[Technical Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md)** - Complete project plan, timeline, architecture

**For 3YAP Contributors:**
- **[Use Cases & Strategy](phase-2/mcp-weblab-anywhere-use-cases-strategy.md)** - Will's primitive (you support)
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
- phase-2/mcp-weblab-anywhere-roadmap.md
- phase-2/mcp-weblab-anywhere-use-cases-strategy.md
- phase-2/mcp-weblab-anywhere-technical-vision.md

**Implementation & Reference:**
- phase-2/phase-2-dev-setup.md
- phase-2/strands-implementation-research/ (Doug's patterns)
- phase-2/authentication-clarification.md
- phase-2/toolbox-vending-guide.md

**Decision History:**
- phase-2/mcp-everywhere-mandate.md
- phase-2/restart-package-2025-10-02.md
- ../threads/chetan-amzn-mcp-thread.md

**Meetings:**
- weblab-mcp-meetings/

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


-   Docling RAG Agent and examples:
https://github.com/coleam00/ottomator-agents/tree/main/docling-rag-agent

-   Docling GitHub repository:
https://github.com/docling-project/docling

-   Docling documentation:
https://docling-project.github.io/docling/