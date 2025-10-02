# Short Reply for Will Poff's Quip Comment

## Reply:

@Will Great question!
Quick summary:

**amzn-mcp (Phase 1 - Current)**: TypeScript MCP server in shared package. Quick MVP to validate concept, but limited control.

**Strands MCP (Phase 2 - Planned)**: Python serverless MCP we'll fully own. Complete control over APIs, release cycles, and can deploy in our prod environment.

Think of it as:
- phase 1 = ride-sharing to validate the route
- phase 2 = buying our own car

Full technical details in: [`phase-2-strands-implementation-plan.md`](https://code.amazon.com/packages/SIbagy-Weblab-MCP-docs/blobs/mainline/--/docs/phase-2/phase-2-strands-implementation-plan.md)

Arpit's concerns about control are 100% valid - that's exactly why Phase 2 exists. Phase 1 is explicitly a two-way door for rapid validation.
