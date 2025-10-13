# Weblab MCP Integration - Documentation Index

**Project:** Weblab MCP Integration  
**Status:** Phase 2 - Remote Strands Agent Implementation  
**Updated:** October 10th, 2025

---

## Start Here

**CRITICAL: 2025 Scope is Read-Only**
> "We're doing MCP but for 2025 it is read-only to protect the safety of the control plane."  
> — William Josephson, PE (Oct 9, 2025)

Weblab MCP will provide read-only access (experiment details, allocations, data queries) in 2025.
Write capabilities (create/modify experiments, dial-up) deferred to 2026+ to protect tier-1 service availability.

**For Stakeholders (Leadership/Management):**
- **[Technical Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md)** - Complete project plan, timeline, architecture

**For [3YAP](https://quip-amazon.com/l52lAKv6Kb93/3YAP-execution-plan) Contributors:**
- **[Use Cases & Strategy](phase-2/mcp-weblab-anywhere-use-cases-strategy.md)** - Aaron's primitive (Sergio/Doug/YJ/Arpit support)
- **[Technical Vision](phase-2/mcp-weblab-anywhere-technical-vision.md)** - Sergio's primitive (Doug/YJ/Arpit support)

**Deadline:** October 20, 2025

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
- [Doug (Oct 8)](weblab-mcp-meetings/doug-10-08.md) - CloudAuth MCP SDK, Andes access from Lambda
- [Adam (Oct 8)](weblab-mcp-meetings/adam-10-08.md) - Experimenter use cases, data freshness, operational focus

---

## Project Status

**Phase 1 Complete:**
- 3 core MCP tools built and tested (details, allocations, history)
- Tested with Vignesh (director demo)

**Phase 2 Current (October 2025 - Q1 2026): READ-ONLY TOOLS ONLY**
- **CRITICAL**: Read-only operations ONLY - no create/modify/delete experiment capabilities
- **Tools**: Experiment details, allocations, history, data queries (WSTLake + Weblab APIs)
- **Write Capabilities**: Deferred to Phase 3 (2026+) after safety measures proven
- **Architecture**: Remote Strands agent (Lambda/Fargate hosted)
- **Timeline**: 16 weeks to Q1 2026
  - Weeks 1-3: Foundation & investigation (PoC, package setup)
  - Weeks 4-9: Core development (6 weeks - tool migration, agent integration)
  - Weeks 10-12: MCP protocol implementation (3 weeks)
  - Weeks 13-14: Deployment (CDK infrastructure, registry)
  - Weeks 15-16: Compliance & production launch
- **Effort Breakdown**: 6 weeks dev + 3 weeks MCP + 2 weeks deployment + 2 weeks compliance + 3 weeks foundation = 16 weeks
- **Deadline**: Q1 2026 (CCI P0)
- **Status**: CloudAuth Python MCP SDK available, ready to execute

**Phase 3 Future (2026+): Write Capabilities**
- Create/modify experiments
- Automated dial-up workflows
- Full experiment lifecycle automation
- Requires safety measures and monitoring before enablement

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
- [All Meetings](weblab-mcp-meetings/) - transcripts from meetings to get user scenarios and data access ideas

---

## Quick Navigation

**I need to:**
- **Understand the project** → Read [Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md)
- **Contribute to 3YAP** → Read [Use Cases](phase-2/mcp-weblab-anywhere-use-cases-strategy.md) or [Technical Vision](phase-2/mcp-weblab-anywhere-technical-vision.md)
- **Start development** → Read [Phase 2 Dev Setup](phase-2/phase-2-dev-setup.md)
- **Understand decisions** → Read [MCP Mandate](phase-2/mcp-everywhere-mandate.md) and [Chetan Thread](../threads/chetan-amzn-mcp-thread.md)
- **See meeting outcomes** → Check [All Meetings](weblab-mcp-meetings/)
- **Phase 1 reference** → Check [Phase 1 documentation](phase-1/phase-1-readme.md)

---

**Need Help?** Check [Roadmap](phase-2/mcp-weblab-anywhere-roadmap.md) first, then reach out to Sergio Ibagy
