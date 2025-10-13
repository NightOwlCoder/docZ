# Chetan Soni - amzn-mcp Discussion Thread

**Context:** Discussion about merging weblab MCP tools into AmazonInternalMCPServer vs creating standalone server

**Participants:**
- Sergio Ibagy (sibagy) - Weblab team
- Chetan Soni - AmazonInternalMCPServer maintainer

---

## September 26, 2025 - Initial Inquiry

**Sergio Ibagy (10:37 PDT):**
> Hey there, I saw you are one of the people who approves AmazonInternalMCPServer.
> I've added some weblab tools into it, but I need to work on metrics before sending the CR (higher up management request).
> Can you help me with this question?
> 
> I'm building weblab tools in the community amzn-mcp (AmazonInternalMCPServer), but i can't answer questions like "how many users?".
> I see EMF goes to account 976193224607, but I can't access those CloudWatch dashboards.
> How do tool contributors usually get visibility into usage metrics?
> Any guidance on accessing the monitoring data or should we roll our own?

**Chetan Soni (11:37 PDT):**
> Hi Sergio, we are actually working on a plan to decompose amzn-mcp into smaller servers, each one strongly owned by their respective team. from my understanding, weblab is implemented as a strategy (under readinternalwebsite) at the moment, hence will not need new ownership and will ship with the default readinternalwebsite tool. we are limiting the contribution to hotfixes only and are encouraging users to write the tools in their own servers and vend via mcp-registry golden path. I will be posting this information on broader channels soon, but we have already been reaching out to the owners of the existing tools. Let me know if I can help further.

**Chetan Soni (11:38 PDT):**
> Regarding your questions on metrics, I am not sure how to get permissions but toolbox publishes its own dashboard. we have metrics at the tool level but not at the strategy level hence weblabs individual usage will be difficult to gather.

---

## September 26, 2025 - Clarification on Implementation

**Sergio Ibagy (15:05 PDT):**
> Hi Chetan,
> thanks for the context on amzn-mcp decomposition - that's helpful to understand the direction.
> 
> A few clarifications on the weblab tools:
> 
> **1. API vs Page Scraping**
> We specifically built weblab tools (weblab_details, weblab_allocations, weblab_user_experiments, etc.) to replace read_internal_website scraping. The weblab team doesn't want people scraping our pages - that's exactly why we created proper MCP-based tools with structured schemas and authentication.
> 
> **2. Tools vs Strategies Confusion**
> I'm not sure what you mean by weblab being "strategies" - we implemented standalone tools with their own paramSchemas and callbacks (weblab_details, weblab_allocations, etc.). These aren't strategies under read_internal_website - they're independent tools that use weblab APIs directly. Could you clarify what makes something a "strategy" vs a "tool"?
> 
> **3. Metrics Visibility**
> The core issue remains: I need metrics to answer stakeholder questions like "how many users?" but can't access account 976193224607. You mentioned toolbox publishes dashboards - is there a way to get weblab tool usage visibility, or should we implement our own metrics collection?
> 
> **4. Standalone Server Challenges**
> While I understand the decomposition direction, a standalone weblab MCP would require rebuilding the entire Midway authentication stack, which seems like significant duplicate effort. Is there a middle ground for tool-specific metrics within the existing infrastructure?
> 
> Would appreciate your thoughts on the tool vs strategy distinction and any guidance on metrics access.

**Chetan Soni (15:21 PDT):**
> that is great to hear, having the right set of strongly owned tools in a custom server is the recommended approach.
> 
> strategy is essentially a way to perform a customized GET request and process information using the ReadInternalWebsite tool. you can think of this custom tool as a headless browser making http calls using midway token. strategy works great because it is deterministic when a URL is predefined. Strategy overall consumes lesser tokens than dedicated tools because of the tool requirements - description, schema, params. In this case, ReadInternalWebsite is a tool that encapsulates strategies which is unknown to the AI callers. AI Agents can only see the mcp tools surfaced.
> 
> Regarding the metrics, I dont have a way to look into usage of the specific strategy. We log usage at the tool level (~4k invocations a day for ReadInternalWebsite). With the new server, you will have to implement your own metrics.
> 
> Standalone Server Challenges - From my understanding, the golden path (create hub template) already takes care of the midway stack, please correct me if I am wrong. Logging and metrics implementation is something we will be adding soon. Let me know if there are still open questions.

---

## September 26, 2025 - Request for Temporary Merge

**Sergio Ibagy (17:24 PDT):**
> Hi Chetan,
> Thanks for the detailed response! Just to clarify the weblab implementation:
> 
> **Weblab Tools Are Standalone, Not Strategies**
> The weblab tools are implemented as first-class tools (not strategies under read_internal_website):
> - Tools: weblab_details, weblab_allocations, weblab_activation_history, etc.
> - Direct API calls: WeblabAPIModel (GetExperiment, ListAllocations, ListAllocationPeriods)
> - Custom authentication: Combines Weblab API keys with Midway tokens (more complex than standard Midway-only patterns)
> 
> We specifically avoided the strategy pattern because:
> - Weblab team prohibits page scraping
> - Need proper API authentication (not just HTTP GET)
> - Require structured schemas for experiment IDs, domains, realms
> 
> **Re: Metrics**
> Understood on the metrics limitation - since these are in the tool layer (not strategy), I'll implement our own metrics collection.
> 
> **Re: Standalone Server**
> Thanks for pointing to the golden path! I'll check out the Create Hub template.
> If it handles Midway auth, the main complexity would be adding weblab-specific API key management on top. I'll explore this path and may reach out with questions on best practices for dual authentication (Midway + service API keys).
> 
> **One More Question:**
> Given that we've already developed 3 production-ready weblab tools (weblab_details, weblab_allocations, weblab_activation_history) with comprehensive tests and documentation, is there any path to merge these in the near term?
> 
> These tools use the public WeblabAPIModel APIs (GetExperiment, ListAllocations, ListAllocationPeriods) and combine Midway authentication with Weblab API keys - they're specifically designed to replace the problematic weblab-strategy.ts page scraping that the weblab team wants eliminated.
> 
> We're under leadership pressure to collect usage metrics to justify further weblab tooling investment. Having these 3 tools live in amzn-mcp even temporarily would:
> - Give us critical adoption data (how many users, which experiments, success rates)
> - Replace the page scraping approach with proper API access
> - Demonstrate value to justify eventual standalone server
> - Start collecting data immediately vs waiting months for decomposition
> 
> We understand the direction is team-owned servers, but we need usage data to build the business case. The alternative is we're blocked on any metrics collection, making it difficult to justify the standalone investment.
> 
> Would a temporary merge be feasible while we plan the migration? We can commit to the eventual transition and mark these appropriately.

---

## October 2, 2025 - Final Decision

**Chetan Soni (23:54 PDT):**
> **Weblab Tools Are Standalone, Not Strategies**
> I understand this part, and that's why suggesting to use your own server.
> 
> **is there any path to merge these in the near term?**
> I dont see any real value here knowing that we are actively deprecating tools from this server already. Complete deprecation is expected by the end of the month.
> 
> **Give us critical adoption data (how many users, which experiments, success rates)**
> I understand you want to go the API route vs page scraping but the existing strategy method can still provide you the usage data irrespective of how the weblab access is implemented, isnt it?

---

## October 2, 2025 - Metrics Clarification (13:19 PDT)

**Sergio Ibagy (13:19 PDT):**
> Thanks for the clarification. Will work on understanding our own MCP path.
> But can you clarify to me how I can get metrics data out of the existing strategy?

**Chetan Soni (13:20 PDT):**
> I am adding a CR today to start tracking that data. You can probably look at it next week? I can share that once I have a big enough dataset.

**Sergio Ibagy (13:21 PDT):**
> perfect! thanks! Bug you next friday 😊

**Key Understanding:**
- Chetan is instrumenting the OLD weblab-strategy.ts (page scraping) with metrics tracking
- This will show current weblab usage patterns via the old strategy
- Data should be available next week (week of October 7)
- Follow up on **Friday, October 11, 2025**
- This gives baseline usage data even though new tools are completely different implementation

---

## Key Takeaways

### NO MERGE PATH
- Chetan explicitly rejects merge request
- Recommendation: Use own server
- amzn-mcp actively deprecating tools

### URGENT TIMELINE
- **Complete deprecation expected by end of October 2025**
- No time to wait for metrics collection
- Must proceed with fork immediately

### FORK CONFIRMED
- Must create standalone WeblabMCPServer
- Use golden path template (handles Midway auth)
- Implement own metrics collection
- Fork from amzn-mcp for auth patterns

### METRICS PATH IDENTIFIED
**Chetan's solution (Oct 2, 13:20 PDT):**
- Adding CR TODAY to track metrics for existing weblab-strategy.ts
- Will provide baseline usage data from old page-scraping strategy
- Data available next week (week of October 7)
- Follow up: **Friday, October 11, 2025**

**What This Means:**
- Can see current weblab usage patterns (who uses it, what for, how often)
- Baseline to justify investment in new API-based tools
- Different implementation but same use cases
- Helps answer stakeholder questions: "how many users?", "what workflows?"

**Limitations:**
- Only shows usage of OLD strategy (page scraping)
- Won't show usage of NEW tools (API-based)
- Still need own metrics for new WeblabMCPServer
- This is just baseline/reference data

---

## ~~Open Questions~~ RESOLVED

### ✅ RESOLVED: "Existing Strategy Method" for Metrics
**Question:** What did Chetan mean by "existing strategy method" for usage data?

**Answer (Oct 2, 13:20 PDT):**
- Refers to OLD weblab-strategy.ts under read_internal_website
- Chetan is adding metrics tracking CR today
- Will show current usage patterns via page scraping strategy
- Provides baseline data to justify new API-based tools
- Follow up on Friday, October 11, 2025 for data

**Impact:**
- ✅ Can answer stakeholder questions with baseline usage data
- ✅ Justifies investment in new WeblabMCPServer
- ⚠️ Still need to implement own metrics for new tools
- 📊 Use this as reference/baseline, not replacement for own metrics

---

## Next Steps

### Immediate (This Week)
1. ✅ **Accept fork decision** - No more waiting for merge approval
2. ✅ **Update timeline** - October 2025 deadline is URGENT
3. ✅ **Follow up with Chetan** - RESOLVED: Old strategy metrics coming next week
4. 📊 **Implement own metrics** - Use accessible-metrics.ts + toolbox telemetry hybrid

### Next Week (Oct 7-11)
1. 📊 **Check with Chetan on Friday Oct 11** - Get baseline weblab usage data
2. 📈 **Analyze usage patterns** - Understand current weblab workflows
3. 💡 **Use data for justification** - Present to stakeholders
4. 🚀 **Start fork execution** - Begin WeblabMCPServer creation

### Week 2-3: Fork Execution
1. Create WeblabMCPServer package via golden path template
2. Copy necessary code from amzn-mcp:
   - `/core/auth/` - Midway authentication
   - `/core/logging/` - Logging infrastructure
   - `mcp-wrapper.ts` - MCP protocol handling
   - All `/tools/weblab/*` - Weblab tools
   - Test infrastructure
3. Add weblab-specific API key management
4. Implement hybrid metrics (accessible + toolbox telemetry)
5. Set up toolbox vending infrastructure

### Week 4: Deployment
1. Test internally with weblab team
2. Monitor metrics collection
3. Iterate based on feedback
4. Broader rollout after proving value

---

## Impact on Project

### Decision Matrix Updated
```
Current State: Fork Decision Confirmed ✅

Path: Fork amzn-mcp
├─ Timeline: 1-2 weeks setup + vending
├─ Effort: 7-12 days
├─ Urgency: HIGH (October 2025 deadline)
└─ Result: Team-owned WeblabMCPServer

Alternative Paths: NONE
├─ Merge rejected by Chetan
├─ Golden path requires rebuilding everything
└─ Must fork to meet timeline
```

### Updated Confidence Levels
| Question | Answer | Confidence |
|----------|--------|-----------|
| Will Chetan approve merge? | **NO - explicitly rejected** | 100% |
| Must we fork? | **YES - only viable path** | 100% |
| Timeline pressure? | **URGENT - October 2025** | 100% |
| Can fork succeed? | Yes - documented process | 95% |
| Metrics solution? | Implement our own | 100% |

---

## Related Documents
- `docs/weblab-mcp/standalone-server-analysis.md` - Fork strategy analysis
- `docs/weblab-mcp/restart-package-2025-10-02.md` - Current project state
- `docs/weblab-mcp/toolbox-vending-guide.md` - Vending process
- `docs/weblab-mcp/weblab-mcp-meetings/ryan-10-02.md` - MCP mandate context

---

**Status:** Metrics path identified, fork confirmed  
**Decision:** Fork confirmed, merge rejected  
**Next Action:** Follow up with Chetan on **Friday, October 11, 2025** for baseline usage data
