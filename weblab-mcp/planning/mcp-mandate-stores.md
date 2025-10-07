# MCP Everywhere Mandate - Amazon Stores 2026

**Tags:** #mcp #amazon #mandate #2026 #genai #weblab #stores #agentic-ai #coral-services #webtools

## Overview
Amazon's cross-SDO mandate requiring Model Context Protocol (MCP) implementation for high-impact services and webtools by Q1 2026 to enable agentic AI transformation.

## Strategic Vision

### Why This Matters
Agentic AI represents a transformative opportunity to re-envision how we approach all classes of work across Amazon. Beyond simply optimizing individual productivity, this technology enables us to construct **hybrid teams** where people collaborate seamlessly with autonomous, task-specific AI agents that can operate independently.

In this reimagined workplace, AI agents—whether acting autonomously or on behalf of employees—must have comprehensive access to both our extensive service infrastructure and the human-centric tools we use today, blurring the line between people processes and software services.

### Amazon's Competitive Advantage
Our existing micro-service architecture positions us to lead this transformation:
- **~111,433 Coral framework services**
- **~263,031 Amazon internal webtools** (per Quicksight dashboard)

Implementing MCP will standardize the way AI agents interact with our systems and tools, enabling automated workflows and enhanced productivity. Adoption of MCP interfaces across our services will encourage rapid agent building, enabling better preparedness for the rapidly evolving AI landscape.

## Implementation Scope & Priorities

### P0 Priority (Q1 2026)
- **3,031 Amazon Webtools** with >100K hits/30 days
- **463 Coral Services** with 100+ client services and usage beyond L10 org
- **15+ domain categories** for webtool classification
- Focus on services "at the top of the stack, closer to customers and business"

### Effort Estimates
- **Before Automation:** 394 Person Years (PY)
- **After Automation:** 65 Person Years (PY)
- **SIM Link:** P282079924
- **Program Owner:** Rama Malka
- **Tech VP Sponsor:** Jeetu Mirchandani

### P1 Priority (Q3 2026)
- All remaining existing Coral services
- All remaining existing Webtools

### Future Services (Default)
- All newly created Webtools and Coral services will have MCP protocol enabled by default through **BuilderHub templates**

### Ongoing Process
- **Monthly cadence** to identify new high-impact Webtools for priority list
- Teams not on P0 list should prioritize MCP work as requests come in
- **Internal MCP classification and registry tool** for effective server discoverability and administration

## Timeline & Milestones

### Q1 2026 (P0 Deadline)
- 3,031 high-impact webtools MCP implementation
- 463 high-impact Coral services evaluation and potential inclusion
- Read-only MCP implementation focus

### Jan 2026 (Review Point)
- Scrutinize 463 Coral Services for P0 inclusion based on progress and learnings

### Q3 2026 (P1 Deadline)
- All remaining existing Coral services
- All remaining existing Webtools

### Sept 22, 2025
- Dashboard update after vetting raw data to remove references to webtools like federate, midway

## Team Strategy
- **Q1 2026:** Read-only MCP implementation
- **Post-Q1:** Work with CRRE for safe write operations
- **Current status:** Team has head start with existing weblab MCP work

## Technical Challenges

### Remote MCP Authentication for Autonomous Agents
**Problem:** Current MCP servers rely on Midway tokens stored locally, fundamentally tied to human presence (YubiKey authentication). This creates blockers for autonomous agents and agentic workloads where no user is in the loop.

**Impact on WLBRai Integration:**
- WLBRai (GenAI-powered experimentation assistant) runs entirely in AWS
- Operates as autonomous agent in certain use cases
- Cannot present Midway token or touch YubiKey
- Current approach introduces fragility and friction limiting broader uptake

**Broader Ecosystem Impact:**
- Affects teams exploring agents, workflows, post-processing pipelines, ML tuning loops, monitoring bots
- Creates pressure to spin up custom MCP servers (fragments "MCP Everywhere" vision)
- Operational overhead and risk of diverging implementations

**Need:** First-party solution supporting non-human agents while preserving MCP security guarantees and enabling automation.

### AWS Lambda Integration Gap
- No current solution for calling MCP servers from AWS Lambda
- Impacts dogfooding of MCP tools (e.g., WLBRai integration)
- Workaround: Custom tools accessing results APIs directly
- Alternative: Spin up dedicated MCP server (defeats "MCP Everywhere" purpose)

### Key Contacts
- **Erik Karulf:** Reviewing MCP asks for Llew's org, has CCI context, working on remote authentication solutions
- **James McQueen:** Skip manager, coordinating strategy
- **Doug Hains:** Working on WLBRai integration, identified autonomous agent authentication challenges
- **Vignesh:** Leadership coordination

## Resources
- [Finalized Stores CCI 2026 List](https://w.amazon.com/bin/view/ECommerceFoundation/Cross_Cutting_Projects/2026Planning/Finalized_Stores_CCI_2026_List/#HCCI-CategoryII5BMustdo2Cbutimpactsasmallnumberofteams-SomeStoresteamsmustplanforthisinOP15D)
- [MCP Everywhere Initiative Details](https://quip-amazon.com/uQxCAfeS0IIs/2026-Cross-Cutting-Initiatives-MCP-Everywhere)
- Amazon-wide MCP Slack channel (active discussions)

## Action Items
- [ ] Implement read-only MCP for weblab services by Q1 2026
- [ ] Coordinate with CRRE for write operation safety
- [ ] Monitor AWS Lambda MCP integration developments
- [ ] Follow up with Erik on centralized remote authenticated MCP timeline
- [ ] Address autonomous agent authentication challenges for WLBRai and similar agentic workloads
- [ ] Explore first-party solutions for non-human agent MCP access

