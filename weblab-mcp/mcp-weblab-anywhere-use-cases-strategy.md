# MCP/AI Use Cases and Strategy - Brainstorm

**Owner:** Will (with support from Sergio, Doug, YJ, Arpit)  
**Date:** October 2, 2025  
**Purpose:** Input for Weblab 3YAP - Use cases and strategic direction for MCP/AI integration  
**Status:** DRAFT - Brainstorming phase, not final

---

## Purpose of This Doc

Low-stakes brainstorm to identify:
- What MCP/AI capabilities Weblab needs
- Real use cases from customers and internal teams
- Strategic direction for next 3 years
- Open questions and debates

**Not meant to be:** Polished, complete, or independently readable outside weblab builders

---

## Pain Points Today

### Manual SQL Query Hell
**Real example from Kevin (YJ meeting):**
- Query for "launched weblabs with stat sig CP impact"
- **Took 3 days to formulate**
- 100+ lines SQL joining activation_events + weblab_analysis_results
- Complex filters for dimensions, triggers, sample counts
- Error-prone, requires deep Andes schema knowledge

**Impact:** Only data experts can get answers. PMs and non-tech users blocked.

### Web Scraping Chaos
- Teams resort to scraping weblab.amazon.com pages
- Fragile, breaks with UI changes
- Weblab team doesn't want it
- No proper auth or rate limiting

### Data Access Limited to Weblab Team
- Andes access requires team membership or manual requests
- Can't give broad Amazon access without security concerns
- Blocks AI agent usage for most employees

### Existing Tools Insufficient
- WSS has 125 clients but limited functionality
- No natural language interface
- Read-only, no automation capabilities
- Doesn't integrate with AI workflows

---

## Use Cases Collected

### From Ryan Meeting (Oct 2)

**Operational/Support:**
- "Does my experiment have a TAA?" → Auto-detection workflow
- "Check allocation history for experiment XYZ" → Troubleshooting
- "Is experiment ABC running properly?" → Health monitoring
- "What changes were made to my weblab?" → Audit trail

**Strategic:**
- Integration with WLBR.AI (doesn't use Andes data yet)
- Natural language querying of WSTLake tables
- Conversational workflows for experiment guidance
- Support for science team data requirements

### From YJ Meeting (Oct 2)

**VP-Level Reporting (Dave Moore):**
- Find weblabs with large, stat sig CP results
- Filter by launched or dialed to 100%
- Complex joins across multiple Andes tables
- **Current solution:** 3-day manual SQL query

**Cart Policy Enforcement (Abhi Gupta):**
- Experiments launched in cart (last 6 months)
- Impact metrics (OPS, CSales, GCCP)
- Policy compliance indicators (met policy vs SEV-2 override vs exceptions)
- Experiment change type and business area breakdown
- **Needs:** Automated reporting for leadership alignment

### From Michael Meeting (Oct 2)

**Tool Scope Decisions:**
- **Read-only initially:** Querying, discovery, analysis
- **Write access later:** Create/modify experiments, dial up/down
- **Never:** Code modification (crosses team boundaries)
- **Focus:** Organizational discovery, troubleshooting TAAs

### From Stewart's Requirements Doc

**Customer Teams:**
- **MCM:** Automated dial-up workflows, policy respecting
- **CSM:** Safety checks during high traffic
- **FMA:** ASIN randomization automation (150 weblabs/year)
- **WAE:** Multivariate experiment automation
- **Weblab UI:** Horizonte migration needs

---

## Strategic Proposals

### Proposal 1: Natural Language Interface (Proven)

**Evidence it works:**
- Beta UI already exists: https://beta.console.harmony.a2z.com/weblab-data-management/wstlake-query
- Built by intern, functional
- Users prefer questions over SQL

**Approach:**
- Agent-based interface on top of MCP tools
- Not raw MCP access (too technical)
- Question refinement and preprocessing
- Domain knowledge embedded in agent prompts

**Open debate:** 
- Simple Q&A vs conversational workflows?
- How much hand-holding vs expert mode?

### Proposal 2: Modular Building Blocks

**From Ryan meeting:**
> "Focus on building modular tools (building blocks) rather than trying to capture all possible use cases upfront"

**Strategy:**
- Core read tools: details, allocations, history
- Analytical queries: complex SQL via agent
- Future: write tools for automation

**Benefits:**
- Flexible combination for different workflows
- Can integrate with existing tools (WLBR.AI, WSS)
- Avoids monolithic "do everything" approach

**Open question:** How granular should blocks be?

### Proposal 3: Integration Over Replacement

**Don't replace WSS**, integrate and enhance:
- WSS stays for legacy clients (125 dependencies)
- MCP/AI provides modern interface
- Both can coexist during transition
- Gradual migration based on user adoption

**Integration points:**
- WLBR.AI (add Andes data access)
- WSS (when modernized, can be MCP tool)
- MCM/CSM (automation consumers)
- Existing workflows (enhance, don't break)

**Debate:** When does WSS become optional vs required?

---

## 3-Year Vision (Rough Thoughts)

### Year 1 (2026): Foundation
- Remote Strands agent deployed (Q1 mandate)
- 3 core read tools migrated
- Natural language queries working
- Integration with andes-mcp for complex SQL
- Small user base (weblab team + early adopters)

### Year 2 (2027): Automation
- Write tools added (create/modify experiments)
- MCM/CSM integration for automated workflows
- Multi-agent patterns (specialized agents for different tasks)
- Broader adoption (hundreds of users)
- WSS modernization integrated

### Year 3 (2028): AI-Native Workflows
- Fully conversational experiment lifecycle
- Proactive recommendations ("you should check...")
- Multi-agent collaboration (science + engineering + PM agents)
- Self-service for complex analysis
- AI writes experiments based on requirements?

**Note:** Year 3 is speculative but grounded in existing capabilities trending

---

## Open Questions & Debates

### Debate 1: Scope of Automation

**On one hand:** 
- Start read-only, prove value, then add write capabilities
- Lower risk, easier security certification
- Matches current Phase 1 progress

**On the other hand:**
- Real automation value is in write operations (dial-up, etc.)
- Read-only limits use cases to reporting/monitoring
- May lose momentum if we wait too long

**Current thinking:** 
- Read-only Phase 2 (Q1 2026)
- Write capabilities Phase 3 (mid-2026)
- Gives time to prove architecture and build confidence

### Debate 2: Direct Tool Access vs Agent-Only

**On one hand:**
- Users could call individual MCP tools directly (like Phase 1)
- More control, deterministic
- Good for automation systems (MCM, CSM)

**On the other hand:**
- Agent interface is more user-friendly
- Handles complexity, domain knowledge
- Better for non-experts (PMs, leadership)

**Current thinking:** 
- Support BOTH
- Power users can call tools directly
- Regular users use agent interface
- Agent can orchestrate multiple tools

### Debate 3: Which Data Source?

**Options from YJ meeting:**
- **Redshift cluster:** Proven, scalable, Kevin has CDK patterns
- **Athena MCP:** No infrastructure costs, leverage andes-mcp
- **Direct WSTLake:** Not recommended, too complex

**Current thinking:**
- Start with Redshift (proven, controllable)
- Investigate Athena as cost optimization
- Decision by Nov 2025

### Debate 4: Integration Depth with WLBR.AI

**Questions:**
- Should MCP tools be embedded in WLBR.AI?
- Or separate but complementary?
- Who owns the integration work?
- Timeline alignment with WLBR.AI roadmap?

**Need input from:** WLBR.AI team, Will

---

## Dependencies & Partnerships

### Need from Other Teams

**WSTLake team (Kevin, YJ):**
- WSTLake 2.0 timeline and migration path
- Data access patterns for agents
- Cost modeling for query volumes

**Science team (Arpit):**
- Andes natural language query presentation (Oct 3)
- Analytical use cases and requirements
- Validation of complex queries

**WLBR.AI team:**
- Integration strategy and timeline
- Shared agent patterns
- Andes data access requirements

**MCM/CSM teams:**
- Automation use case details
- API requirements
- Policy integration needs

### Provide to Other Teams

**What we can offer:**
- Weblab data access via MCP
- Natural language query capability
- Agent patterns for complex workflows
- Reference implementation for other teams

---

## Customer Segments

### Technical Users (Engineers)
**Needs:** 
- Direct tool access for automation
- API contracts and error handling
- Integration patterns
**Solution:** MCP tools with clear schemas

### Power Users (PMs, TPMs)
**Needs:**
- Complex queries without SQL
- Ad-hoc analysis and reporting
- Fast answers to business questions
**Solution:** Agent interface with natural language

### Leadership
**Needs:**
- High-level insights (Dave Moore use case)
- Policy compliance reporting (Abhi use case)
- Trend analysis
**Solution:** Pre-built report templates + agent customization

### Automation Systems (MCM, CSM, FMA)
**Needs:**
- Programmatic access
- Policy-aware APIs
- High throughput
**Solution:** Direct tool access with proper auth

---

## Success Metrics (Strawman)

**Adoption:**
- X users by end of 2026
- Y queries/day by mid-2027
- Z automation integrations by 2028

**Efficiency:**
- 3-day queries → <1 minute
- Reduce manual weblab support tickets by N%
- Self-service rate for common questions

**Business Impact:**
- Faster experiment insights
- Better decision-making (data access democratized)
- Reduced operational toil

**Note:** Need to define actual targets with Will/leadership

---

## Risks & Mitigations (Initial Thoughts)

### Risk: Not Enough Value for Effort

**Concern:** Building complex AI system but limited use cases?  
**Counter:** Already have concrete needs (Dave, Abhi, MCM)  
**Mitigation:** Start small (3 tools), expand based on usage

### Risk: Competing with WSS

**Concern:** WSS team sees this as replacement/threat?  
**Counter:** WSS mandated for MCP anyway (CCI requirement)  
**Mitigation:** Frame as enablement, not replacement. Integrate when possible.

### Risk: Data Access Complexity

**Concern:** WSTLake access patterns too complex for agents?  
**Counter:** Beta NL UI already works, Kevin's queries can be templatized  
**Mitigation:** Start with simple queries, expand gradually

### Risk: User Adoption

**Concern:** Users prefer existing tools/workflows?  
**Counter:** 3-day SQL queries prove pain point is real  
**Mitigation:** Make it dramatically better (seconds vs days)

---

## Next Steps for This Doc

- [ ] Review with Doug, YJ, Arpit
- [ ] Collect additional use cases from team
- [ ] Validate with Will for all-up 3YAP
- [ ] Refine strategy based on feedback
- [ ] Document any debates that need resolution

---

## Questions for Will (3YAP Consolidation)

1. How does this align with other primitive areas?
2. Any conflicts with Control Plane or WSTLake visions?
3. What level of detail do you need for all-up doc?
4. Timeline for completing brainstorm docs?

---

## Appendix: Raw Notes

### From Meeting Notes
(Include relevant excerpts from Ryan, YJ, Michael meetings as needed)

### Use Case Prioritization (TBD)
- Which use cases are P0 vs P1 vs future?
- What dependencies block which use cases?
- Effort estimates per use case?

### Customer Requests Not Yet Captured
- Leadership may have additional requests
- Science team requirements pending Arpit presentation
- Other teams not yet interviewed

---

**Document Status:** DRAFT - Brainstorm phase  
**Next Review:** Week of October 7 with Will  
**For:** Input to Weblab 3YAP all-up document
