# Weblab Data Platform Vision

**Purpose**: MCP implementation strategy

## TL;DR;

* Mandate: WSS is P0 for MCP by Q1 2026.
* Strategy: Ship a production "weblab-mcp" that provides WSS-equivalent functionality (search + allocations) and adds analytical access (WSTLake).
* Outcome: One MCP platform for discovery → details → monitoring → analysis. Meets CCI, unlocks agent workflows across Amazon.

---

## WSTLake Access Update

**Quick update on data access**: Initial discussions suggest making weblab tables available read-only to all Amazon via Midway auth. This could solve our core data access challenge.

**What this enables:**

* Direct WSTLake access - no more Andes subscription complexity
* Analytical data available - results, metrics, triggers
* All Amazon employees could access via Midway
* Clear auth model we can implement

This changes the problem from "how do we get data?" to "how do we build the weblab-mcp server?" If this path gets approved, we can focus on building MCP tools with the analytical data users actually need.

---

## The Mandate

### MCP Everywhere CCI (Category II - Must Do)

* **Official SIM**: [P282079924](https://issues.amazon.com/P282079924)
* **CCI Assessment**: [Quip Document](https://quip-amazon.com/JLUDAZv52yL7/2026-Cross-Cutting-Initiatives-MCP-Everywhere-sibagy)
* **Wiki**: [MCP CCI Planning](https://w.amazon.com/bin/view/ECommerceFoundation/Cross_Cutting_Projects/2026Planning/Finalized_Stores_CCI_2026_List/#HCCI-CategoryII5BMustdo2Cbutimpactsasmallnumberofteams-SomeStoresteamsmustplanforthisinOP15D)

### Why WSS is Mandated (From CCI Doc)

**WeblabSearchService** appears in Appendix A4: "Coral Services that have 100+ Client services and have usage beyond their L10 organization"

| Service             | Client Dependencies | Owner    | L11    |
| ------------------- | ------------------- | -------- | ------ |
| WeblabSearchService | **125**             | kannappa | cmbeau |

**Criteria Met:**

* **125 client dependencies** (>100 threshold)
* **Cross-organizational usage** (beyond L10)
* **Therefore P0 mandated** for MCP implementation

**Timeline**: **Q1 2026 (Non-negotiable)**

---

## Reframing the Problem

### What The Ask Looks Like:

> "WSS is mandated for MCP, so make that service MCP-compliant"

### What We Should Propose:

> "**WSS functionality will be provided through our weblab-mcp server**. We built an MVP and can deliver weblab data access that includes search plus much more."

---

## Current Weblab MCP Capabilities

### What We Built as MVP/Prototype

1. **`weblab_details`** - Complete experiment metadata, configurations, treatments
2. **`weblab_allocations`** - Real-time treatment allocations across realms/marketplaces
3. **`weblab_activation_history`** - Full timeline of allocation changes with MCM tracking

**Status**: Prototype in `amzn-mcp-local` to validate assumptions and prove concept

### What These Tools Enable Today:

```
User: "Get complete details for experiment ABC123"
→ Full metadata, treatments, launch criteria, ownership, CTI info

User: "What are the current allocations for XYZ456 in all marketplaces?"
→ Real-time allocations per marketplace/realm with percentages

User: "Show me the allocation history for DEF789 with change details"
→ Complete timeline with user changes, MCM numbers, timestamps
```

### The Missing Pieces

#### Discovery

```
User: "Show me MY active experiments"
User: "Find experiments owned by my team"
User: "List experiments modified this week"
User: "Search for experiments about checkout"
```

#### Analysis

```
User: "Does my experiment have a TAA"
User: "Do we have results for experiment XYZ"
User: "?"
```

**Key Insight: We have basic operational data, but we're missing the rich analytical data (results, metrics, triggers) that lives in WSTLake!**

#### Backed by WSTLake datasets

MCP isn’t just re-implementing WSS. By plugging into WSTLake, MCP can expose:

* **Experiment metadata** and ownership (`weblab_metadata`)
* **Activation history** across realms/marketplaces (`activation_events`)
* **Metrics and launch criteria** (OPS, Net-CP, GCCP, guardrails) from `weblab_metrics` and `launch_criteria`
* **Full analysis results** including regression-adjusted outputs (`weblab_analysis_results`)
* **Experiment decisions** and rationale (`experiment_decisions`)
* **Worldwide rollups** and long-running weblab governance (`weblab_rollups`, `long_running_weblabs`)

---

## The Value Proposition

### For Users:

* **Complete Weblab workflow** - Discovery → Details → Monitoring
* **Natural language interface** - "Show me my experiments" not complex queries
* **Real-time data** - Live allocations, instant updates
* **Rich context** - Full metadata, not just search results

### For Amazon:

* **MCP Compliance** - Check the box for WSS mandate
* **MCP Example** - Show how to do MCP implementation properly

### For Our Team:

* **Technical growth** - Modern patterns vs legacy maintenance
* **Business impact** - Enable AI automation vs basic compliance

---

## Risk Assessment

### Risk: "But WSS is Mandated"

**Response**: "WSS MCP compliance is mandated. We can achieve that with minimal interface while building the real solution."

### Risk: "125 Client Dependencies"

**Response**: "We provide better functionality. Clients will migrate naturally. Legacy interface keeps existing ones happy."

### Risk: "Timeline Pressure"

**Response**: "This is XL-sized work requiring investigation time plus significant development. We need WSTLake data access and our prototypes haven't solved that for regular users yet."

---

## What We Will Deliver

1. **MCP Compliance** - Weblab data accessible via dedicated weblab-mcp server
2. **Data Access** - Discovery, operational data, and analytical data via MCP
3. **Business Value** - AI-powered experiment workflows for all Amazon employees
4. **Production Server** - weblab-mcp server with WSTLake integration
5. **Future Extensibility** - MCP server that agents (e.g., WLBR.ai) can consume

---

## Risks & Mitigations

* **WSTLake access slips** → Deliver operations + search first; fallback Andes adaptor; flip to WSTLake when ready.
* **Cost spike on ad-hoc queries** → Provide curated views, sampled previews, and clear warnings on full scans.
* **Auth ambiguity (“all employees” analytics)** → Gate analytics behind capability flags; default discovery-only for broad audience.
* **Timeline pressure** → Phase delivery (MVP → production) and set clear non-negotiable vs stretch goals.

---

## Migration Path

**Phase 0 – Shim:** Keep WSS as-is. Add MCP proxy interface that forwards to WSS for mandated compliance.
**Phase 1 – Dual:** MCP provides discovery + allocations directly. WSS remains for legacy clients; both paths valid.
**Phase 2 – Expansion:** Add WSTLake analytics to MCP. Encourage adoption through richer functionality.
**Phase 3 – Long-term:** WSS continues to serve legacy clients; MCP is the forward-looking platform for agents and new workflows.

---

## Next Steps

### Immediate:

1. **Review WSS current state** - Understand how it gets data
2. **Weblab WSTLake** - How to access all the data in a frugal way
3. **Stakeholder alignment** - Present platform vision vs WSS fix

### Long-term (Major Development Effort)

1. **Build weblab-mcp server** - Production MCP server with data access
2. **Implement WSTLake integration** - Direct access to weblab analytical data
3. **WSS functionality integration** - Include search capabilities in weblab-mcp platform
4. **Migration planning** - Replace amzn-mcp-local prototype when production ready

---

## The Bottom Line

**We built the MVP (operational data via WeblabAPI). Now we need to build production weblab-mcp server with WSTLake analytical data.**

The WSS MCP mandate gives us the justification to build complete weblab data access. The key dependency is formal approval for WSTLake read-only access. Once that’s in place, we can:

1. **Build weblab-mcp server** - Dedicated MCP server for weblab data
2. **Include WSS functionality** - Search capabilities as part of platform
3. **Access WSTLake directly** - Analytical data for all Amazon employees
4. **Deliver complete solution** - Discovery + operational data + analytical data

### Success Metric:

When someone asks "How does Amazon enable AI agents to work with Weblab?", the answer is **"Use the Weblab MCP Platform"** - not "go to the web and use the HTML pages."

---

## Assessment Needed

### Questions for Adam:

1. **Current WSS State**

   * What are the main pain points/technical debt?
   * Performance issues or scalability concerns?
   * Maintenance?

2. **API Capabilities**

   * What search functionality already exists?
   * Which APIs would be most valuable for MCP?
   * How does WSS access WSTLake data?
   * What analytical data can WSS provide?

3. **Timeline Reality Check**

   * Is Q1 2026 achievable given current state?
   * What would need to happen to meet deadline?
   * Risk areas or potential blockers?

---

## Immediate Next Steps

### Now

1. **WSS Assessment Session** - Deep dive on current state with Adam
2. **Review CCI Requirements** - What exactly MCP compliance means
3. **Scope Definition** - MVP vs full implementation
4. **Resource Planning** - Team availability and skills

### Next

1. **Technical Design** - MCP interface specification
2. **Implementation Plan** - Phased approach to Q1 2026
3. **Stakeholder Communication** - Update stakeholders on mandate
4. **CCI Coordination** - Align with program requirements

## References

* [MCP Everywhere CCI Assessment](https://quip-amazon.com/JLUDAZv52yL7/2026-Cross-Cutting-Initiatives-MCP-Everywhere-sibagy)
* [CCI Official SIM](https://issues.amazon.com/P282079924)
* [CCI Planning Wiki](https://w.amazon.com/bin/view/ECommerceFoundation/Cross_Cutting_Projects/2026Planning/Finalized_Stores_CCI_2026_List/#HCCI-CategoryII5BMustdo2Cbutimpactsasmallnumberofteams-SomeStoresteamsmustplanforthisinOP15D)
* [Current Working Tools](weblab-mcp-technical-summary.md)
* [Investigation Results](weblab-data-access-investigation-findings.md)
* [Project Roadmap](mcp-weblab-anywhere-roadmap.md)
* [WeblabSearchService Package](https://code.amazon.com/packages/WeblabSearchService)



---

# SJWinter meeting 9/30/25

## WSS:
- https://w.amazon.com/bin/view/Weblab/Manual/UI_Search
- https://w.amazon.com/bin/view/Weblab/Components/WeblabSearchService
- what people do with it?
- can we get metrics? Queries?

## Roadmap

