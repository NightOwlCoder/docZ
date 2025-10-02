# MCP Weblab Anywhere - Roadmap
**Project**: MCP Weblab Anywhere  
**Date**: September 25, 2025  
**Owner**: Sergio Ibagy  
**Initiative**: MCP Everywhere CCI (Category II)  
**Deadline**: Q1 2026 (P0)

## Executive Summary

This roadmap outlines the path to enable Weblab data access for all Amazon employees through the Model Context Protocol (MCP), not just Weblab team members. Based on comprehensive investigation, the only viable approach is building a Search API microservice behind the Weblab API Gateway.

## Context & Motivation

### MCP Everywhere Initiative
- **Goal**: Standardize GenAI integration across Amazon
- **Timeline**: P0 completion by Q1 2026
- **Scope**: 3,031 high-impact webtools (>100K hits/30 days)
- **Weblab Status**: High-impact webtool, must complete P0
- **SIM**: [P282079924](https://issues.amazon.com/P282079924)
- **CCI Assessment**: [Link](https://quip-amazon.com/JLUDAZv52yL7/2026-Cross-Cutting-Initiatives-MCP-Everywhere-sibagy)

### The Mandate: WSS Must Implement MCP
**WeblabSearchService is MANDATED** for MCP implementation by Q1 2026:
- **125 client dependencies** (Appendix A4 of CCI doc)
- **Cross-organizational usage** (beyond L10)
- **P0 Priority**: Non-negotiable Q1 2026 deadline

### Business Case
- **Current State**: Weblab MCP only works for team members
- **Gap**: Regular users can't query/search Weblab data  
- **Impact**: AI agents can't discover experiments, track history, or automate workflows
- **Solution**: Modernize WSS with MCP interface + expose search functionality
- **Perfect Alignment**: CCI compliance + MCP Weblab Anywhere = same deliverable

## Investigation Findings Summary

### What Doesn't Work for Regular Users ❌
1. **Andes Subscriptions** - Requires user infrastructure (Redshift clusters)
2. **DataCentral Workbench** - Only for Weblab team (`weblab_ro` access)
3. **Athena Approach** - Still requires Andes + AWS account access

### What We Discovered ✅
1. **WeblabSearchService exists** - 125 client dependencies (per MCP CCI doc)
2. **WSTLake has all the data** - Confirmed by Weblab team
3. **Team support** - Livia/Steven open to Search API microservice
4. **Clear architecture path** - API Gateway → Lambda/Fargate → WSS/WSTLake

## Roadmap

### Phase 1: WSS Assessment & Planning (October 2025)
**Timeline**: 2 weeks  
**Owner**: Sergio Ibagy  
**Status**: Ready to start

#### Deliverables:
- [ ] **WSS Current State Assessment**
  - Deep dive with Adam on WSS architecture and issues
  - Document current APIs and capabilities
  - Identify technical debt and modernization needs
  - **Target**: Oct 1, 2025

- [ ] **CCI Requirements Analysis**
  - Review MCP Everywhere compliance requirements
  - Understand IronHide automation options
  - Plan security certification process
  - **Target**: Oct 3, 2025

- [ ] **Technical Requirements Document**
  - Define API contract (OpenAPI spec)
  - Document authentication integration approach
  - Specify hosting decision (Lambda vs Fargate)
  - **Target**: Oct 10, 2025

- [ ] **Project Kick-off**
  - Form working group with Weblab and AmpL teams
  - Establish weekly sync cadence
  - Create project SIM ticket for tracking
  - **Target**: Oct 15, 2025

### Phase 2: WSS MCP Implementation (November 2025)
**Timeline**: 4 weeks  
**Owner**: WSS Team (under kannappa)  
**Status**: Mandate requires execution

#### Deliverables:
- [ ] **MCP Protocol Design**
  - Design MCP interface for WSS APIs
  - Document search functionality for agents
  - Plan authentication integration approach
  - **Target**: Nov 5, 2025

- [ ] **WSS Modernization**
  - Address critical technical debt blocking MCP
  - Implement MCP protocol handler (via IronHide automation)
  - Add agent-friendly search endpoints
  - **Target**: Nov 20, 2025

- [ ] **Testing & Validation**
  - Test MCP interface with sample queries
  - Validate authentication flows (CloudAuth/Midway)
  - Performance testing with agent access patterns
  - **Target**: Nov 25, 2025

- [ ] **Documentation & Registry**
  - Register in MCP Registry
  - Document APIs for AI agent comprehension
  - Create usage examples and patterns
  - **Target**: Nov 30, 2025

### Phase 3: MCP Integration (December 2025)
**Timeline**: 3 weeks  
**Owner**: Sergio Ibagy  
**Status**: Ready to implement once API is available

#### Deliverables:
- [ ] **Update MCP Tools**
  - Replace HTTP bridge approach with API calls
  - Implement `weblab_search` tool
  - Update `weblab_user_experiments` to use Search API
  - **Target**: Dec 10, 2025

- [ ] **Documentation & Examples**
  - Create user guides for Search API
  - Document MCP tool usage patterns
  - Build example queries and workflows
  - **Target**: Dec 15, 2025

- [ ] **Integration Testing**
  - Test with Q CLI and Cline
  - Validate all search scenarios
  - Performance testing with multiple users
  - **Target**: Dec 20, 2025

### Phase 4: Launch & Adoption (January 2026)
**Timeline**: 4 weeks  
**Owner**: Weblab + Applied AI teams  
**Status**: MCP Everywhere P0 deadline

#### Deliverables:
- [ ] **Production Launch**
  - Deploy Search API to production
  - Enable MCP tools in amzn-mcp-local server
  - Monitor initial usage patterns
  - **Target**: Jan 5, 2026

- [ ] **User Onboarding**
  - Create setup guides for users
  - Host demo sessions
  - Support early adopters
  - **Target**: Jan 15, 2026

- [ ] **MCP Everywhere Compliance**
  - Document completion for CCI tracking
  - Submit compliance evidence
  - Participate in program reporting
  - **Target**: Jan 31, 2026 (P0 Deadline)

## Technical Architecture

### Current State
```
✅ Working for Weblab Team:
User → MCP Tool → API Gateway → Weblab API → Response

❌ Broken for Regular Users:
User → MCP Tool → Andes → [Permission Denied]
```

### Target State
```
✅ Working for Everyone:
User → MCP Tool → API Gateway → Search Service → WSS/WSTLake → Response
                       ↑              ↑
                (Existing auth)  (New service)
```

### Proposed Search API Endpoints

```typescript
// Basic search by owner
GET /sso/experiments/search?owner={alias}&limit={n}

// Advanced search with filters
POST /sso/experiments/search
{
  "filters": {
    "owner": ["alias1", "alias2"],
    "date_range": {"start": "2025-01-01", "end": "2025-12-31"},
    "realm": "PILOT",
    "status": "ACTIVE",
    "title_contains": "checkout"
  },
  "sort": {"field": "created", "order": "desc"},
  "limit": 100,
  "offset": 0
}
```

## Resource Requirements

### Team Structure
- **Project Owner**: Sergio Ibagy (MCP Weblab Anywhere)
- **Skip Manager**: kannappa (WSS owner)
- **Virtual Team**: WSS development team
- **WSS Expert**: Adam (longest-serving Weblab member with WSS knowledge)
- **Applied AI Support**: MCP Everywhere CCI resources

### Effort Estimates
- **WSS MCP Implementation**: 8-12 SDE weeks (WSS team)
- **MCP Tool Integration**: 2-3 SDE weeks (Sergio)
- **Testing & Documentation**: 3-4 SDE weeks (shared)
- **Total Effort**: ~13-19 SDE weeks

### Dependencies
- **Critical**: WSS team commitment to modernize service for MCP compliance
- **Critical**: Adam's expertise for WSS architecture understanding
- **Medium**: CCI automation tools (IronHide) for boilerplate
- **Low**: MCP registry integration

## Success Metrics

### P0 Success Criteria (Q1 2026)
- [ ] Search API available in production
- [ ] MCP tools can query any user's experiments
- [ ] Basic search functionality working (owner, date, status filters)
- [ ] Authentication working for all Amazon employees
- [ ] Documented and accessible to MCP users

### P1 Success Criteria (Q3 2026)
- [ ] Advanced search features (text search, complex filters)
- [ ] Query optimization and caching
- [ ] Integration with other Weblab data sources
- [ ] Analytics on search usage patterns
- [ ] Self-service onboarding for new users

## Risk Assessment & Mitigation

### High Risk: Weblab Team Resource Allocation
- **Risk**: Weblab team may not prioritize Search API development
- **Impact**: Project failure, missed P0 deadline
- **Mitigation**: 
  - Position as MCP Everywhere compliance requirement
  - Highlight business value for Weblab users
  - Offer Applied AI support for implementation

### Medium Risk: WSS Access Complexity
- **Risk**: WeblabSearchService integration more complex than expected
- **Impact**: Timeline delays, architecture changes
- **Mitigation**:
  - Start with direct WSTLake approach as backup
  - Parallel evaluation of both approaches
  - Early AmpL team engagement

### Low Risk: Authentication Integration
- **Risk**: API Gateway auth integration challenges
- **Impact**: Development delays
- **Mitigation**: 
  - Follow existing Weblab API patterns
  - Keith's expertise available
  - Well-documented authentication flows

## Communication Plan

### Internal Stakeholders
- **Weekly syncs** with Weblab team (starting Oct 1)
- **Bi-weekly updates** to MCP Everywhere program
- **Monthly demos** to Applied AI leadership
- **Quarterly reviews** with broader Weblab community

### External Communication
- **Q CLI community**: Demo new search capabilities
- **MCP developer community**: Documentation and examples
- **Amazon AI community**: Success stories and learnings

## Next Actions (Immediate)

### This Week (Sep 25-30)
1. **Schedule stakeholder meeting** with Livia Stanley and Steven Guo
2. **Review WSS package** (code.amazon.com/packages/WeblabSearchService)
3. **Draft formal proposal** for Search API development
4. **Create project SIM** ticket for tracking

### Week of Sep 30
1. **Present findings** to Weblab team
2. **Get resource commitment** for Search API development
3. **Define technical approach** (WSS wrapper vs WSTLake direct)
4. **Set up working group** and sync cadence

### Week of Oct 7
1. **Engage AmpL team** for WSS/WSTLake access
2. **Begin API design** and technical specifications
3. **Plan MVP scope** and timeline
4. **Set up project tracking** and reporting

## Key Insights from MCP CCI Document

### WSS is Mandated for MCP (P0)
- **Appendix A4**: WeblabSearchService with 125 client dependencies
- **Owner**: kannappa (skip manager)
- **Status**: Must complete MCP implementation by Q1 2026
- **Reality**: WSS is "terrible service" that needs modernization anyway

### CCI Resources Available
1. **IronHide Automation** - Can automate MCP protocol boilerplate
2. **CCI Support Team** - Available for implementation guidance
3. **Security Automation** - Cataphract for faster security reviews
4. **Program Tracking** - Built-in reporting and compliance mechanisms

## Alternative Scenarios

### Scenario A: Minimal Compliance Approach
- **If**: Focus only on CCI requirement checklist
- **Then**: Basic MCP interface without search optimization
- **Risk**: Misses MCP Weblab Anywhere business value

### Scenario B: Full Modernization (Recommended)
- **If**: Use mandate as opportunity to modernize WSS
- **Then**: MCP + improved architecture + search functionality
- **Benefit**: Solves CCI compliance + business needs + technical debt

### Scenario C: WSS Too Complex to Modernize
- **If**: WSS technical debt makes MCP implementation prohibitive
- **Then**: Build new search service, deprecate WSS gradually
- **Approach**: Fresh implementation with MCP-first design

## Success Definition

### Minimum Viable Product (P0)
A regular Amazon employee can use Q CLI or Cline to ask:
- "Show me my active weblabs"
- "Find experiments owned by my team"
- "List experiments modified this week"

And receive accurate, up-to-date results without requiring Weblab team membership or infrastructure setup.

### Long-term Vision (P1+)
Complete AI-powered Weblab workflow automation:
- Experiment discovery and analysis
- Automated reporting and insights
- Cross-team collaboration and data sharing
- Integration with other Amazon data sources

---

## Conclusion

The roadmap is aggressive but achievable with proper stakeholder alignment. The key insight from our investigation is that building a Search API microservice is the only viable path for regular users. The discovery that WeblabSearchService already exists and has 125 client dependencies suggests there's both capability and demand for this functionality.

Success depends on:
1. **Weblab team commitment** to build the Search API
2. **AmpL team support** for WSS/WSTLake integration
3. **Timeline discipline** to meet Q1 2026 MCP Everywhere deadline

The project aligns perfectly with the MCP Everywhere initiative and positions Weblab as a leading example of successful MCP integration for high-impact webtools.

## References

- [MCP Everywhere CCI Assessment](https://quip-amazon.com/JLUDAZv52yL7/2026-Cross-Cutting-Initiatives-MCP-Everywhere-sibagy)
- [Investigation Findings](docs/weblab-mcp/weblab-data-access-investigation-findings.md)
- [WSS Team Discussion](docs/threads/livia-steven-wss-thread.md)
- [Working Backwards Document](https://quip-amazon.com/maowAvtplLmZ/Working-Backwards-Weblab-MCP-Integration)
- [WeblabSearchService Package](https://code.amazon.com/packages/WeblabSearchService)

---

*Roadmap Version: 1.0*  
*Last Updated: September 25, 2025*  
*Next Review: October 1, 2025*
