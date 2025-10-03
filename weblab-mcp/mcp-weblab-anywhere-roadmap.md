# Weblab MCP - Technical Roadmap & Architecture

**Project**: Weblab MCP Integration  
**Date**: October 2, 2025 (Updated)  
**Owner**: Sergio Ibagy  
**Initiative**: MCP Everywhere CCI (Category II - Must Do)  
**Deadline**: Q1 2026 (P0)

---

## Executive Summary

Building MCP tools enabling LLM-powered weblab experiment management through natural language. After comprehensive investigation and stakeholder alignment, we're pivoting to a **remote-first Strands agent architecture** that meets the MCP Everywhere mandate requirements while delivering scalable, enterprise-grade weblab data access.

**Key Decision:** Skip local MCP server fork (non-compliant) and proceed directly to Phase 2 remote Strands agent deployment, which satisfies the mandatory remote-first architecture requirement.

---

## CCI Mandate Context

### MCP Everywhere Initiative - Remote-First Requirement

**Source**: https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere

**Mandatory Goal #3 (Critical):**
> "Remote-First Architecture: Implementing a Remote Agent-first and Remote MCPServer-first approach for better scalability and share-ability."

**Why Remote-First:**
- Easily scalable and shareable
- Standard service patterns (rate limiting, tracing, logging, metrics)
- Deployed as AWS service, not user's machine
- All existing service solutions directly applicable

### Weblab Must-Do Status

**WeblabSearchService (WSS) is MANDATED** for MCP by Q1 2026:
- **125 client dependencies** (exceeds 100+ threshold)
- **Cross-organizational usage** (beyond L10 org)
- **P0 Priority**: Non-negotiable deadline
- **Owner**: kannappa (skip manager)

**Timeline:**
- October 2025: Program launch
- November 28, 2025: Team commitments due
- Q1 2026: Implementation deadline

**References:**
- [MCP CCI Wiki](https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere)
- [MCP CCI SIM](https://issues.amazon.com/P282079924)
- [QuickSight Dashboard](https://us-east-1.quicksight.aws.amazon.com/sn/account/amazonbi/dashboards/9690506d-6bd6-4003-800c-88d25dc2a486)
- [CCI Assessment](https://quip-amazon.com/JLUDAZv52yL7/2026-Cross-Cutting-Initiatives-MCP-Everywhere-sibagy)

---

## Architecture Strategy

### ❌ What We're NOT Doing

**Local Fork Strategy (September plan):**
```
User's Dev Machine
    ↓ stdio
Local MCP Server (forked from amzn-mcp)
    ↓ HTTP + Midway
Weblab APIs
```

**Why NOT:**
- ❌ Local server violates remote-first mandate
- ❌ Not scalable beyond single user
- ❌ stdio communication not shareable
- ❌ amzn-mcp deprecating by end of October 2025
- ❌ Chetan rejected merge request

### ✅ What We're Building Instead

**Phase 2 Remote Strands Agent (Current plan):**
```
User's Machine (Q CLI, Cline, etc.)
    ↓ Remote MCP protocol
WeblabStrandsAgent (Lambda/Fargate - REMOTE!)
    ├─ MCP Protocol Interface
    ├─ Strands Agent Core (orchestration)
    ├─ Weblab Tools (6 tools from Phase 1)
    └─ CloudAuth + Transitive Auth
         ↓ HTTP
    Weblab APIs (WeblabAPIModel)
```

**Why This Works:**
- ✅ **Remote-first compliant** - Hosted in AWS, not user's machine
- ✅ **Scalable** - Lambda auto-scaling, shared infrastructure
- ✅ **MCP native** - Strands has built-in MCP support (MCPClient)
- ✅ **Can BE an MCP server** - Expose agent as MCP endpoint
- ✅ **Production-ready** - OpenTelemetry, CloudWatch metrics
- ✅ **Reuses Phase 1 work** - 6 tools, API patterns, authentication

---

## Current Progress

### ✅ Phase 1 Complete (September 2025)

**6 Working Tools Built:**
1. `weblab_details` → GetExperiment API
2. `weblab_allocations` → ListAllocations API  
3. `weblab_activation_history` → ListAllocationPeriods API
4. `weblab_user_experiments` → Andes SQL via andes-mcp
5. `weblab_request_andes_access` → Auto-approved WEBLAB_DDL access
6. `weblab_health_check` → System health monitoring

**Technical Achievements:**
- ✅ Dual authentication (Midway + Weblab API keys)
- ✅ Public WeblabAPIModel APIs (no page scraping)
- ✅ Comprehensive test suite (2179 tests passing)
- ✅ BETA and PROD environment support
- ✅ Andes integration via HTTP bridge

**Key Learnings:**
- API patterns and error handling
- Authentication flows (BYOK support)
- Tool schemas and parameter validation
- Integration with andes-mcp for SQL queries

### 🚧 In-Flight Work

**Metrics Implementation:**
- `accessible-metrics.ts` - Local file + CloudWatch (your account 975049930647)
- Hybrid approach: accessible + toolbox telemetry
- Health check tool for real-time monitoring

**Deployment Preparation:**
- Toolbox vending infrastructure understood
- CDK patterns from Doug's WeblabLearningAppBackendCDK
- OpenTelemetry integration planned

---

## Roadmap (Updated October 2, 2025)

### Phase 1: Tools & Validation ✅ COMPLETE
**Timeline:** June-September 2025  
**Status:** Complete

- [x] Build 6 weblab MCP tools
- [x] Validate APIs with Keith Norman
- [x] Test with Q CLI and Cline
- [x] Comprehensive test coverage
- [x] Document patterns and learnings

### Phase 2: Remote Strands Agent (Current Focus)
**Timeline:** October-December 2025  
**Owner:** Sergio Ibagy  
**Status:** Ready to execute

#### October 2025: Foundation & Investigation
- [ ] **Verify Must-Do status** - Check QuickSight dashboard
- [ ] **Engage MCP Everywhere team** - Get remote implementation guidance
  - Slack: #mcp-everywhere-cci-interest
  - SIM: Create ticket for support
- [ ] **Research CloudAuth MCP SDK** - Understand remote auth patterns
- [ ] **Investigate AmazonMCPGateway** - Evaluate as option
- [ ] **Get baseline metrics from Chetan** - Friday Oct 11, old strategy usage data

#### November 2025: Strands Agent Development
- [ ] **Create WeblabStrandsAgent package** (Python)
  - Use Doug's WeblabLearningAppBackendPython patterns
  - Implement 6 weblab tools as Strands tools
  - Add MCP protocol interface
  - Implement CloudAuth authentication
  
- [ ] **Observability Integration**
  - OpenTelemetry tracing (Doug's patterns)
  - CloudWatch metrics and logs
  - Cost tracking and performance monitoring
  - Session management with S3SessionManager

- [ ] **Testing & Validation**
  - Unit tests for each tool
  - Integration tests with Weblab APIs
  - MCP protocol compliance testing
  - Performance and load testing

#### December 2025: Deployment & Registry
- [ ] **CDK Infrastructure**
  - Lambda deployment (WeblabLearningAppBackendCDK patterns)
  - API Gateway integration
  - IAM roles and permissions
  - CloudWatch log groups (us-east-1 for toolbox telemetry)

- [ ] **MCP Registry Registration**
  - Register WeblabStrandsAgent as MCP server
  - Document tool capabilities
  - Provide usage examples
  - Configure discovery metadata

- [ ] **Production Testing**
  - Test with Q CLI remote connection
  - Validate authentication flows
  - Monitor metrics and performance
  - Internal team validation

### Phase 3: WSS Modernization (Parallel Track)
**Timeline:** November 2025 - January 2026  
**Owner:** WSS Team (under kannappa)  
**Status:** CCI mandate requires execution

#### WSS MCP Compliance
- [ ] **MCP Protocol Handler** - Add via IronHide automation
- [ ] **Search API Development** - Expose WSS functionality
- [ ] **Authentication Integration** - CloudAuth + Transitive Auth
- [ ] **Registry Registration** - List in MCP Registry
- [ ] **Documentation Audit** - Ensure AI-friendly API docs

**Note:** WeblabStrandsAgent can integrate WSS tools via MCP once available

### Phase 4: Production Launch
**Timeline:** January 2026  
**Owner:** Weblab + Applied AI teams  
**Deadline:** Q1 2026 (MCP Everywhere P0)

#### Deliverables:
- [ ] **Production deployment** of WeblabStrandsAgent
- [ ] **User onboarding** - Documentation, demos, support
- [ ] **Metrics collection** - Usage patterns, adoption tracking
- [ ] **MCP Everywhere compliance** - Program reporting
- [ ] **Broader rollout** - Beyond weblab team

---

## Technical Architecture

### Remote Strands Agent Details

**Deployment:**
- AWS Lambda (serverless, auto-scaling)
- API Gateway (REST + WebSocket for streaming)
- Multiple invocation modes:
  - Conversational (chat interface)
  - Event-driven (triggered by events)
  - Scheduled (periodic analysis)

**Authentication:**
- CloudAuth for service identity
- Transitive Auth for user delegation
- IAM roles with proper trust relationships
- Support for both agent-as-service and agent-on-behalf-of-user patterns

**MCP Integration:**
```python
from strands.tools.mcp import MCPClient
from strands import Agent

# Can USE MCP tools (like andes-mcp)
andes_tools = MCPClient(lambda: connect_to_remote_mcp("andes-mcp-url"))

# Can BE an MCP server (for others to use)
weblab_agent = Agent(
    system_prompt=WEBLAB_ANALYSIS_PROMPT,
    tools=[weblab_details, weblab_allocations, andes_tools.list_tools_sync()],
    model=BedrockClaude()
)

# Expose as MCP server endpoint
@mcp_tool
def analyze_weblab(experiment_id: str) -> dict:
    return weblab_agent(f"Analyze experiment {experiment_id}")
```

**Observability (Doug's Patterns):**
- OpenTelemetry for distributed tracing
- CloudWatch for metrics and logs
- X-Ray integration for request tracking
- Cost tracking and token usage monitoring
- Session persistence via S3

### Comparison: Before vs After

| Aspect | Previous Plan (Local Fork) | Current Plan (Remote Strands) |
|--------|---------------------------|-------------------------------|
| **CCI Compliance** | ❌ Violates remote-first | ✅ Meets mandate |
| **Scalability** | Per-user, limited | Auto-scaling, shared |
| **Deployment** | User's machine | AWS Lambda/Fargate |
| **Authentication** | Midway only | CloudAuth + TA |
| **Observability** | Custom metrics | OpenTelemetry + CloudWatch |
| **Maintenance** | Team owned fork | Standard service patterns |
| **MCP Support** | stdio only | Remote MCP protocol |
| **Share-ability** | One user at a time | Organization-wide |

---

## Resource Requirements

### Team Structure
- **Project Owner**: Sergio Ibagy (Weblab MCP integration)
- **Technical Lead**: Sergio Ibagy (Strands agent implementation)
- **Reference Architecture**: Doug Hains (WeblabLearningAppBackendPython patterns)
- **Skip Manager**: Ryan Kessler (alignment and resourcing)
- **MCP Expertise**: MCP Everywhere CCI team (remote patterns)

### Effort Estimates (Updated)

**Phase 2 - Strands Agent Development:**
- Strands agent setup: 1 week
- Tool migration (TS → Python): 1 week
- MCP protocol interface: 1 week
- Testing & validation: 1 week
- **Total: 4 weeks** (1 person)

**Phase 2 - Deployment & Infrastructure:**
- CDK setup (using Doug's patterns): 3 days
- Lambda deployment: 2 days
- MCP Registry integration: 2 days
- Production testing: 3 days
- **Total: 10 days** (1 person)

**Phase 3 - WSS Modernization (Separate track):**
- WSS team effort: 8-12 weeks
- CCI support from program team
- IronHide automation assistance

**Total Phase 2 Effort:** ~6 weeks for Strands agent

---

## Success Metrics

### P0 Success Criteria (Q1 2026 - CCI Deadline)

**Functional:**
- [ ] WeblabStrandsAgent deployed as remote MCP server
- [ ] All 6 Phase 1 tools migrated and working
- [ ] Natural language query support
- [ ] Authentication working (CloudAuth + TA)
- [ ] Registered in MCP Registry

**Performance:**
- [ ] <2s response time for simple queries
- [ ] Support 10+ concurrent users
- [ ] 99% uptime SLA

**Compliance:**
- [ ] Remote-first architecture ✅
- [ ] MCP Everywhere program reporting
- [ ] Security certification complete
- [ ] Documentation audit passed

### P1 Success Criteria (Q2-Q3 2026)

**Enhanced Functionality:**
- [ ] Integration with modernized WSS (if available)
- [ ] Advanced orchestration workflows
- [ ] Multi-agent collaboration patterns
- [ ] WLBR.AI integration

**Adoption:**
- [ ] 50+ active users across Amazon
- [ ] 1000+ successful queries
- [ ] Positive user feedback
- [ ] Self-service onboarding

---

## Key Decisions & Rationale

### Decision 1: Remote Strands Agent (Not Local Fork)

**Drivers:**
- ✅ MCP Everywhere mandate requires remote-first
- ✅ Chetan rejected amzn-mcp merge (Oct 2, 2025)
- ✅ amzn-mcp deprecating by end of October 2025
- ✅ Strands provides production-ready patterns
- ✅ Doug's reference architecture available

**Trade-offs:**
- ⬆️ Increased complexity (service hosting vs local binary)
- ⬆️ Operational overhead (monitoring, deployment)
- ⬇️ Time to first deployment (no fork/cleanup needed)
- ⬇️ Long-term maintenance (standard service vs custom fork)

**Confidence:** 95% - Right architectural choice

### Decision 2: Python/Strands (Not TypeScript/MCP-only)

**Drivers:**
- ✅ Strands native MCP support (MCPClient + can be MCP server)
- ✅ Doug's production patterns in WeblabLearningAppBackendPython
- ✅ OpenTelemetry observability built-in
- ✅ Agent orchestration capabilities beyond simple MCP
- ✅ AWS internal adoption (Q CLI, Glue, etc.)

**Trade-offs:**
- ⬆️ Language switch (TS → Python)
- ⬇️ Complexity (agent frameworks vs custom code)
- ⬇️ Observability effort (built-in vs custom)

**Confidence:** 90% - Proven production patterns

### Decision 3: Hybrid Metrics Approach

**Drivers:**
- ✅ accessible-metrics.ts for development (immediate access)
- ✅ Toolbox telemetry for production (QuickSight dashboards)
- ✅ Both use your AWS account 975049930647
- ✅ No single point of failure

**Implementation:**
- Local JSON file for dev testing
- EMF files for toolbox telemetry
- CloudWatch for production monitoring
- Strands OpenTelemetry for agent-specific metrics

**Confidence:** 100% - Multiple data sources

---

## Data Access Strategy (From Oct 2 Meetings)

### Two Primary Options Identified

**Option A: Redshift Cluster Integration**
- **Pros**: Proven functionality, scalable (adjust compute), has CDK deployment
- **Cons**: Infrastructure costs, need to maintain cluster
- **Contact**: Kevin Cruse (@crusekev) - Has CDK patterns for systematic WSTLake querying
- **Status**: Preferred for initial implementation

**Option B: Athena MCP Server**
- **Pros**: No infrastructure costs, uses existing andes-mcp metadata, auto-approval processes
- **Cons**: Dependent on andes-mcp availability, less control
- **Contact**: Arpit - Athena MCP server integration
- **Status**: Investigate as cost-optimization path

**WSTLake Data Quality:**
- WSTLake 1.0: Overlapping info, data modeling challenges
- **WSTLake 2.0**: Dimensional modeling, machine-readable, proper documentation (RECOMMENDED)

**Real-World Complexity Example:**
Kevin's query for "launched weblabs with stat sig CP impact":
- Took **3 days to formulate** manually
- Joins activation_events + weblab_analysis_results
- 100+ lines of SQL with complex filters
- **Clear AI/agent value proposition**

### Existing Natural Language Query UI

**Beta Interface Available:**
- URL: https://beta.console.harmony.a2z.com/weblab-data-management/wstlake-query
- Built by intern, already functional
- Proves feasibility of NL query approach
- Reference for agent interface design

---

## Infrastructure Setup (From Oct 2 Meetings)

### New AWS Resources Required

**Per Michael Bower meeting:**
- **New AWS account** dedicated to MCP project
- **New bindle** for virtual team access
- **Reason**: Proper access controls, not shared dumping-ground account
- **Security review**: Staged completion (can start dev before full approval)

**Infrastructure Components:**
- Lambda functions for Strands agent
- API Gateway for remote access
- S3 for session management
- CloudWatch log groups (us-east-1)
- IAM roles with CloudAuth trust relationships

**Athena Integration (Preferred):**
- Use Athena for data lake queries
- Avoid direct WSTLake cluster management
- Leverage existing andes-mcp patterns

---

## Technical Implementation

### Strands Agent Architecture

**Core Components:**
```python
# WeblabLearningAppBackendPython structure (Doug's patterns)
from strands import Agent, tool
from strands.tools.mcp import MCPClient
from strands.telemetry import StrandsTelemetry

# Setup observability
StrandsTelemetry().setup_console_exporter().setup_otlp_exporter()

# Define weblab tools as Strands tools
@tool
def weblab_details(experiment_id: str, environment: str = "BETA") -> dict:
    """Get comprehensive weblab experiment details"""
    # Reuse Phase 1 API logic
    return call_weblab_api("GetExperiment", {...})

@tool
def weblab_allocations(experiment_id: str, realm: str = None) -> dict:
    """Check current experiment allocations"""
    return call_weblab_api("ListAllocations", {...})

# Create agent with tools
agent = Agent(
    system_prompt=WEBLAB_ANALYSIS_PROMPT,
    tools=[weblab_details, weblab_allocations, ...],
    model=BedrockClaude(),
    session_manager=S3SessionManager(...)
)

# Expose as MCP server
mcp_server = create_mcp_server(agent, tools=[
    {"name": "analyze_weblab", "fn": lambda args: agent(args['query'])}
])
```

**Deployment Stack (Doug's CDK patterns):**
- Lambda handler with Strands agent
- API Gateway (REST + WebSocket)
- CloudAuth integration
- S3 for session management
- CloudWatch log groups (us-east-1)
- OpenTelemetry collector
- IAM roles and permissions

### Authentication Patterns

**Service Identity (Agent as Service):**
- Lambda execution role with CloudAuth identity
- Direct API calls to Weblab APIs
- Standard IAM permissions

**User Delegation (Agent on Behalf of User):**
- Transitive Auth token from user
- Agent passes TA token downstream
- Preserves user identity for audit

**Weblab API Keys:**
- BYOK support maintained
- Environment-based selection (BETA/PROD)
- Origin header derivation from key

### MCP Protocol Interface

**As MCP Client (Using tools):**
```python
# Connect to other MCP servers (e.g., andes-mcp)
andes_mcp = MCPClient(lambda: remote_mcp_client("andes-mcp-url"))
tools = andes_mcp.list_tools_sync()

# Use in agent
agent = Agent(tools=[...local_tools, ...tools])
```

**As MCP Server (Being used by others):**
```python
# Expose agent capabilities as MCP tools
from mcp import Server, StdioServerParameters

server = Server("weblab-strands-agent")

@server.call_tool()
async def analyze_experiment(experiment_id: str) -> dict:
    result = await agent(f"Analyze experiment {experiment_id}")
    return result

# Register in MCP Registry for discovery
```

---

## Phase Breakdown with Milestones

### Phase 2.1: Foundation (Week 1-2, Oct 7-18)

**Week 1: Setup & Investigation**
- [x] MCP Everywhere mandate analysis
- [x] Chetan thread resolution (fork confirmed, baseline metrics Oct 11)
- [ ] Verify weblab Must-Do status (QuickSight)
- [ ] Contact MCP Everywhere team
- [ ] Research CloudAuth MCP SDK
- [ ] Review Doug's code patterns

**Week 2: Package Creation**
- [ ] Create WeblabStrandsAgent Python package
- [ ] Set up CDK infrastructure package
- [ ] Configure development environment
- [ ] Establish testing framework

### Phase 2.2: Core Development (Week 3-4, Oct 21-Nov 1)

**Week 3: Tool Migration**
- [ ] Port 6 tools from TypeScript to Python
- [ ] Implement Strands @tool decorators
- [ ] Add OpenTelemetry instrumentation
- [ ] Test each tool individually

**Week 4: Agent Integration**
- [ ] Create Strands agent with tools
- [ ] Implement system prompts
- [ ] Add session management
- [ ] Test agent orchestration

### Phase 2.3: MCP Protocol (Week 5-6, Nov 4-15)

**Week 5: MCP Interface**
- [ ] Implement MCP server protocol
- [ ] Add CloudAuth authentication
- [ ] Support Transitive Auth
- [ ] Create MCP tool wrappers

**Week 6: Testing & Validation**
- [ ] Test remote MCP connections
- [ ] Validate with Q CLI
- [ ] Test with other MCP clients
- [ ] Performance testing

### Phase 2.4: Deployment (Week 7-8, Nov 18-29)

**Week 7: Infrastructure**
- [ ] Deploy CDK stacks
- [ ] Configure Lambda functions
- [ ] Set up API Gateway
- [ ] Create IAM roles

**Week 8: Registry & Launch**
- [ ] Register in MCP Registry
- [ ] Internal team testing
- [ ] Documentation and examples
- [ ] Monitoring dashboard setup

### Phase 2.5: Compliance & Launch (Week 9-10, Dec 2-13)

**Week 9: Compliance**
- [ ] Security certification
- [ ] Documentation audit
- [ ] CCI program reporting
- [ ] Stakeholder demos

**Week 10: Production Launch**
- [ ] Enable for broader team
- [ ] Monitor initial usage
- [ ] Collect feedback
- [ ] Iterate based on learnings

---

## Risk Assessment (Updated)

### Critical Risk: Wrong Architecture (RESOLVED ✅)

**Previous State:** Planning local fork that violates mandate  
**Current State:** Remote Strands agent aligns with mandate  
**Confidence:** 95% - Architecture validated

### High Risk: Timeline Pressure

**Risk:** Q1 2026 deadline aggressive for remote implementation  
**Impact:** Miss P0 CCI deadline, non-compliance  
**Mitigation:**
- Leverage Doug's proven patterns (saves 2-3 weeks)
- Use Strands SDK (not building from scratch)
- Parallel work streams (agent dev + infrastructure)
- Early MCP Everywhere team engagement

**Likelihood:** Medium | **Impact:** High | **Mitigation:** Strong

### Medium Risk: CloudAuth Integration Complexity

**Risk:** Remote auth patterns more complex than expected  
**Impact:** Development delays, may need architectural changes  
**Mitigation:**
- CloudAuth MCP SDK available (guidance exists)
- MCP Everywhere team support
- Can start with service-identity only, add TA later
- AmazonMCPGateway as fallback option

**Likelihood:** Medium | **Impact:** Medium | **Mitigation:** Moderate

### Low Risk: Strands Learning Curve

**Risk:** Team unfamiliar with Strands framework  
**Impact:** Slower initial development  
**Mitigation:**
- Doug's reference implementation available
- Strands SDK well-documented
- AWS internal examples (Q CLI, Glue)
- Active community support

**Likelihood:** Low | **Impact:** Low | **Mitigation:** Strong

---

## Dependencies & Blockers

### External Dependencies

1. **MCP Everywhere CCI Team**
   - Status: Available via #mcp-everywhere-cci-interest
   - Need: Remote implementation guidance
   - Timeline: October 2025

2. **CloudAuth MCP SDK**
   - Status: Available
   - Need: Documentation and examples
   - Link: https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/CloudAuth/Onboarding/MCP/NodeJS/

3. **MCP Registry**
   - Status: Operational
   - Need: Registration process
   - Guide: https://quip-amazon.com/u2jaAknttor9

4. **Chetan Baseline Metrics**
   - Status: In progress (CR submitted Oct 2)
   - Need: Usage data for justification
   - Timeline: Friday, October 11, 2025

### Internal Dependencies

1. **Doug's Reference Code**
   - Status: ✅ Available in workspace
   - Location: WeblabLearningAppBackendPython, WeblabLearningAppBackendCDK
   - Use: Patterns for deployment and observability

2. **Phase 1 API Work**
   - Status: ✅ Complete
   - Assets: 6 working tools, test suite, API patterns
   - Reuse: 90% of API logic portable to Strands

3. **AWS Account Access**
   - Status: ✅ Have access to 975049930647
   - Need: CloudWatch, Lambda deployment permissions
   - Use: Metrics, logging, hosting

---

## Communication Plan

### This Week (Oct 2-6)
- [x] Document MCP Everywhere findings
- [x] Update Chetan thread with resolution
- [ ] Share findings with Ryan
- [ ] Present revised strategy to team

### Weekly Cadence
- **Wednesdays**: Weblab team sync (Ryan's OH)
- **Fridays**: Progress updates to stakeholders
- **Bi-weekly**: MCP Everywhere program reporting

### Key Stakeholders & Contacts

**Leadership:**
- **Ryan Kessler** (skip manager) - Strategy alignment, use case collection
- **kannappa** (WSS owner) - Parallel WSS modernization track

**Technical Experts:**
- **Doug Hains** - Strands patterns, WeblabLearningAppBackend reference architecture
- **Kevin Cruse** (@crusekev) - Redshift CDK, systematic WSTLake querying
- **YJ Jiang** (yimingj) - WSTLake architecture, data access strategy
- **Michael Bower** (bowemi) - Infrastructure setup, security review
- **Arpit** - Athena MCP server integration

**External Support:**
- **MCP Everywhere Team** - CCI compliance guidance (#mcp-everywhere-cci-interest)
- **Chetan Soni** - Baseline metrics from old strategy (Oct 11)

**Use Case Sources:**
- **Dave Moore** - VP-level reporting needs (launched weblabs analysis)
- **Abhi Gupta** - Cart policy enforcement metrics
- **Leadership requests** - Additional use cases being collected

---

## Open Questions

### Critical (Need Answers This Week)
1. Is weblab confirmed Must-Do in QuickSight dashboard?
2. ~~Data access approach~~ **ANSWERED: Redshift primary, Athena investigation (YJ meeting)**
3. ~~New infrastructure needed~~ **ANSWERED: Yes, new AWS account + bindle (Michael meeting)**
4. Do we need security review before starting development? **ANSWERED: Staged, can start dev first (Michael meeting)**

### Important (Need Answers This Month)
5. CloudAuth MCP SDK - is there Python version?
6. Transitive Auth implementation - any examples?
7. MCP Registry registration - what's the process?
8. Hosting costs - Lambda vs Fargate comparison?
9. Redshift vs Athena - final decision and cost comparison
10. Kevin Cruse engagement - Get CDK patterns and WSTLake guidance

### Nice to Have (Can Defer)
11. Integration with WLBR.AI timeline?
12. WSS modernization approach and timeline?
13. Multi-agent collaboration patterns?
14. WSTLake 2.0 migration timeline and impact?

---

## Next Actions (Immediate)

### This Week (Oct 2-6)
1. ✅ Document MCP Everywhere mandate findings
2. ✅ Save Chetan thread with resolution
3. ✅ Read meeting notes (Ryan, Michael, YJ)
4. [ ] Check weblab Must-Do status (QuickSight)
5. [ ] Contact MCP Everywhere team (#mcp-everywhere-cci-interest)
6. [ ] Get Chetan baseline metrics (Friday Oct 11)
7. [ ] Present findings to Ryan with updated strategy
8. [ ] Contact Kevin Cruse - Redshift CDK + WSTLake patterns
9. [ ] Contact Arpit - Athena MCP server possibilities

### Next Week (Oct 7-11)
1. Research CloudAuth MCP SDK
2. Review Doug's Strands patterns in detail
3. Create WeblabStrandsAgent package skeleton
4. Set up development environment
5. Start tool migration planning

---

## References

### Official Documentation
- [MCP Everywhere Wiki](https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere)
- [MCP Everywhere SIM](https://issues.amazon.com/P282079924)
- [CloudAuth MCP SDK](https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/CloudAuth/Onboarding/MCP/NodeJS/)
- [MCP Gateway Guide](https://quip-amazon.com/u2jaAknttor9)
- [Security Guidance](https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/Fabric/Securing_AI_Workflows_in_SDO_Using_CloudAuth/)

### Project Documentation
- [Restart Package](docs/weblab-mcp/restart-package-2025-10-02.md) - Project snapshot
- [MCP Mandate Analysis](docs/weblab-mcp/mcp-everywhere-mandate.md) - Remote-first requirements
- [Phase 2 Plan](docs/phase-2/phase-2-strands-implementation-plan.md) - Strands implementation
- [Chetan Thread](docs/threads/chetan-amzn-mcp-thread.md) - Decision history

### Meeting Notes (October 2, 2025)
- [Ryan Meeting](docs/weblab-mcp/weblab-mcp-meetings/ryan-10-02.md) - MCP strategy, use case collection
- [Michael Meeting](docs/weblab-mcp/weblab-mcp-meetings/michael-10-02.md) - Infrastructure, security review
- [YJ Meeting](docs/weblab-mcp/weblab-mcp-meetings/yj-10-02.md) - Data access, Athena vs Redshift

### Code References
- [WeblabLearningAppBackendPython](WeblabLearningAppBackendPython/) - Doug's agent patterns
- [WeblabLearningAppBackendCDK](WeblabLearningAppBackendCDK/) - Deployment infrastructure
- [Strands MCP Investigation](docs/weblab-mcp/llm-mcp-strands-investigation.md) - Strands capabilities

### External Tools & References
- [Beta NL Query UI](https://beta.console.harmony.a2z.com/weblab-data-management/wstlake-query) - Existing natural language interface
- [Kevin's Complex Query Example](docs/weblab-mcp/weblab-mcp-meetings/yj-10-02.md) - 3-day SQL formulation showing AI value

### Support Channels
- **Slack**: #mcp-everywhere-cci-interest
- **SIM**: [Create ticket](https://t.corp.amazon.com/create/options?category=Company-wide%20services&type=Applied%20AI&item=MCPEverywhereCCI&group=MCP-Everywhere)
- **Office Hours**: Scheduled by MCP Everywhere program

---

## Conclusion

The discovery of the MCP Everywhere remote-first mandate clarifies our path forward: **build a remote Strands agent that satisfies CCI requirements while delivering enterprise-grade weblab data access**.

This approach:
- ✅ Meets mandatory CCI compliance
- ✅ Leverages proven production patterns (Doug's work)
- ✅ Reuses Phase 1 investment (6 tools, APIs, tests)
- ✅ Provides scalable, shareable solution
- ✅ Sets foundation for advanced workflows

Success requires focus and discipline to meet Q1 2026 deadline, but the architecture is validated and the technical path is clear.

---

**Roadmap Version:** 2.0 (Major revision - remote-first architecture)  
**Last Updated:** October 2, 2025  
**Next Review:** October 9, 2025 (after Must-Do verification)  
**Status:** Active development, remote Strands agent approach
