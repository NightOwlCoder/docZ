# Response to Architecture Questions (Draft for Sergio)

## For Will Poff's Question: "Can you help me understand more about amzn-mcp vs strands based mcp?"

Great question Will! Let me break down the architectural approach and why we're taking a phased strategy:

### Phase 1: amzn-mcp (Current Implementation - MVP)

**What it is:**
- A TypeScript-based MCP server that runs as part of the shared `amzn-mcp` package
- Implements the Model Context Protocol (MCP) standard for tool discovery and execution
- Currently hosts our 4 weblab tools (details, allocations, activation_history, search)

**Architecture:**
```
Amazon Q / Other AI Clients
    ↓ (MCP Protocol)
amzn-mcp server (TypeScript, shared package)
    ↓ (HTTPS + Midway Auth)
Weblab API Gateway
    ↓
Weblab Services
```

**Why we started here:**
- **Speed to market**: Leveraged existing infrastructure to validate the concept
- **Proven integration**: amzn-mcp already works with Amazon Q, Cline, and other AI tools
- **Community support**: Benefits from improvements made by other teams
- **Zero infrastructure cost**: No servers to maintain during validation phase

**Limitations (addressing Arpit's concerns):**
- Shared ownership means less control over release cycles
- Other teams can modify the package without our consent
- Limited observability into usage patterns
- Can't deploy custom logic or business rules

### Phase 2: Strands-based MCP (Planned - Production)

**What it is:**
- A Python-based serverless MCP implementation using Amazon's Strands framework
- Fully owned and operated by the Weblab team
- Deployed as Lambda functions with API Gateway frontend

**Architecture:**
```
Amazon Q / Other AI Clients
    ↓ (MCP Protocol)
Weblab MCP API Gateway (our control)
    ↓
Strands Lambda Functions (Python)
    ├── Tool Discovery Handler
    ├── Tool Execution Handlers
    └── Observability & Metrics
    ↓ (Internal APIs)
Weblab Services
```

**Key Benefits (directly addressing Arpit's points):**
1. **Full Control**: We own the entire stack, control API exposure, versioning, and release cycles
2. **Production Ready**: Can be deployed in our production environment with proper monitoring
3. **Custom Business Logic**: Can implement weblab-specific optimizations and caching
4. **Better Observability**: CloudWatch metrics, X-Ray tracing, custom dashboards
5. **Independent Scaling**: Auto-scales based on our usage patterns
6. **No External Dependencies**: No reliance on amzn-mcp team for updates or fixes

**Strands Framework Advantages:**
- Serverless (Lambda) means no infrastructure management
- Built-in authentication and authorization patterns
- Automatic API documentation generation
- Standard Amazon operational tooling (monitoring, alarming, etc.)
- Cost-effective: pay only for actual usage

### Why This Phased Approach?

1. **Risk Mitigation**: Validate the concept with minimal investment
2. **Learning**: Understand usage patterns and requirements before building production system
3. **Parallel Development**: Phase 2 can be developed while Phase 1 serves users
4. **Smooth Migration**: Users can transition when Phase 2 is ready without disruption

### Timeline

- **Phase 1** (Current): Already deployed, gathering usage metrics and feedback
- **Phase 2 Development**: Can start immediately (likely 2-3 sprints)
- **Migration**: Gradual transition with both running in parallel initially
- **Phase 1 Deprecation**: Once Phase 2 is stable and adopted

### Addressing Arpit's Specific Concerns

> "Is depending on amzn-mcp, a one way door decision?"

**No, it's explicitly a two-way door.** Phase 1 is our MVP to validate the approach. Phase 2 (Strands) gives us complete independence.

> "Long term I dont think we should vend out our MCP in a 'generic' package"

**Agreed 100%.** That's why Phase 2 is a Weblab-owned service. Phase 1 is just for rapid validation.

> "we ourselves would like to use it in our AI applications"

**Exactly.** Phase 2's Strands implementation can be integrated directly into our AI applications without going through external MCP servers.

### Next Steps

1. Continue gathering metrics from Phase 1 to inform Phase 2 design
2. Start Phase 2 Strands implementation (I can provide the technical design)
3. Plan migration strategy to ensure smooth transition for users

Let me know if you need more details on either architecture or the migration plan!

---

## Key Technical Differences Summary

| Aspect | amzn-mcp (Phase 1) | Strands MCP (Phase 2) |
|--------|-------------------|---------------------|
| **Language** | TypeScript | Python |
| **Deployment** | Shared NPM package | Serverless (Lambda) |
| **Ownership** | Shared with amzn-mcp team | Fully Weblab-owned |
| **Control** | Limited | Complete |
| **Monitoring** | Basic | Full CloudWatch/X-Ray |
| **Scaling** | Manual | Auto-scaling |
| **Customization** | Limited | Unlimited |
| **Release Cycle** | Dependent on amzn-mcp | Independent |
| **Cost** | Free (shared) | Pay per use (minimal) |
| **Time to Deploy** | Immediate | 2-3 sprints |
