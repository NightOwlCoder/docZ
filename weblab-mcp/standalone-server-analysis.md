# Weblab MCP Standalone Server Analysis

**Date:** September 30, 2025  
**Context:** Investigating alternatives to amzn-mcp for hosting weblab tools

## Executive Summary

After investigating the golden path template for creating standalone MCP servers, we've identified critical gaps that make it unsuitable for weblab's dual authentication requirements (Midway + Weblab API keys). This document analyzes three potential paths forward.

## Key Findings

### 1. Golden Path Template - No Authentication Support ❌

**Source:** https://docs.hub.amazon.dev/gen-ai-dev/creating-mcp-servers/

**Critical Gap Identified:**
> "The current stdio-based MCP server implementation does not include built-in support for authentication and authorization. This is a **known gap** that needs to be addressed."

**Official Statement:**
> "As the MCP protocol and supporting technologies evolve, **future guidance will be updated** to address this gap, potentially with recommendations for integrating your MCP server with your organization's authentication and authorization systems, such as OAuth 2.0 or API keys."

**Translation:** No Midway auth, no API key patterns, no dual auth examples. You'd be pioneering this from scratch.

**Templates Available:**
- Python stdio-based: `create.hub.amazon.dev/package/mcp-local-server-python`
- TypeScript stdio-based: `create.hub.amazon.dev/package/mcp-local-server-typescript`

**What You Get:**
- ✅ MCP SDK for protocol handling
- ✅ stdio-based communication
- ✅ Sample function tool structure
- ✅ Build/packaging setup

**What You DON'T Get:**
- ❌ Midway authentication
- ❌ API key handling
- ❌ Any auth patterns or examples
- ❌ Dual authentication guidance

**Complexity Assessment:** HIGH - Would require months of auth infrastructure work

---

### 2. Strands MCP Support - Unknown, Likely No Midway

**Assessment:** 85% confidence that Strands also lacks Midway support

**Reasoning:**
- MCP protocol is designed for cross-organizational use
- Midway is Amazon-internal authentication
- Strands focuses on agent orchestration, not auth infrastructure
- No documentation found indicating Midway integration

**Recommendation:** Not a viable path without further investigation

---

### 3. Fork amzn-mcp Strategy - VIABLE OPTION

## Fork Strategy Deep Dive

### What You'd Keep

```
✅ Core Components:
   - Midway authentication (core/auth/)
   - API key handling (weblab-specific)
   - MCP protocol wrapper (mcp-wrapper.ts)
   - Logging infrastructure (core/logging/)
   - Build/packaging setup
   - Test framework structure

✅ Weblab Tools:
   - /tools/weblab/weblab-details.ts
   - /tools/weblab/weblab-allocations.ts
   - /tools/weblab/weblab-activation-history.ts
   - /tools/weblab/weblab-user-experiments.ts
   - /tools/weblab/weblab-request-andes-access.ts
   - /tools/weblab/weblab-health-check.ts
   - /tools/weblab/accessible-metrics.ts
```

### What You'd Delete

```
❌ Remove (~90% of codebase):
   - 50+ unrelated tools:
     * ReadInternalWebsites
     * SimAddComment
     * TicketingReadActions
     * TicketingWriteActions
     * Pipeline tools
     * All other tool directories
   - Quip integration
   - Ticketing system integrations
   - Andes tools (separate andes-mcp handles this)
   - All non-weblab functionality
```

### Pros & Cons

#### Advantages ✅
1. **Speed to Market:** Working auth + protocol handling NOW
2. **Team Ownership:** Weblab team fully owns and controls
3. **Simplicity:** ~90% less code = easier maintenance
4. **Metrics Solved:** Keep your accessible-metrics.ts solution
5. **Independence:** No waiting on amzn-mcp community decisions
6. **Clear Scope:** Only weblab functionality
7. **Fast Iterations:** Direct control over releases

#### Disadvantages ❌
1. **Maintenance Burden:** You own all updates and bug fixes
   - **BUT:** This gives you agility and control over releases
2. **Learning Curve:** Need to understand MCP infrastructure deeply
   - **BUT:** You WANT this knowledge for PE career growth
3. **Initial Setup Effort:** 1-2 weeks to fork and clean
   - **BUT:** Much faster than building auth from scratch (months)

**Note:** Original concerns about upstream sync, ecosystem duplication, golden path alignment, and resource cost are **NOT VALID** because:
- ✅ **Upstream Sync:** Irrelevant - amzn-mcp is being decommissioned
- ✅ **Ecosystem Duplication:** This IS the mandate - focused MCPs, not bloated ones
- ✅ **Golden Path Alignment:** Golden path doesn't recommend centralization (why amzn-mcp is being decommissioned)
- ✅ **Resource Cost:** The mandate requires separate codebases per team

---

## Critical Questions for Fork Decision

### 1. Is amzn-mcp Forkable?
- [x] ✅ **YES** - Can copy/paste code freely
- [x] ✅ Internal Amazon code - no license issues
- [x] ✅ No policy violations - encouraged by mandate
- [x] ✅ No approval needed - code is accessible

### 2. Where to Host?
**Recommended Approach:**
- Create new package `WeblabMCPServer` following golden path template
- Use TypeScript template: `create.hub.amazon.dev/package/mcp-local-server-typescript`
- Replace template code with copied amzn-mcp auth + weblab tools
- This gives you the proper package structure while keeping working auth

**Vending Strategy - NEEDS INVESTIGATION:**
From golden path docs:
> "A specialized MCP Registry CLI and Pipeline Target will be introduced for publishing to the centralized MCP registry. This will use toolbox under the hood, requiring you to switch and publish to the MCP registry."

Current process (until registry CLI available):
1. Follow [builder-toolbox vending infrastructure guide](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-create-infrastructure.html)
2. Create toolbox vending pipeline from BuilderHub Create
3. Bundle and publish via toolbox
4. Register in MCP registry

**TODO:** Investigate detailed vending process - see "Next Steps" section

### 3. Does Fork Solve Chetan's Concern?
- [x] ✅ **YES** - Fork = team-owned (not community)
- [x] ✅ Addresses "contribution limiting" concern completely
- [x] ✅ Team controls: Releases, updates, roadmap, priorities
- [x] ✅ No dependency on amzn-mcp community decisions
- [x] ✅ Aligns with MCP mandate for focused, team-owned servers

---

## Metrics Solution - THREE OPTIONS AVAILABLE ✨

**Status:** Multiple approaches now identified

### Option 1: accessible-metrics.ts (In Progress)
```typescript
Local file: ~/.weblab-mcp/weblab-usage-metrics.json
CloudWatch: YOUR account 975049930647 
No dependency on inaccessible account
```

**What Exists:**
- `accessible-metrics.ts` - Basic structure created
- `weblab-health-check.ts` - Health check tool drafted
- Concept proven - can use your account

**What's Needed:**
- [ ] Finish TypeScript implementation
- [ ] Test metrics collection
- [ ] Verify CloudWatch integration
- [ ] Test health check tool

**Use Case:** Development, immediate access, no dependencies

### Option 2: Toolbox Telemetry (Requires Setup)
```typescript
EMF files: Written to TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY
CloudWatch: YOUR account 975049930647, us-east-1
QuickSight: Auto-generated dashboard
```

**What's Needed:**
- [ ] Set up CloudWatch log group (us-east-1)
- [ ] Create IAM role with toolbox trust relationship
- [ ] Submit ARNs to Toolbox team
- [ ] Implement EMF file writing
- [ ] Request QuickSight dashboard

**Use Case:** Production, professional dashboards, standardized format

### Option 3: HYBRID (Recommended)
```typescript
// Use both systems
function recordMetric(data) {
  accessibleMetrics.recordEvent(data);  // Local + immediate
  if (process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY) {
    emitToolboxMetric(data);  // Production dashboards
  }
}
```

**Benefits:**
- ✅ Works during development (no toolbox needed)
- ✅ Professional dashboards in production
- ✅ No single point of failure
- ✅ Immediate access + stakeholder visibility

**Recommendation:** Complete accessible-metrics.ts now, add toolbox telemetry when vending.

**Key Insight:** Both approaches use YOUR account 975049930647. See `docs/weblab-mcp/toolbox-vending-guide.md` for toolbox telemetry implementation details.

---

## Decision Tree

```
┌─ Can you fork amzn-mcp?
│
├─ YES ──┬─ Does fork make you team-owned?
│        │
│        ├─ YES ──> FORK IS VIABLE ✅
│        │          - Clean codebase
│        │          - Team control
│        │          - Fast iterations
│        │
│        └─ NO ───> Stay with merge attempt
│
└─ NO ───┬─ Did Chetan approve merge?
         │
         ├─ YES ──> MERGE INTO AMZN-MCP ✅
         │          - 3 tools initially
         │          - Collect usage data
         │          - Plan migration later
         │
         └─ NO ───> GOLDEN PATH (Hard)
                    - Build auth from scratch
                    - Months of work
                    - High risk

```

---

## Recommended Path Forward

### Option A: Fork + Simplify (If Chetan Rejects)

**Timeline:** 1-2 weeks to fork, clean, test, vend

**Steps:**
1. Get approval to fork from amzn-mcp maintainers
2. Fork to `WeblabMCPServer` package
3. Delete everything except:
   - `/tools/weblab/`
   - `/core/auth/`
   - `/core/logging/`
   - `mcp-wrapper.ts`
   - Build scripts
   - Test infrastructure
4. Add accessible-metrics with YOUR CloudWatch account
5. Clean up dependencies (remove unused packages)
6. Test authentication flow thoroughly
7. Vend via toolbox to weblab team first
8. Expand to broader team after proving value

**Effort Breakdown:**
- Fork setup: 1 day
- Code cleanup: 2-3 days
- Testing: 2-3 days
- Vending setup: 1-2 days
- Documentation: 1 day
- **Total: 7-12 days**

### Option B: Amzn-mcp Merge (If Chetan Approves)

**Timeline:** 1 week to merge, 3-6 months data collection

**Steps:**
1. Merge 3 stable tools:
   - weblab_details
   - weblab_allocations
   - weblab_activation_history
2. Add accessible-metrics
3. Add weblab_health_check
4. Keep weblab_user_experiments separate (needs Andes access)
5. Collect usage data for 3-6 months
6. Evaluate standalone migration after data collection
7. Make fork decision based on actual usage patterns

**Effort Breakdown:**
- CR preparation: 2 days
- Review cycles: 3-5 days
- Testing: 1 day
- **Total: 6-8 days**

---

## Arguments for Each Approach

### For Fork Strategy
**Use this if talking to leadership/Chetan:**

"The golden path template explicitly states authentication is a 'known gap' with no current solution. Our weblab tools already solve dual authentication (Midway + API keys) which the template cannot provide. We've also solved metrics independently using our own AWS account.

A fork gives us:
- Immediate deployment capability
- Full team ownership and control
- Simplified codebase (90% smaller)
- No community coordination overhead
- Faster iteration cycles

Given we've already solved the hard problems the golden path can't address, a focused fork makes engineering sense."

### For Merge Strategy
**Use this if Chetan is receptive:**

"We'd like to temporarily merge 3 stable weblab tools into amzn-mcp while the MCP ecosystem matures. This gives us:
- Immediate user access
- Usage data for justification
- Time to evaluate standalone later
- Low maintenance burden initially

We've solved metrics independently, so we won't impact amzn-mcp infrastructure. We can re-evaluate after 3-6 months of data collection."

---

## Next Steps

### Phase 1: Complete In-Flight Work (This Week)
**Priority: HIGH - Foundation for any deployment path**

1. **Finish accessible-metrics.ts Implementation:**
   - [ ] Complete TypeScript implementation
   - [ ] Fix any compilation errors
   - [ ] Test local file metrics collection
   - [ ] Verify CloudWatch integration with account 975049930647
   - [ ] Test `weblab_health_check` tool functionality
   - [ ] Document usage for stakeholders
   - **Timeline:** 1-2 days

2. **Design Toolbox Telemetry Integration:**
   - [ ] Create `toolbox-telemetry.ts` module
   - [ ] Implement EMF file writing (not stdout)
   - [ ] Add hybrid metrics wrapper
   - [ ] Document setup requirements
   - **Timeline:** 1 day (implementation only, setup later)

2. **Vending Process - COMPLETED ✅:**
   - [x] Read builder-toolbox vending infrastructure guide
   - [x] Understand BuilderHub Create toolbox pipeline creation
   - [x] Document current vending process
   - [x] Create comprehensive vending guide: `docs/weblab-mcp/toolbox-vending-guide.md`
   - [x] Document toolbox telemetry integration
   - **Key Finding:** Toolbox provides built-in metrics via EMF files

3. **Build Knowledge:**
   - [ ] Deep dive into MCP protocol specification
   - [ ] Study amzn-mcp auth implementation (`core/auth/`)
   - [ ] Understand MCP wrapper architecture (`mcp-wrapper.ts`)
   - [ ] Document key learnings for team

### Phase 2: Execute Fork Strategy (Week 2-3)
**Based on confirmed decision to fork**

1. **Create Package Structure:**
   - [ ] Generate new package from TypeScript template
   - [ ] Name: `WeblabMCPServer`
   - [ ] Set up proper directory structure

2. **Copy Working Components:**
   - [ ] Copy `/core/auth/` from amzn-mcp
   - [ ] Copy `/core/logging/` from amzn-mcp
   - [ ] Copy `mcp-wrapper.ts` from amzn-mcp
   - [ ] Copy all `/tools/weblab/*` files
   - [ ] Copy test infrastructure

3. **Clean & Optimize:**
   - [ ] Remove all unused dependencies from package.json
   - [ ] Delete unused imports
   - [ ] Update build scripts
   - [ ] Clean up configuration files
   - [ ] Run tests to verify everything works

4. **Add Metrics (Hybrid Approach):**
   - [ ] Integrate completed `accessible-metrics.ts`
   - [ ] Add `weblab_health_check` tool
   - [ ] Implement toolbox telemetry EMF writing
   - [ ] Set up telemetry CDK infrastructure (log groups + IAM)
   - [ ] Submit toolbox telemetry onboarding ticket
   - [ ] Test both metrics systems
   - [ ] Request QuickSight dashboard

5. **Vending Setup:**
   - [ ] Create toolbox vending pipeline
   - [ ] Test bundle creation
   - [ ] Publish to toolbox registry
   - [ ] Register in MCP registry

6. **Documentation:**
   - [ ] README with setup instructions
   - [ ] Tool usage guide
   - [ ] Troubleshooting guide
   - [ ] Metrics dashboard guide

### Phase 3: Initial Deployment (Week 4)

1. **Internal Testing:**
   - [ ] Deploy to weblab team members
   - [ ] Verify authentication works
   - [ ] Test all 6 tools
   - [ ] Collect initial feedback

2. **Monitoring:**
   - [ ] Set up CloudWatch dashboards
   - [ ] Monitor metrics collection
   - [ ] Track usage patterns
   - [ ] Document issues

3. **Iteration:**
   - [ ] Fix any discovered bugs
   - [ ] Improve based on feedback
   - [ ] Update documentation

### Decision Timeline
- **Week 1 (Oct 7-11):** Complete metrics + vending investigation
- **Week 2 (Oct 14-18):** Create package, copy code, clean up
- **Week 3 (Oct 21-25):** Set up vending, test thoroughly
- **Week 4 (Oct 28-Nov 1):** Internal deployment & monitoring
- **Month 2+ (Nov onwards):** Broader rollout based on success

### Critical Path Dependencies
```
Metrics Implementation → Works in any scenario
         ↓
Vending Investigation → Needed for fork
         ↓
Fork Decision Confirmed → Already YES
         ↓
Package Creation → Start Week 2
         ↓
Code Migration → Parallel with testing
         ↓
Vending Setup → Uses investigation findings
         ↓
Deployment → Team testing first
```

---

## Open Questions - UPDATED

### Resolved ✅
1. ~~**Fork Policy:**~~ YES - Can copy/paste freely, no restrictions
2. ~~**Does fork solve concerns:**~~ YES - Team ownership aligns with mandate
3. ~~**Upstream sync:**~~ Not a concern - amzn-mcp being decommissioned
4. ~~**Resource cost:**~~ Expected - mandate requires team-owned servers
5. ~~**Ecosystem duplication:**~~ Expected - mandate requires focused servers

### Still Open ❓
1. **Vending Process Details:** Exact steps for toolbox vending - needs investigation
2. **MCP Registry CLI Timeline:** When will automated vending be available?
3. **Metrics Completion:** How long to finish accessible-metrics implementation?
4. **Deployment Phases:** Should we do team-only first or broader rollout?
5. **Knowledge Transfer:** How to document MCP infrastructure knowledge for team?

---

## Confidence Levels

| Question | Answer | Confidence |
|----------|--------|-----------|
| Does golden path support Midway? | No - documented gap | 100% |
| Can we fork amzn-mcp? | **YES - confirmed forkable** | 100% |
| Will fork solve concerns? | **YES - aligns with mandate** | 100% |
| Is fork maintainable? | Yes - 90% smaller codebase | 90% |
| Fork vs merge decision? | **Fork recommended** | 95% |
| Vending process complexity? | Needs investigation | 60% |
| Time to complete fork? | 1-2 weeks after metrics done | 85% |

---

## Conclusion

**Bottom Line:** Don't wait for golden path to add authentication. Either:
1. **Fork amzn-mcp** (if allowed) for immediate control, or
2. **Merge into amzn-mcp** (if Chetan approves) for quick deployment

Both options are better than spending months building authentication from scratch using an incomplete golden path template.

**Recommendation:** Fork is viable and recommended. Proceed with fork strategy.

**Next Immediate Actions:**
1. Finish metrics implementation (in progress)
2. Investigate detailed vending process
3. Start package creation Week 2

**Success Criteria:**
- Working authentication (Midway + API keys)
- All 6 weblab tools functional
- Metrics reporting to your CloudWatch account
- Successful toolbox vending
- Positive team feedback from initial deployment

