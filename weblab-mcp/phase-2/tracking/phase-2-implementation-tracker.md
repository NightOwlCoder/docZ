# Phase 2 Implementation Tracker

**Timeline:** 16 weeks to Q1 2026 (P0 Deadline)  
**Owner:** Sergio Ibagy  
**Started:** October 13, 2025  
**Current Status:** WEEK 1 - Foundation & Investigation

---

## Quick Status Dashboard

| Area | Status | Progress | Blocker |
|------|--------|----------|---------|
| AWS Infrastructure | 🔴 Not Started | 0% | Account creation pending |
| Week 1 PoC | 🟡 In Progress | 10% | AndesClientPython integration |
| Tool Migration | 🔴 Not Started | 0% | Waiting for PoC completion |
| Strands Agent | 🔴 Not Started | 0% | Waiting for infrastructure |
| MCP Protocol | 🔴 Not Started | 0% | - |
| Deployment | 🔴 Not Started | 0% | - |
| Compliance | 🔴 Not Started | 0% | - |

**Legend:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete | 🔵 Blocked

---

## Phase 2.1: Foundation & Investigation (Weeks 1-3)

### AWS Account & Bindle Setup

**Why Critical:** Need dedicated AWS account with proper bindle for team access before development

**📖 Step-by-Step Guide:** [aws-account-bindle-step-by-step-guide.md](aws-account-bindle-step-by-step-guide.md)

**Tasks:**
- [ ] Create CTI (Category, Type, Item)
- [ ] Create Software Application Bindle: `WeblabMCPServer`
- [ ] Configure bindle permissions for team
- [ ] Request AWS account via Conduit
- [ ] Wait for approvals (~30 min)
- [ ] Verify account access via Isengard
- [ ] Determine security classification (orange vs confidential)
- [ ] Submit security review (staged - can start dev before approval)
- [ ] Configure account (IAM roles, S3, CloudWatch, Secrets Manager)

**Resources:**
- **Step-by-Step Guide:** [Complete walkthrough with all URLs and forms](aws-account-bindle-step-by-step-guide.md)
- **AWS Account Creation:** https://w.amazon.com/bin/view/ACMF/AMCP/Isengard/Account_Creation
- **Bindle Creation:** https://w.amazon.com/bin/view/Bindles/Bindles_Onboarding_Guidance/UsingBindles
- **Conduit:** https://conduit.security.a2z.com
- **Isengard:** https://isengard.amazon.com
- **CTI Management:** https://cti.amazon.com
- Michael Bower guidance: Need new account (not shared), proper access controls
- Security review: Staged process, can start dev before full approval

**Contacts:**
- Michael Bower (bowemi) - Infrastructure guidance
- Security team - TBD via research

**Blockers:**
- None yet

**Notes:**
- Michael said we can start dev in existing account temporarily (348835374786 - Jakub shared)
- Security review is staged - can begin before full approval

---

### Week 1 PoC - AndesClientPython Integration

**Goal:** Validate AndesClientPython SDK works from Lambda for WSTLake access

**Tasks:**
- [ ] Set up minimal Strands agent locally
- [ ] Integrate AndesClientPython SDK package
- [ ] Configure CloudAuth authentication
- [ ] Implement single test tool: "Does weblab have TAA?"
- [ ] Test WSTLake query execution
- [ ] Measure query performance (8-25s expected)
- [ ] Validate partition key requirements
- [ ] Document findings and patterns

**Current Work:**
- Starting with AndesClientPython integration
- Using brazil-runtime-exec for local testing

**Success Criteria:**
- AndesClientPython integrated successfully
- CloudAuth authentication working
- Single WSTLake query executing
- Performance acceptable (<30s)
- Ready to expand to full 4 tools

**Resources:**
- Doug's demo: https://code.amazon.com/packages/ExaktDemos/blobs/mainline/--/demos/2023-09-12%20Andes%203_0%20EMR%20test.ipynb
- AndesClientPython package: https://code.amazon.com/packages/AndesClientPython
- CloudAuth MCP SDK: https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/CloudAuth/Onboarding/MCP/Python

**Blockers:**
- None yet

---

### MCP Everywhere CCI Verification

**Tasks:**
- [ ] Check QuickSight dashboard for Must-Do status
- [ ] Contact MCP Everywhere team (#mcp-everywhere-cci-interest)
- [ ] Get baseline metrics from Chetan (Oct 11 deadline)
- [ ] Verify remote-first architecture alignment
- [ ] Document compliance requirements

**Resources:**
- QuickSight: https://us-east-1.quicksight.aws.amazon.com/sn/account/amazonbi/dashboards/9690506d-6bd6-4003-800c-88d25dc2a486
- MCP Wiki: https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere
- Slack: #mcp-everywhere-cci-interest

**Status:** WSS has 125 client dependencies → Likely Must-Do

---

## Phase 2.2: Core Development (Weeks 4-9)

### Tool Migration (6 weeks)

**Goal:** Migrate 4 core tools from TypeScript to Python Strands

**Tools to Migrate:**
1. [ ] `weblab_details` - GetExperiment API
   - Reuse Phase 1 API logic
   - Add @tool decorator
   - OpenTelemetry instrumentation
   
2. [ ] `weblab_allocations` - ListAllocations API
   - Port authentication patterns
   - Add error handling
   
3. [ ] `weblab_activation_history` - ListAllocationPeriods API
   - MCM comment preservation
   - History parsing
   
4. [ ] `query_wstlake` - AndesClientPython execution
   - Natural language → SQL (via andes-mcp)
   - Direct SDK execution
   - Partition key enforcement

**Effort Estimate:** ~1 week per tool (parallel work possible)

**Resources:**
- Phase 1 TypeScript tools: weblab-mcp-source-code/
- Doug's patterns: WeblabLearningAppBackendPython/

---

### Strands Agent Integration

**Tasks:**
- [ ] Create WeblabStrandsAgent Python package
- [ ] Set up brazil workspace
- [ ] Implement agent with 4 tools
- [ ] Add system prompts
- [ ] Configure session management (S3)
- [ ] Integrate OpenTelemetry tracing
- [ ] Test agent orchestration locally
- [ ] Validate multi-tool workflows

**Resources:**
- Doug's reference: WeblabLearningAppBackendPython
- Strands docs: [Add link]
- Dev setup guide: phase-2-dev-setup.md

---

## Phase 2.3: MCP Protocol Implementation (Weeks 10-12)

### MCP Server Interface

**Tasks:**
- [ ] Implement MCP protocol handler
- [ ] Add CloudAuth authentication (CloudAuthFastMCP)
- [ ] Support Transitive Auth for user delegation
- [ ] Create MCP tool wrappers
- [ ] Test remote MCP connections
- [ ] Validate with Q CLI
- [ ] Test with Cline/Cursor
- [ ] Performance testing

**Resources:**
- CloudAuth Python MCP SDK: Released Oct 2025
- Package: Python-CloudAuth-MCP-Support
- Examples: CloudAuthPythonMcpTestService, CloudAuthPythonMcpTestAgent

---

## Phase 2.4: Deployment & Infrastructure (Weeks 13-14)

### CDK Infrastructure

**Tasks:**
- [ ] Create WeblabMCPServerStack CDK package
- [ ] Configure Lambda deployment (using Doug's patterns)
- [ ] Set up API Gateway (REST + WebSocket)
- [ ] Create S3 bucket for sessions
- [ ] Configure CloudWatch log groups (us-east-1)
- [ ] Set up IAM roles and permissions
- [ ] Add Secrets Manager for API keys
- [ ] Deploy to dev environment
- [ ] Test remote access

**Resources:**
- Doug's CDK: WeblabLearningAppBackendCDK/
- Kevin's Redshift patterns: Ask @crusekev

---

### MCP Registry Registration

**Tasks:**
- [ ] Research registration process
- [ ] Prepare tool documentation
- [ ] Create usage examples
- [ ] Register WeblabStrandsAgent
- [ ] Configure discovery metadata
- [ ] Test discoverability

**Resources:**
- MCP Registry guide: https://quip-amazon.com/u2jaAknttor9

---

## Phase 2.5: Compliance & Production Launch (Weeks 15-16)

### Security & Compliance

**Tasks:**
- [ ] Complete security certification
- [ ] Documentation audit
- [ ] MCP Everywhere CCI program reporting
- [ ] Stakeholder demos
- [ ] Internal team validation

---

### Production Launch

**Tasks:**
- [ ] Enable for broader team
- [ ] Monitor initial usage
- [ ] Collect user feedback
- [ ] Create support documentation
- [ ] Set up monitoring dashboards
- [ ] Iterate based on learnings

---

## Key Decisions Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| Oct 2, 2025 | Remote Strands agent (not local fork) | MCP Everywhere mandate requires remote-first | Architecture pivot |
| Oct 9, 2025 | READ-ONLY for 2025 | Safety-first (William Josephson) | Write capabilities deferred to 2026+ |
| Oct 8, 2025 | Use CloudAuth Python MCP SDK | Released Oct 2025, production-ready patterns | Simplifies auth implementation |
| Oct 10, 2025 | AndesClientPython + andes-mcp hybrid | Direct SDK for queries, MCP for NL→SQL | Best of both approaches |
| [Date] | [Decision] | [Rationale] | [Impact] |

---

## Resources & Contacts

### Key People
- **Doug Hains (dhains)** - Strands patterns, WeblabLearningAppBackend reference
- **YJ Jiang (yimingj)** - WSTLake architecture, data access strategy
- **Kevin Cruse (crusekev)** - Redshift CDK, systematic WSTLake querying
- **Michael Bower (bowemi)** - Infrastructure setup, security review
- **Arpit** - Athena MCP server integration
- **Ryan Kessler** - Skip manager, strategy alignment
- **kannappa** - WSS owner, MCP mandate sponsor

### Key Links
- **MCP Everywhere Wiki:** https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere
- **CloudAuth MCP SDK:** https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/CloudAuth/Onboarding/MCP/Python
- **Slack:** #mcp-everywhere-cci-interest
- **QuickSight Dashboard:** [CCI tracking]
- **Phase 2 Roadmap:** mcp-weblab-anywhere-roadmap.md

### Internal Tools to Research
- isengard.amazon.com - AWS account management
- bindles.amazon.com - Bindle creation and ownership
- [Add more as we discover them]

---

## Risk Tracker

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| Timeline pressure (16 weeks) | HIGH | Leverage Doug's patterns, parallel work streams | Active |
| CloudAuth integration complexity | MEDIUM | MCP Everywhere team support, SDK available | Monitoring |
| Data access performance | MEDIUM | Partition key enforcement, caching strategy | Monitoring |
| Account provisioning delays | MEDIUM | Start in temp account (348835374786) | Mitigated |

---

## Weekly Updates

### Week 1 (Oct 7-11, 2025)
**Goal:** AndesClientPython PoC + infrastructure research

**Completed:**
- ✅ MCP Everywhere mandate analysis
- ✅ Chetan thread resolution (fork rejected)
- ✅ CloudAuth Python MCP SDK discovery

**In Progress:**
- 🟡 AndesClientPython integration
- 🟡 AWS account research

**Blockers:**
- None

**Next Week:**
- Complete PoC
- Submit AWS account request
- Start bindle creation

---

### Week 2 (Oct 14-18, 2025)
[To be filled in]

---

## Notes & Learnings

### From Phase 1
- Public APIs only (no page scraping)
- Authentication is complex but critical
- Testing with real users essential
- Tool descriptions matter for discovery
- 90% of API logic portable to Python

### From Meetings
- Michael: Can start dev in existing account temporarily
- Doug: CloudAuth Python MCP SDK released Oct 2025
- YJ: Users tolerant of higher latency with agents
- Adam: Data freshness = WSTLake (1-day SLA) + APIs (real-time)

### Technical Patterns
- Use brazil-runtime-exec for fast local iteration
- Pydantic workaround: Manual .so copy after build
- Python 3.10+ required (not 3.9)
- Partition keys mandatory for WSTLake performance

---

**Last Updated:** October 13, 2025  
**Next Review:** October 20, 2025 (End of Week 1)
