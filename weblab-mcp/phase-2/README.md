# Phase 2: Remote Strands Agent Implementation

This directory contains documentation for Phase 2 of the weblab MCP integration - implementing a **remote-first Strands agent** that satisfies the MCP Everywhere CCI mandate.

---

## Phase 2 Scope (Q1 2026)

### What's Included in Phase 2

**Layer 1: Read-Only MCP Tools**
- 4 core tools: `weblab_details`, `weblab_allocations`, `weblab_activation_history`, `query_wstlake`
- Deterministic, no LLM reasoning
- Direct tool access via MCP protocol

**Remote-First Deployment**
- Lambda-hosted (not local machine)
- MCP protocol interface (remote access)
- CloudAuth + Transitive Auth
- OpenTelemetry observability

**Direct Tool Access**
- Q CLI, Cline, and other MCP clients call tools directly
- Q's LLM handles orchestration decisions
- Fast, predictable responses (<2s)

### What's NOT in Phase 2 (Year 2+ Work)

**❌ Layer 2: Specialized Agents**
- TAA root cause analyzers (8 agents)
- WLBR.ai integration as Layer 2 agent
- Policy compliance checker
- Experiment health analyzer

**❌ Layer 3: Enhanced Orchestrator**
- Multi-agent coordination
- Complex multi-step workflows
- Specialized agent orchestration

**❌ Write Capabilities**
- Create/modify experiments
- Dial-up automation workflows
- Experiment lifecycle management

---

## Phase 2 Focus: Foundation

Phase 2 provides the **foundation** for future agent capabilities:
- Proves remote-first architecture works
- Validates read-only safety approach
- Establishes production patterns (Doug's reference)
- Sets stage for Year 2+ specialized agents

**Timeline**: Q1 2026 (MCP Everywhere CCI P0 deadline)

**See**: [Technical Vision](mcp-weblab-anywhere-technical-vision.md) for complete 3-layer architecture evolution showing how Phase 2 foundation enables Year 2+ specialized agents.

---

## Why Remote-First Matters

**MCP Everywhere CCI Mandate (October 2025):**
> "Remote-First Architecture: Implementing a Remote Agent-first and Remote MCPServer-first approach for better scalability and share-ability."

**Phase 2 Compliance:**
- Strands agent deployed in AWS (remote)
- Lambda auto-scaling (scalable)
- MCP protocol endpoint (shareable)
- CloudAuth + Transitive Auth (production auth)
- OpenTelemetry observability (production-ready)

**See:** [MCP Everywhere Mandate Analysis](../weblab-mcp/mcp-everywhere-mandate.md)

## Documents

- `doug-enhanced-phase-2-approach.md` - Doug's production Strands patterns and recommendations
- `doug-strands-patterns-reference.md` - Reference implementation patterns from Doug's production work
- `phase-2-strands-implementation-plan.md` - Implementation plan for Strands integration
- `strands-agents-reference.md` - General Strands agent development reference

## Status

Phase 2 is **future work**. Phase 1 (MCP tools) is complete and validated.
