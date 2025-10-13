# MCP Everywhere Initiative - Critical Mandate Analysis

**Date:** October 2, 2025  
**Source:** https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere  
**Status:** CRITICAL - Changes our entire strategy

---

## Executive Summary

**CRITICAL DISCOVERY:** The MCP Everywhere CCI has a **mandatory requirement** for Remote-First Architecture that fundamentally conflicts with our current fork strategy.

**Our Current Plan:**
- Fork amzn-mcp (LOCAL MCP server)
- Runs on user's dev machine
- stdio-based communication

**Mandate Requirement:**
- **Remote Agent-first / Remote MCPServer-first approach**
- For better scalability and share-ability
- This is a **Mandatory Goal** (not optional)

---

## The Mandate

### 1.1 Mandatory Goals (from wiki line 32-39)

Our initiative establishes **four core mandatory goals**:

1. **Coral-native MCP Support**: Providing native support for MCP handling across Coral services
2. **Web tool Integration**: Enabling SDO web tools to expose their business APIs as MCP tools
3. **Remote-First Architecture**: Implementing a Remote Agent-first and Remote MCPServer-first approach for better scalability and share-ability.
4. **Standardized Protocol**: Establishing MCP as the standardized protocol for AI agents

### Why Remote-First? (lines 111-113)

> "Remote Agent-first / Remote MCPServer-first approach - A remote-MCP server is easily scalable and shareable. All the existing service solutions for rate limiting, tracing, logging, metrics, etc can be directly applied to natively built remote MCP servers."

---

## Impact on Our Fork Strategy

### Current Plan Issues

**What we were planning:**
```
User's Dev Machine
    ↓ stdio
Local MCP Server (forked from amzn-mcp)
    ↓ HTTP + Midway
Weblab APIs
```

**Problems:**
- Local server = NOT remote-first
- Runs on user's machine = NOT scalable
- stdio communication = NOT shareable
- **Violates mandatory CCI requirement**

### What We Need Instead

**Remote MCP Server Architecture:**
```
User's Dev Machine (Q CLI, Cline, etc.)
    ↓ Remote MCP protocol
Remote MCP Server (hosted in AWS)
    ↓ HTTP + CloudAuth/Midway
Weblab APIs
```

**Benefits (from wiki):**
- Easily scalable
- Shareable across organization
- Rate limiting, tracing, logging, metrics built-in
- **Aligns with CCI mandate**

---

## Current State Analysis

### What amzn-mcp Is
- **Type:** Local MCP server
- **Location:** User's dev machine
- **Communication:** stdio or local network port
- **Authentication:** Uses user's Midway token
- **Architecture:** Business logic + API calls in same process

### What We Need to Build
- **Type:** Remote MCP server
- **Location:** Hosted remotely (AWS)
- **Communication:** Remote MCP protocol (OAuth 2.0 bearer tokens)
- **Authentication:** CloudAuth for service identity + Transitive Auth for user delegation
- **Architecture:** Hosted service with standard service patterns

---

## Technical Details from Wiki

### Remote MCP Server (lines 79-81)

> "A remote MCP server is hosted remotely. The client needs the remote address and auth context to connect to the server. The current MCP spec only supports OAuth AuthZ flow and assumes the caller is authenticated and expects a bearer token."

### Authentication Patterns (lines 117-122)

**Two patterns supported:**

1. **Service-to-Service (Remote Agent):**
   - Remote agent runs as software application
   - Has its own IAM or CloudAuth identity
   - Treated like standard service-to-service calls

2. **User-Delegated Access (Agent on behalf of user):**
   - Remote agent runs on user's behalf
   - Passes user's identity via Transitive Auth (TA)
   - Agent is TA initiator, passes TA token to MCP server

### For Coral Services (lines 143-146)

> "Given that MCP's list operation has to return all the coral activities with their documentation and call operation has to call the right activity, a MCP Coral protocol should be feasible. By adding MCP as a protocol, the existing authN/authZ mechanisms should work for the MCP endpoint calls."

**For Weblab (not Coral):**
- Need to expose business APIs as MCP tools
- Follow web tool integration guidance
- Implement remote server patterns

---

## What This Means for Weblab

### Option 1: Remote MCP Server (Recommended)

**Architecture:**
```
WeblabMCPServer (Remote)
├─ Hosted in AWS (Lambda or ECS)
├─ Exposes MCP protocol endpoint
├─ Implements CloudAuth authentication
├─ Supports Transitive Auth for user delegation
├─ Uses WeblabAPIModel for data access
└─ Registered in MCP Registry
```

**Benefits:**
- Aligns with CCI mandate
- Scalable and shareable
- Standard service patterns (rate limiting, metrics, logging)
- Can use CloudWatch, X-Ray, etc.
- Proper access controls via IAM/CloudAuth

**Challenges:**
- More complex than local server
- Requires service hosting infrastructure
- Need to implement remote auth patterns
- Higher operational overhead

### Option 2: Hybrid (Local Proxy + Remote Server)

**Architecture (lines 81-82):**
> "There is a hybrid approach where local MCP server is a light weight proxy that makes authenticates the caller and calls remote MCP servers with the authentication data."

```
User's Machine
    ↓ stdio
Local MCP Proxy (lightweight)
    ↓ Remote MCP protocol
WeblabMCPServer (Remote)
    ↓ HTTP
Weblab APIs
```

**Benefits:**
- Local proxy handles Midway auth
- Remote server gets scalability benefits
- Still aligns with remote-first approach

**Challenges:**
- Two components to maintain
- Added complexity

---

## MCP Gateway Option

### AmazonMCPGateway (lines 94-100)

The wiki mentions an existing solution:

> "Amazon MCP Gateway is the current mechanism that Coral offers for exposing remote service endpoints as MCP servers."

**Components:**
- MCP Gateway service to route traffic from MCP clients to Coral services
- Bindles-based permissions on private MCP servers
- MCP Registry for service discovery

**Current Limitations:**
- Uses proxy intermediary
- Transitive Auth changes needed
- Target service sees MCPGateway as caller, not actual agent

**Status:**
- Wiki says "working with Coral team on native support vs using MCPGateway"
- Guidance may change based on outcome

---

## Timeline Impact

### MCP Everywhere CCI Timeline (lines 281-304)

**Key Dates:**
- **October 2025:** Program Launch (NOW!)
- **November 2025:** Team commitments due (11/28/2025)
- **December 2025:** Scope finalization
- **Q1 2026:** Implementation deadline for Must-Do services

### Weblab Status

**Checking if weblab is Must-Do:**
- Line 51: "Web-tools: Internally hosted Web-tools that receive >100K hits in 30-day period"
- Line 52: "Coral Services: 449 Coral Services that have 100+ client services"

**WSS has 125 client dependencies** (from our earlier docs) → Likely Must-Do

**Impact:**
- If weblab is Must-Do → Q1 2026 deadline
- Must implement remote-first architecture
- Our fork strategy needs immediate revision

---

## Comparison: Local vs Remote

| Aspect | Local MCP (Current Plan) | Remote MCP (Mandate) |
|--------|-------------------------|---------------------|
| **Location** | User's dev machine | AWS hosted service |
| **Communication** | stdio/local port | Remote MCP protocol |
| **Authentication** | User's Midway token | CloudAuth + TA |
| **Scalability** | Limited to user's machine | AWS auto-scaling |
| **Share-ability** | One user at a time | Shared across org |
| **Rate Limiting** | Per-user, hard to enforce | Service-level, standard patterns |
| **Metrics** | Custom implementation | Standard CloudWatch |
| **Logging** | Custom | Standard CloudWatch Logs |
| **Tracing** | Custom | X-Ray integration |
| **CCI Compliance** | Violates mandate | Meets requirement |

---

## Recommended Path Forward

### Immediate Actions (This Week)

1. **Abandon local fork strategy** - Does not meet CCI mandate
2. **Research remote MCP patterns** - Understand implementation requirements
3. **Check if weblab is Must-Do** - Verify via QuickSight dashboard
4. **Engage with MCP Everywhere team** - Get guidance on remote implementation

### Investigation Needed

1. **Authentication Patterns:**
   - How to implement CloudAuth for service identity?
   - How to support Transitive Auth for user delegation?
   - What are the security review requirements?

2. **Hosting Options:**
   - Lambda vs ECS vs other?
   - How to handle WebSocket for MCP protocol?
   - What's the deployment pattern?

3. **MCP Registry:**
   - How to register remote MCP server?
   - What's the discovery mechanism?
   - How do users connect?

4. **Existing Solutions:**
   - Can we use AmazonMCPGateway?
   - What's the status of Coral native support?
   - Are there templates/examples for remote servers?

### Short-Term Plan (2-3 Weeks)

1. Contact MCP Everywhere CCI team via:
   - Slack: #mcp-everywhere-cci-interest
   - SIM: Create ticket for guidance
2. Review QuickSight dashboard to confirm Must-Do status
3. Research remote MCP implementation patterns
4. Prototype simple remote MCP server
5. Present revised approach to Ryan/stakeholders

---

## Open Questions

### Critical Questions

1. **Is weblab Must-Do or Should-Do?**
   - Check QuickSight dashboard
   - WSS has 125 client dependencies → likely Must-Do

2. **Can we use AmazonMCPGateway?**
   - Would this satisfy remote-first requirement?
   - What are current limitations?
   - Timeline for improvements?

3. **What's the remote auth pattern?**
   - How to implement CloudAuth?
   - How to support user delegation via TA?
   - Security review requirements?

4. **Are there examples/templates?**
   - Reference implementations?
   - Golden path templates for remote servers?
   - Best practices documentation?

### Secondary Questions

5. What's the hosting cost for remote MCP server?
6. How do users connect to remote servers from Q CLI/Cline?
7. What's the registration process for MCP Registry?
8. Can we still use Weblab API keys or must use CloudAuth only?

---

## Risk Assessment

### Risk: Wrong Architecture

**Description:** Our entire fork strategy is based on local MCP server, which violates CCI mandate

**Impact:** 
- HIGH - Potential wasted effort if we proceed with local fork
- Could be non-compliant with Q1 2026 deadline
- May not get approved if doesn't meet mandate

**Mitigation:**
- STOP current fork execution
- Research remote MCP patterns immediately
- Engage with MCP Everywhere team
- Pivot strategy to remote-first approach

### Risk: Timeline Pressure

**Description:** Changing architecture approach delays implementation

**Impact:**
- MEDIUM - Q1 2026 deadline is aggressive
- Need to understand remote patterns quickly
- May need additional resources

**Mitigation:**
- Leverage existing solutions (AmazonMCPGateway?)
- Get early guidance from MCP team
- Prototype quickly to validate approach

### Risk: Complexity Increase

**Description:** Remote server is more complex than local fork

**Impact:**
- MEDIUM - More moving parts
- Service hosting, deployment, monitoring
- Authentication complexity

**Mitigation:**
- Use existing service patterns at Amazon
- Leverage standard AWS services
- Follow MCP Everywhere guidance and templates

---

## References

- **Wiki:** https://w.amazon.com/bin/view/AppliedAI/MCPEverywhere
- **Slack:** #mcp-everywhere-cci-interest
- **SIM:** https://t.corp.amazon.com/create/options?category=Company-wide%20services&type=Applied%20AI&item=MCPEverywhereCCI&group=MCP-Everywhere
- **QuickSight:** https://us-east-1.quicksight.aws.amazon.com/sn/account/amazonbi/dashboards/9690506d-6bd6-4003-800c-88d25dc2a486
- **CloudAuth MCP SDK:** https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/CloudAuth/Onboarding/MCP/NodeJS/
- **MCP Gateway Guide:** https://quip-amazon.com/u2jaAknttor9
- **Security Guidance:** https://w.amazon.com/bin/view/Dev.CDO/UnifiedAuth/Fabric/Securing_AI_Workflows_in_SDO_Using_CloudAuth/Builder_Guidance_For_Securing_AI_Workflows_in_SDO_V3/

---

## Next Steps

1. **URGENT:** Verify weblab Must-Do status via QuickSight
2. **Contact MCP Everywhere team** - Get guidance on remote implementation
3. **Research CloudAuth MCP SDK** - Understand remote auth patterns
4. **Investigate AmazonMCPGateway** - Check if suitable for weblab
5. **Update strategy docs** - Revise fork approach to remote-first
6. **Stakeholder meeting** - Present findings to Ryan/team

**Status:** Strategy pivot required  
**Priority:** URGENT  
**Impact:** Fundamental architecture change needed
