# MCP/AI Technical Vision - Brainstorm

**Owner:** Sergio Ibagy (with support from Doug, YJ, Arpit)  
**Date:** October 2, 2025  
**Purpose:** Input for Weblab 3YAP - Technical architecture and implementation approach for MCP/AI  
**Status:** DRAFT - Brainstorming phase, not final

---

## Purpose of This Doc

Technical brainstorm covering:
- Current architecture and what we've built
- Problems with original approach
- Proposed solutions and trade-offs
- 3-year technical evolution
- Open technical debates

**Not meant to be:** Polished, buttoned-up, or ready for external review

---

## Existing Architecture (Phase 1 - What We Built)

### Current State: 3 Working MCP Tools

```
User's Machine (Q CLI, Cline)
    ↓ stdio
amzn-mcp (Local Server)
    ↓ Tool calls
Weblab MCP Tools (TypeScript)
    ├─ weblab_details → GetExperiment API
    ├─ weblab_allocations → ListAllocations API
    └─ weblab_activation_history → ListAllocationPeriods API
         ↓ HTTP + Midway Auth
    Weblab APIs (WeblabAPIModel)
```

**What works:**
- ✅ All 3 tools tested with Vignesh (director demo)
- ✅ 2179 tests passing
- ✅ Dual authentication (Midway + Weblab API keys)
- ✅ BETA and PROD environment support
- ✅ Integration with andes-mcp for Andes SQL queries

**Technical achievements:**
- Proper API authentication (not page scraping)
- Tool discovery and parameter validation
- Error handling and rate limiting
- BYOK support for team-specific keys

### Other Tools Built (Archived - Untested)

**Experimental tools we won't migrate:**
- `weblab_user_experiments` - Andes SQL queries
- `weblab_request_andes_access` - Auto permission requests
- `weblab_health_check` - Metrics monitoring

**Why archived:** Remote Strands agent handles these better (see below)

---

## Problems / Themes

### Problem 1: Local Fork Violates MCP Everywhere Mandate

**Discovery (Oct 2):** MCP CCI has mandatory "Remote-First Architecture" requirement

**Impact:**
- Our September fork plan = **non-compliant**
- Local stdio servers don't meet CCI bar
- amzn-mcp deprecating by end of October anyway
- Chetan rejected merge request

**Quote from mandate:**
> "Remote Agent-first / Remote MCPServer-first approach - A remote-MCP server is easily scalable and shareable."

**Why this matters:**
- WSS has 125 clients → Must-Do status
- Q1 2026 deadline (P0)
- Can't proceed with non-compliant architecture

### Problem 2: Scalability and Share-ability

**Current limitations:**
- One local server per user
- Can't share agents across org
- No centralized rate limiting or metrics
- Each user needs local setup

**Enterprise needs:**
- Shared infrastructure
- Consistent behavior across users
- Centralized monitoring and control
- Cost optimization

### Problem 3: Authentication Complexity in Local Model

**Current auth:**
- User's Midway token for API calls
- Works for individual users
- Doesn't scale for service-to-service

**Missing:**
- Service identity (CloudAuth)
- Transitive Auth for user delegation
- Proper audit trails ("who called this?")

### Problem 4: Observability Gaps

**Current:**
- Custom metrics implementation (accessible-metrics.ts)
- No distributed tracing
- Can't correlate user query → tool calls → API responses
- Hard to debug agent reasoning

**Need:**
- OpenTelemetry for traces
- CloudWatch for standard metrics
- Cost tracking (token usage)
- Conversation logging

---

## Hotly Debated Topics

### Debate 1: Fork amzn-mcp vs Build Remote Server

**On one hand (September thinking):**
- Fork amzn-mcp, clean it up, team ownership
- Reuse existing auth patterns (Midway already works)
- Faster to market (1-2 weeks)
- Lower complexity

**On the other hand (October reality):**
- Violates remote-first mandate
- amzn-mcp deprecating anyway
- Local architecture doesn't scale
- Must build remote anyway for compliance

**Resolution:** Remote Strands agent (see below)

### Debate 2: Custom Remote Server vs AmazonMCPGateway

**AmazonMCPGateway (existing solution):**
- Pros: Already exists, maintained by Coral team, MCP Registry integration
- Cons: Designed for Coral services, Transitive Auth limitations, less control

**Custom Remote Server (Strands agent):**
- Pros: Full control, agent orchestration, optimized for weblab
- Cons: More to build and maintain, higher complexity

**Current thinking:** 
- Strands agent preferred (see reasons below)
- But investigate MCPGateway as fallback
- Need guidance from MCP Everywhere team

### Debate 3: Redshift vs Athena for Data Access

**Redshift cluster (Kevin's recommendation):**
- Pros: Proven, scalable (adjust compute), has CDK patterns
- Cons: Infrastructure costs, need to maintain cluster

**Athena MCP server (via andes-mcp):**
- Pros: No infrastructure, uses existing andes-mcp, auto-approved access
- Cons: Dependent on andes-mcp availability, less control

**Current thinking:**
- Start with Redshift (proven)
- YJ to investigate Athena costs
- Arpit to explore andes-mcp integration
- Decision by Nov 2025

### Debate 4: Language Choice (TypeScript vs Python)

**TypeScript (Phase 1):**
- Pros: Existing tools in TS, amzn-mcp patterns
- Cons: Limited agent frameworks, would need custom MCP server implementation

**Python (Strands):**
- Pros: Strands SDK, Doug's patterns, OpenTelemetry built-in, AWS internal adoption
- Cons: Rewrite tools from TS, team learning curve

**Current thinking:** Python/Strands wins because:
- Native MCP support (MCPClient + can BE MCP server)
- Doug's production patterns available
- Agent orchestration beyond simple tools
- Better observability story

---

## New Architecture (Remote Strands Agent)

### Why Strands Agent

**Key insight from investigation:**
> Strands agents ARE remote architecture. They're designed to be deployed as Lambda/Fargate services, not local processes.

**Architecture:**
```
User's Machine (Q CLI, Cline, etc.)
    ↓ Remote MCP protocol (OAuth bearer tokens)
WeblabStrandsAgent (Lambda - REMOTE!)
    ├─ MCP Protocol Endpoint
    │  └─ Handles MCP list/call operations
    ├─ Strands Agent Core
    │  └─ LLM + tools + orchestration
    ├─ Weblab Tools (migrated from Phase 1)
    │  ├─ @tool weblab_details
    │  ├─ @tool weblab_allocations
    │  └─ @tool weblab_activation_history
    └─ Observability (OpenTelemetry)
         ↓ CloudAuth + Transitive Auth
    Weblab APIs (WeblabAPIModel)
         ↓ (optional) Remote MCP
    Andes MCP Server (for complex SQL)
```

**Key properties:**
- ✅ Remote-first compliant
- ✅ Scalable (Lambda auto-scaling)
- ✅ Shareable (org-wide access)
- ✅ MCP native (Strands SDK support)
- ✅ Production-ready (Doug's patterns)

### Technical Benefits

**1. Reuses Phase 1 Work:**
- 90% of API logic portable
- Authentication patterns understood
- Tool schemas validated
- Test cases reusable

**2. Agent Orchestration:**
```python
# User asks complex question
"What weblabs did Dave launch that had positive CP impact?"

# Agent orchestrates multiple tools:
1. Call weblab_user_experiments(owner="dave")
2. For each experiment, call weblab_details()
3. Filter by has_results=true
4. Query Andes for CP metrics
5. Synthesize answer

# User gets: Natural language answer with data
```

**3. Observability Built-in:**
- OpenTelemetry traces entire flow
- Original NL request preserved
- Tool execution visible
- Cost tracking automatic
- Conversation logging for debugging

**4. Production Deployment:**
- Doug's CDK patterns (WeblabLearningAppBackendCDK)
- Lambda deployment proven
- CloudWatch integration standard
- IAM roles and permissions
- API Gateway for access control

### Authentication Evolution

**Phase 1 (Local):**
- User's Midway token
- Weblab API keys
- Works but limited to individual users

**Phase 2 (Remote):**
- **Service identity:** Lambda role with CloudAuth
- **User delegation:** Transitive Auth tokens
- **Audit trail:** Preserves "who asked" information
- **Scalable:** Service-level auth, not per-user

**Implementation:**
```python
# Service identity for API calls
session = boto3.Session()  # Lambda execution role
credentials = session.get_credentials()

# User delegation via Transitive Auth
ta_token = request.headers.get('X-Amzn-TA-Token')
headers = {
    'Authorization': f'Bearer {ta_token}',
    'x-api-key': get_weblab_api_key()
}
```

### Data Access Pattern

**Current (Phase 1):**
- HTTP bridge to andes-mcp for SQL
- Works but indirect

**Proposed (Phase 2):**
```python
# Option A: Direct Redshift (Kevin's pattern)
redshift_client = boto3.client('redshift-data')
result = redshift_client.execute_statement(
    Database='wstlake',
    Sql=agent_generated_sql,
    ClusterIdentifier='weblab-cluster'
)

# Option B: Athena MCP (via andes-mcp)
andes_tools = MCPClient(lambda: remote_mcp('andes-mcp-url'))
result = andes_tools.call('DataCentralWorkbench', {
    'operation': 'execute_query',
    'sql': agent_generated_sql
})
```

**Decision factors:**
- Cost: Redshift cluster vs Athena per-query
- Latency: Direct cluster vs MCP indirection
- Maintenance: Cluster ops vs andes-mcp dependency
- Control: Full control vs shared service

---

## Three Year Technical Roadmap

### Year 1 (2026): Remote Foundation

**Q1 2026 (P0 - CCI Deadline):**
- [x] Phase 1 complete (3 tools, tested)
- [ ] Remote Strands agent deployed
- [ ] MCP protocol interface working
- [ ] CloudAuth + TA authentication
- [ ] Registered in MCP Registry
- [ ] 3 core tools migrated to Python

**Q2-Q4 2026:**
- Observability hardening (OpenTelemetry, CloudWatch)
- Data access optimization (Redshift vs Athena decision)
- Broader user adoption (50+ users)
- Integration with andes-mcp for complex queries
- Performance tuning and cost optimization

**Technical debt addressed:**
- ✅ Remove dependency on amzn-mcp (deprecating)
- ✅ Proper remote architecture (mandate-compliant)
- ✅ Standard service patterns (not custom)

### Year 2 (2027): Write Capabilities & Automation

**New capabilities:**
- Write tools (create experiments, dial up/down)
- Policy-aware automation (respect blocked days, ARC)
- MCM/CSM integration for automated workflows
- Multi-agent patterns (specialized sub-agents)

**Technical additions:**
- State management for dial-up workflows
- Event-driven triggers (SNS, EventBridge)
- Workflow orchestration (Strands workflow tools)
- Advanced auth (policy exceptions, lock mechanisms)

**Architecture evolution:**
```python
# Multi-agent collaboration
analysis_agent = Agent(tools=[read_tools], model=Claude())
automation_agent = Agent(tools=[write_tools], model=Claude())

# Orchestrator agent coordinates
orchestrator = Agent(
    tools=[analysis_agent_tool, automation_agent_tool],
    model=Claude()
)
```

**Questions for Doug:**
- How to handle long-running dial-up workflows in Lambda?
- Step Functions vs Strands workflow tool?
- State persistence patterns?

### Year 3 (2028): AI-Native Weblab Platform

**Vision (speculative but grounded):**
- Fully conversational experiment lifecycle
- Proactive agent recommendations
- Multi-agent collaboration (science + eng + PM)
- Self-service complex analysis
- Agent-generated experiments from requirements

**Technical enablers:**
- Agent-to-Agent (A2A) protocol (Strands roadmap)
- Advanced reasoning models (GPT-5? Claude 4?)
- Improved tool retrieval (6000+ tools case from AWS blog)
- WSTLake 2.0 dimensional modeling

**Open questions:**
- How far can/should we push automation?
- What stays human-in-loop vs fully autonomous?
- Integration with broader Amazon AI platforms?

---

## Technical Challenges Over 3 Years

### Challenge 1: Authentication at Scale

**Current:** User Midway tokens work for individuals  
**Problem:** Remote agents need service identity + user delegation  
**Solution:** CloudAuth + Transitive Auth  
**Unknown:** Python CloudAuth MCP SDK availability? Examples?

**Questions for MCP Everywhere team:**
- Is CloudAuth MCP SDK Python-compatible?
- TA token passing patterns for Strands agents?
- Security certification requirements?

### Challenge 2: Cost Management

**Concerns:**
- Lambda invocation costs
- LLM token costs (Bedrock)
- Data query costs (Redshift vs Athena)
- S3 storage for sessions

**Mitigation ideas:**
- Throttling and rate limiting
- Caching for common queries
- Model selection (Haiku vs Sonnet)
- Session expiration policies

**Need:** Cost modeling with YJ for different load scenarios

### Challenge 3: Latency Tolerance

**User expectations changing:**
- YJ noted users more tolerant of agent latency
- But still want <2s for simple queries
- Complex analysis can be slower

**Technical factors:**
- Cold start (Lambda)
- LLM inference time
- Tool execution (API calls)
- Data query time (seconds to minutes)

**Approaches:**
- Warm Lambdas for common paths
- Streaming responses (partial results)
- Progressive disclosure
- Background processing for complex queries

### Challenge 4: Tool Selection at Scale

**AWS example:** One agent has 6000+ tools  
**Problem:** Models can't handle that many tool descriptions  
**Solution:** Semantic search + retrieval (Strands retrieve tool)

**For weblab:**
- Start with 3 tools (manageable)
- Year 2: Add write tools (10-15 tools?)
- Year 3: Integration with other MCP servers (100+ tools?)

**Pattern:**
```python
# Semantic retrieval for tool selection
retrieve_tool = RetrieveTool(
    knowledge_base_id='weblab-tools-kb',
    top_k=5
)

agent = Agent(
    tools=[retrieve_tool],  # Can find other tools
    model=BedrockClaude()
)
```

**Questions for Doug:**
- At what scale do we need retrieval?
- Bedrock Knowledge Base vs custom?
- How to keep tool descriptions updated?

---

## Proposed Architecture Details

### Deployment Stack (Doug's Patterns)

**From WeblabLearningAppBackendCDK:**
```typescript
// Lambda function with Strands agent
new Function(stack, 'WeblabAgent', {
  runtime: Runtime.PYTHON_3_12,
  handler: 'agent.handler',
  code: Code.fromAsset('lambda/'),
  timeout: Duration.minutes(5),
  memorySize: 1024,
  environment: {
    WEBLAB_API_KEY: secret.secretValue,
    SESSIONS_BUCKET: sessionsBucket.bucketName,
    OTEL_EXPORTER_ENDPOINT: 'cloudwatch'
  }
});

// API Gateway for remote access
const api = new RestApi(stack, 'WeblabMCPApi', {
  restApiName: 'weblab-mcp-server',
  deployOptions: { stageName: 'prod' }
});

// CloudAuth integration
new CloudAuthConstruct(stack, 'CloudAuth', {
  serviceName: 'WeblabMCPServer',
  allowedCallers: ['AmazonQ', 'Cline', ...]
});
```

**Infrastructure pieces:**
- Lambda for agent execution
- API Gateway for MCP protocol endpoint
- S3 for session persistence
- CloudWatch for logs/metrics
- IAM roles for CloudAuth
- EventBridge for async workflows (future)

### MCP Protocol Implementation

**Strands natively supports both directions:**

**As MCP Client (using other servers):**
```python
# Connect to andes-mcp for SQL queries
from strands.tools.mcp import MCPClient

andes_mcp = MCPClient(lambda: remote_mcp_client(
    url='andes-mcp-gateway.internal',
    auth=cloudauth_token
))

with andes_mcp:
    sql_tools = andes_mcp.list_tools_sync()
    # Now agent can use DataCentralWorkbench, etc.
```

**As MCP Server (being used by others):**
```python
# Expose weblab agent as MCP server
from mcp import Server

server = Server("weblab-strands-agent")

@server.call_tool()
async def analyze_experiment(args: dict) -> dict:
    experiment_id = args['experiment_id']
    result = await weblab_agent(
        f"Analyze experiment {experiment_id} comprehensively"
    )
    return {"analysis": result}

# Register in MCP Registry
register_mcp_server(
    name='weblab-strands-agent',
    endpoint='https://weblab-mcp.internal/mcp',
    bindle_id='WeblabMCPBindle'
)
```

**Questions:**
- Do we need BOTH directions immediately?
- Start with client-only, add server exposure later?
- Registration process and timeline?

### Data Access Architecture

**Option A: Direct Redshift (Preferred - Kevin)**
```python
import boto3

redshift_data = boto3.client('redshift-data')

@tool
def query_wstlake(natural_language_query: str) -> dict:
    """Execute SQL query against WSTLake via Redshift"""
    
    # Agent generates SQL from NL query
    sql = agent.generate_sql(natural_language_query)
    
    # Execute on cluster
    response = redshift_data.execute_statement(
        ClusterIdentifier='weblab-wstlake-cluster',
        Database='wstlake',
        Sql=sql,
        SecretArn=credentials_secret
    )
    
    # Poll for results
    return get_query_results(response['Id'])
```

**Pros:** Full control, predictable costs, Kevin has CDK  
**Cons:** Cluster management, infrastructure costs

**Option B: Athena via andes-mcp (Investigate - Arpit)**
```python
# Use existing andes-mcp server
andes_tools = MCPClient(lambda: connect_andes_mcp())

@tool  
def query_wstlake(natural_language_query: str) -> dict:
    """Execute SQL query via Athena through andes-mcp"""
    
    sql = agent.generate_sql(natural_language_query)
    
    result = andes_tools.call('DataCentralWorkbench', {
        'operation': 'execute_query',
        'databaseId': 'weblab-athena-db',
        'sql': sql
    })
    
    return result
```

**Pros:** No infrastructure, uses existing service  
**Cons:** andes-mcp dependency, less control, unknown costs

**Decision criteria:**
- Cost at scale (1000s queries/day)
- Latency requirements
- Maintenance burden
- Control/flexibility needs

### Tool Migration Pattern

**TypeScript → Python Strands:**
```python
# Before (TypeScript MCP tool)
export const weblab_details: Tool = {
  name: "weblab_details",
  description: "Get experiment details...",
  paramSchema: z.object({...}),
  cb: async (args) => {
    return await getExperimentDetails(args);
  }
};

# After (Python Strands tool)
from strands import tool

@tool
def weblab_details(
    experiment_id: str,
    environment: str = "BETA"
) -> dict:
    """Get comprehensive weblab experiment details
    
    Args:
        experiment_id: The weblab ID (e.g., 'WEBLAB_123')
        environment: BETA or PROD (default: BETA)
    
    Returns:
        dict with experiment metadata, treatments, ownership
    """
    # Reuse Phase 1 API logic
    return call_weblab_api("GetExperiment", {
        'experimentId': experiment_id,
        'environment': environment
    })
```

**Migration effort per tool:** ~1 day (API logic reusable, schema translation)

---

## Infrastructure Requirements

### New AWS Resources (From Michael Meeting)

**Need:**
- New AWS account (not shared dumping-ground)
- New bindle for MCP project team
- Proper access controls and ownership

**Components:**
- Lambda functions (Strands agent handlers)
- API Gateway (MCP protocol endpoint)
- S3 bucket (session management)
- CloudWatch log groups (us-east-1 for telemetry)
- IAM roles (CloudAuth trust relationships)
- Secrets Manager (Weblab API keys)

**CDK Stack Structure:**
```
WeblabMCPServerStack
├─ Lambda (agent execution)
├─ API Gateway (remote access)
├─ S3 (sessions)
├─ CloudWatch (logs/metrics)
├─ IAM (roles/policies)
└─ Monitoring (alarms/dashboards)
```

**Security review:** Staged (can start dev before full approval - Michael)

### Observability Stack

**OpenTelemetry Setup:**
```python
from strands.telemetry import StrandsTelemetry

# Configure tracing and metrics
StrandsTelemetry() \
    .setup_console_exporter() \
    .setup_otlp_exporter(
        endpoint='cloudwatch-otel-collector',
        headers={'x-service': 'weblab-mcp'}
    )
```

**What we get:**
- Distributed traces (user query → tools → APIs)
- Metrics (latency, token usage, success rates)
- Logs (conversation history, errors)
- Cost tracking (LLM tokens, API calls)

**Dashboard visualization:**
- CloudWatch dashboards
- X-Ray service map
- QuickSight for usage analytics

---

## Migration Plan (Technical Steps)

### Week 1-2: Setup
- [x] Archive untested tools
- [ ] Create WeblabStrandsAgent Python package
- [ ] Set up CDK infrastructure package
- [ ] Configure dev environment (Doug's patterns)
- [ ] Establish testing framework

### Week 3-4: Core Tools
- [ ] Port weblab_details to Python
- [ ] Port weblab_allocations to Python
- [ ] Port weblab_activation_history to Python
- [ ] Add OpenTelemetry instrumentation
- [ ] Unit tests for each tool

### Week 5-6: Agent & MCP
- [ ] Create Strands agent with tools
- [ ] Implement MCP server protocol
- [ ] Add CloudAuth authentication
- [ ] Support Transitive Auth
- [ ] Integration tests

### Week 7-8: Deployment
- [ ] Deploy CDK stacks
- [ ] Configure API Gateway
- [ ] Set up CloudWatch
- [ ] Register in MCP Registry
- [ ] Internal testing

### Week 9-10: Launch
- [ ] Security certification
- [ ] Documentation
- [ ] Team onboarding
- [ ] Production monitoring
- [ ] CCI compliance reporting

---

## Technology Choices & Rationale

### Strands Agent SDK
- **Why:** Native MCP support, production patterns, AWS adoption
- **Alternative:** LangChain (less stable per Reddit feedback)
- **Decision:** Strands more enterprise-ready

### Python Runtime
- **Why:** Strands SDK, Doug's patterns, rich AI ecosystem
- **Alternative:** TypeScript (Phase 1 choice)
- **Decision:** Python for agent framework benefits

### Lambda Hosting
- **Why:** Serverless, auto-scaling, cost-effective for variable load
- **Alternative:** Fargate (always-on, predictable)
- **Decision:** Start Lambda, evaluate Fargate if always-on needed

### Bedrock Claude
- **Why:** Strong reasoning, good with tools, AWS integration
- **Alternative:** Other providers via LiteLLM
- **Decision:** Claude primary, keep provider flexibility

### OpenTelemetry
- **Why:** Industry standard, AWS support, Strands built-in
- **Alternative:** Custom logging
- **Decision:** Standard wins for maintainability

---

## Open Technical Questions

### Critical (Need Answers to Proceed)

1. **CloudAuth MCP SDK - Python version exists?**
   - Link shows Node.js, need Python equivalent
   - Or implement manually?

2. **Transitive Auth implementation patterns?**
   - How to receive TA token in Lambda?
   - How to pass to downstream APIs?
   - Any Strands examples?

3. **MCP Registry registration process?**
   - Step-by-step guide where?
   - Testing before production registration?
   - Update/versioning patterns?

4. **New AWS account timeline?**
   - How long for setup?
   - Bindle creation process?
   - Can we start in existing account temporarily?

### Important (Need Soon)

5. Redshift cluster sizing and costs?
6. Athena query costs at scale?
7. Lambda memory/timeout optimization?
8. Session management strategy (how long to keep)?

### Nice to Have (Can Defer)

9. Multi-region deployment?
10. Disaster recovery patterns?
11. Blue/green deployment for agents?
12. A/B testing different prompts?

---

## Risks (Technical Perspective)

### Risk: Strands Learning Curve

**Concern:** Team unfamiliar with framework  
**Reality:** Doug has production patterns, Strands well-documented  
**Mitigation:** Use Doug's code as starting point, 1-2 week learning

### Risk: Remote Auth Complexity

**Concern:** CloudAuth + TA more complex than Midway-only  
**Reality:** It is, but MCP Everywhere team has guidance  
**Mitigation:** Start service-identity only, add TA in phase 2

### Risk: Lambda Cold Starts

**Concern:** User waits for cold Lambda → bad UX  
**Reality:** Provisioned concurrency available  
**Mitigation:** Monitor latency, tune accordingly, streaming responses

### Risk: Data Access Performance

**Concern:** Complex SQL queries slow down agent responses  
**Reality:** Kevin's queries already take seconds, users okay with it per YJ  
**Mitigation:** Async patterns, streaming partial results, caching

---

## Questions for Support Team

### For Doug:
- Review WeblabLearningAppBackend patterns still current?
- Lambda vs Fargate recommendation for agent hosting?
- Workflow orchestration patterns for dial-up automation?
- OpenTelemetry setup lessons learned?

### For YJ:
- WSTLake 2.0 timeline and data model changes?
- Cost modeling for Redshift vs Athena at scale?
- Data access patterns that work well with agents?
- Query optimization strategies?

### For Arpit:
- Athena MCP server current capabilities?
- Integration feasibility with andes-mcp?
- Complex query handling in Athena?
- Cost comparison with Redshift?

---

## Next Steps

- [ ] Review with Doug (Strands patterns)
- [ ] Review with YJ (data access strategy)
- [ ] Review with Arpit (Athena integration)
- [ ] Sync with Will for 3YAP consolidation
- [ ] Update based on team feedback
- [ ] Document final technical approach

---

## Notes & Scratchpad

### Ideas to Explore
- Can we use existing WeblabLearningAppBackendCDK infrastructure?
- Multi-agent patterns for complex workflows?
- Integration with other primitives (Control Plane APIs)?
- Agent-generated Andes SQL vs pre-built queries?

### Lessons from Phase 1
- Public APIs only (no page scraping)
- Authentication is complex but critical
- Testing with real users essential
- Tool descriptions matter for discovery

### Technical Debt to Avoid
- Over-engineering before validation
- Premature optimization
- Custom solutions where standards exist
- Tight coupling between components

---

**Document Status:** DRAFT - Technical brainstorm  
**Next Review:** Week of October 7  
**For:** Input to Weblab 3YAP technical vision
