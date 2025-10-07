# Weblab Data Access Investigation Findings
**Project**: MCP Weblab Anywhere  
**Date**: September 25, 2025  
**Author**: Sergio Ibagy (Project Owner)  
**Status**: Investigation Complete - Roadmap Planning Phase

## Executive Summary

This document summarizes our comprehensive investigation into enabling Weblab data access for regular MCP users (non-Weblab team members). Our findings reveal that all current approaches (Andes subscriptions, DataCentral Workbench, Athena) require significant infrastructure that regular users don't have access to. The recommended path forward is to build a Search API microservice behind the Weblab API Gateway.

## Context: MCP Everywhere Initiative

Weblab MCP is part of the broader **MCP Everywhere** initiative (Category II CCI for 2026):
- **Goal**: Standardize GenAI integration across Amazon via Model Context Protocol
- **Timeline**: High-impact services must complete MCP implementation by Q1 2026
- **Impact**: 3,031 Amazon Webtools (>100K hits/30 days) prioritized as P0
- **SIM**: [P282079924](https://issues.amazon.com/P282079924)
- **Assessment**: [Link](https://quip-amazon.com/uQxCAfeS0IIs/2026-Cross-Cutting-Initiatives-MCP-Everywhere)
- **Wiki**: [MCP CCI Planning](https://w.amazon.com/bin/view/ECommerceFoundation/Cross_Cutting_Projects/2026Planning/Finalized_Stores_CCI_2026_List/#HCCI-CategoryII5BMustdo2Cbutimpactsasmallnumberofteams-SomeStoresteamsmustplanforthisinOP15D)

## Investigation Findings

### 1. Andes/Subscription Model Analysis ❌

#### What We Discovered
The Andes permission model requires a two-step process that doesn't scale for regular users:

1. **CreateAccessRequest** - Grants permission to see the dataset
2. **CreateSubscription** - Actually gives you access to query the data

#### Why It Fails for Regular Users
- **Infrastructure Requirements**: Users need their own Redshift cluster or data target
- **Subscription Management**: Each user would need to manage their own subscriptions
- **Cost**: Running Redshift clusters for individual users is expensive
- **Complexity**: Too many steps for simple data access

#### Key Insight
From our testing:
```
ERROR: "CreateAccessRequest alone doesn't give you data access - 
you also need CreateSubscription to a Redshift cluster"
```

**Verdict**: The subscription model is designed for teams copying data to their own infrastructure, not for individual users querying existing data.

### 2. DataCentral Workbench Analysis ❌

#### Current State
- **Database**: Wstlake (ID: `0b41fd5a-a113-442a-a6e7-6158506a204a`)
- **User**: `weblab_ro` (read-only access)
- **Schemas**: 18 schemas, 520+ tables

#### Why It Works for Weblab Team
- Pre-existing subscriptions managed by the team
- Shared infrastructure (Wstlake cluster)
- Team members have `weblab_ro` access

#### Why It Fails for Regular Users
- No access to Wstlake without being on the Weblab team
- Can't grant `weblab_ro` permissions to all Amazon employees
- No mechanism for user-level permission management

**Verdict**: Only viable for Weblab team members with existing infrastructure access.

### 3. Athena Approach Analysis ❌

Source: [Athena Access Script](docs/case-studies/weblab-data-through-athena/)

#### Requirements
1. **Andes 3.0 Subscription** - Same subscription problem
2. **AWS Account Access** - Account 199193740904 (Weblab team account)
3. **IAM Role** - IibsAdminAccess-DO-NOT-DELETE
4. **Internal Auth** - Midway (`mwinit`) and ADA credentials
5. **Infrastructure** - S3 buckets, Glue catalog integration

#### Why It Fails for Regular Users
- Still requires Andes subscriptions
- Needs access to specific AWS account
- Requires internal authentication tools
- Complex setup process

**Verdict**: The Athena approach is just another way to access the same restricted infrastructure.

### 4. WeblabSearchService (WSS) Discovery ✅

Source: [WSS Thread with Livia Stanley and Steven Guo](docs/threads/livia-steven-wss-thread.md)

#### Key Findings
1. **WeblabSearchService Exists**
   - Located in MAWS
   - Owned by AmpL team (Arpit and team under YJ)
   - NOT currently exposed via Weblab API Gateway
   - Only accessible via CloudAuth

2. **WSTLake Contains All Data**
   - Livia confirms: "Yes I think a lot of those questions can be answered from WSTLake tables"
   - This is the same data source we've been trying to access

3. **Team Support for API Solution**
   - Livia: "Maybe we could create a new API micro service... behind the Weblab API Gateway"
   - Steven: "consider creating a wrapper around WeblabSearchService with a fargate or lambda"

## Architecture Comparison

### Current Failed Approaches

```
User → Andes Subscription → Create Redshift Cluster → Query Data
         ↑                           ↑
    (Requires approval)      (User infrastructure)
    
User → Athena → AWS Account → Andes Tables
         ↑            ↑
    (Needs IAM)  (Team account only)
```

### Recommended Solution

```
User → MCP Tool → Weblab API Gateway → Search Microservice → WSTLake/WSS
                         ↑                      ↑
                  (Existing auth)        (Hosted by Weblab team)
```

## Recommended Path Forward

### Build a Search API Microservice

#### Architecture
- New microservice behind Weblab API Gateway
- Queries WSTLake or wraps WeblabSearchService
- Uses existing authentication (Midway + API keys)
- No user infrastructure required

#### Benefits
- ✅ **For Users**: Simple API calls, no infrastructure setup
- ✅ **For Weblab Team**: Controlled access, optimized queries
- ✅ **For Security**: Leverages existing auth layers
- ✅ **For Maintenance**: Single service, not per-user setups

#### Implementation Options

1. **Option A: WSS Wrapper**
   ```
   API Gateway → Lambda/Fargate → WeblabSearchService → Response
   ```

2. **Option B: Direct WSTLake Query**
   ```
   API Gateway → Lambda/Fargate → WSTLake → Response
   ```

3. **Option C: Hybrid Approach**
   - Use WSS for complex searches
   - Direct WSTLake for simple queries

### Proposed API Endpoints

```typescript
// Search experiments by owner
GET /sso/experiments/search?owner={alias}

// Search by date range
GET /sso/experiments/search?start_date={date}&end_date={date}

// Search by realm/status
GET /sso/experiments/search?realm={realm}&status={status}

// Search by title/description
GET /sso/experiments/search?q={search_term}

// Complex query support
POST /sso/experiments/search
{
  "filters": {
    "owner": ["alias1", "alias2"],
    "date_range": { "start": "2025-01-01", "end": "2025-12-31" },
    "realm": "PILOT",
    "status": "ACTIVE"
  },
  "limit": 100,
  "offset": 0
}
```

## Alternative Approaches (Not Recommended)

### 1. Proxy Service
- Build backend service with central Andes/Athena setup
- Complexity of managing permissions at service level
- **Verdict**: More complex than API approach

### 2. Data Export/Cache
- Periodically export to simpler storage
- **Trade-off**: Not real-time
- **Verdict**: Could work but adds data staleness

### 3. Expand Existing APIs
- Add search to existing endpoints
- **Challenge**: Requires significant API redesign
- **Verdict**: Less flexible than dedicated search service

## Next Steps

### Immediate Actions
1. **Draft formal proposal** for Search API microservice
2. **Schedule meeting** with Livia Stanley and Steven Guo
3. **Get buy-in** from AmpL team (Arpit)
4. **Define MVP scope** for Q1 2026 deadline

### Technical Requirements
1. **Define API contract** (OpenAPI spec)
2. **Determine hosting** (Lambda vs Fargate)
3. **Plan authentication** integration
4. **Design query optimization** strategy

### Timeline Alignment
- **Q1 2026**: MCP Everywhere P0 deadline
- **Q3 2026**: P1 completion target
- Weblab as high-impact tool must be P0

## Stakeholders

- **Weblab Team**: Livia Stanley, Steven Guo, Keith (API support)
- **AmpL Team**: Arpit (WSS/WSTLake owner), YJ (VP)
- **MCP Everywhere**: Rama Malka (Program Owner), Jeetu Mirchandani (Tech VP)
- **Our Team**: Sergio Ibagy (Project Owner)

## Conclusion

After extensive investigation, it's clear that all database-direct approaches (Andes, Athena, DataCentral) require infrastructure that regular users don't have. The only viable solution is to build a Search API microservice that:

1. Lives behind the existing Weblab API Gateway
2. Uses existing authentication mechanisms
3. Queries WSTLake/WSS on behalf of users
4. Returns data in a simple, consumable format

This approach aligns with the MCP Everywhere initiative's goal of standardizing AI agent access to Amazon services and can be delivered by the Q1 2026 deadline.

## References

- [Working Backwards: Weblab MCP Integration](https://quip-amazon.com/maowAvtplLmZ/Working-Backwards-Weblab-MCP-Integration)
- [MCP Everywhere Assessment](https://quip-amazon.com/uQxCAfeS0IIs/2026-Cross-Cutting-Initiatives-MCP-Everywhere)
- [WeblabSearchService Package](https://code.amazon.com/packages/WeblabSearchService)
- [Weblab API Gateway Docs](https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI)
- [WSTLake Wiki](https://w.amazon.com/bin/view/Weblab/Wstlake/)

---

*Document Version: 1.0*  
*Last Updated: September 25, 2025*
