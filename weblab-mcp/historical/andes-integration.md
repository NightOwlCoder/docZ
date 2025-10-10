# Andes MCP Integration - Complete Documentation

**Date**: 9/24/2025  
**Status**: Comprehensive Analysis Complete
**Document**: Consolidation of all Andes integration findings from 6 source documents

## Table of Contents

1. [Overview](#overview)
2. [Architecture and Limitations](#architecture-and-limitations)
3. [Weblab Data Discovery](#weblab-data-discovery)
4. [Working Workflows](#working-workflows)
5. [Failed Attempts](#failed-attempts)
6. [Permission System](#permission-system)
7. [Path Resolution](#path-resolution)
8. [Testing Results](#testing-results)
9. [Implementation Guide](#implementation-guide)
10. [Lessons Learned](#lessons-learned)

---

## Overview

This document consolidates all findings from the Andes MCP integration investigation for Weblab data access. The investigation revealed that while direct server-to-server MCP communication is not possible, Andes MCP provides powerful SQL access to Weblab data through DataCentral Workbench.

### Key Discoveries

- **2,397 Weblab datasets** available in Andes catalog
- **Direct SQL access** to WSTLake Redshift cluster confirmed
- **Auto-approval** configured for most WEBLAB_DDL tables
- **MCP architecture limitation**: Servers cannot spawn other servers
- **Path differences** are due to catalog vs subscription schemas, not translation

---

## Architecture and Solutions

### MCP Server Architecture

MCP is designed for AI-to-server communication, not server-to-server. However, we discovered a working solution using HTTP bridge.

#### Option 1: Direct AI Orchestration (Recommended for most cases)
```
User Query → AI Agent
              ├→ Calls Weblab MCP tools (for API data)
              └→ Calls Andes MCP tools (for SQL data)
              → AI combines results
```

#### Option 2: HTTP Bridge (Working Solution)
```
User → AI → Weblab MCP → HTTP Bridge → andes-mcp
                ↑                           ↓
                └──── HTTP Response ────────┘
```

Our HTTP bridge (`andes-http-bridge.js`) successfully wraps andes-mcp in an HTTP server, avoiding the stdin/stdout deadlock issue.

### What Doesn't Work (Direct Spawning)

```
User → AI → Weblab MCP → (direct spawn) → andes-mcp
           ↑                                   ↓
           └──────────── DEADLOCK ─────────────┘
```

### Architectural Findings

1. **Direct subprocess spawning fails**: MCP servers cannot directly spawn other MCP servers via stdin/stdout
2. **HTTP Bridge works**: Wrapping andes-mcp in HTTP server avoids deadlock
3. **The AI can orchestrate**: Each server can be called independently
4. **Direct Redshift access fails**: AWS CLI requires AWS_PROFILE setup

### Working Components

- **Weblab API tools**: `weblab_details`, `weblab_allocations`, `weblab_activation_history`
- **Direct andes-mcp usage**: Works when called directly by AI agent
- **HTTP Bridge approach**: Successfully implemented in `weblab-user-experiments.ts`
- **DataCentral Workbench**: Provides SQL access to Weblab data

---

## Weblab Data Discovery

### Dataset Statistics

- **Total Weblab datasets**: 2,397 in Andes catalog
- **Provider**: WEBLAB_DDL
- **Provider ID**: weblab
- **Database**: Wstlake (ID: `0b41fd5a-a113-442a-a6e7-6158506a204a`)
- **User**: weblab_ro (read-only access)
- **Total Schemas**: 18 schemas, 520+ tables

### Available Schemas and Tables

#### Main Schema: `wst` (Weblab Science Team)

| Table | Description | Partition Keys | Status |
|-------|-------------|----------------|--------|
| `weblab_metadata` | Core experiment metadata | None | Tested & Working |
| `activation_events` | Experiment activation history | weblab, activation_timestamp | Available |
| `launch_criteria` | Launch requirements | weblab | Available |
| `weblab_details` | Detailed configurations | None | Available |
| `weblab_launches` | Launch history | None | Available |
| `weblab_state_history` | State change tracking | None | Available |
| `weblab_state_history_details` | Detailed state transitions | None | Available |
| `primary_metrics` | Primary experiment metrics | None | Available |

#### Analytics Schema: `waba` (Weblab Analytics)

| Table | Description | Purpose |
|-------|-------------|---------|
| `wla_experiments` | Comprehensive experiment data | Full details |
| `wla_activation_events` | Detailed activation tracking | Timeline |
| `wla_launch_decisions` | Launch decision history | Decisions |
| `wla_experiment_events` | All experiment events | Events |
| `wla_observers` | Experiment monitoring | Stakeholders |
| `wla_launch_criteria` | Launch criteria definitions | Requirements |
| `wla_domains` | Domain configurations | Settings |
| `wla_marketplaces` | Marketplace configurations | Regional |

#### Aggregation Schema: `weblab_ddl`

| Table | Description | Purpose |
|-------|-------------|---------|
| `daily_aggregated_customer_triggers` | Daily trigger counts | Monitoring |
| `daily_aggregated_session_triggers` | Session aggregations | Tracking |

### WEBLAB_DDL Provider Tables (Andes Catalog)

Auto-approved tables accessible to all Amazon employees:

| Table | Columns | Purpose |
|-------|---------|---------|
| `ACTIVATION_EVENTS` | - | Weblab activation history |
| `weblab_metadata` | - | Core experiment metadata |
| `experiment_experiences` | - | User experience assignments |
| `experiment_decisions` | - | Experiment decisions |
| `weblab_rollups` | - | Aggregated metrics |
| `weblab_analysis_results` | 74 columns | Complete statistical results |
| `launch_criteria` | - | Launch conditions |
| `long_running_weblabs` | - | Long-running experiments |
| `weblab_metrics` | - | Experiment metrics |
| `launch_criteria_evaluations` | - | Criteria evaluation results |

---

## Working Workflows

### Complete Workflow for Data Access

#### Step 1: Load Andes Context
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "LoadAndesContext",
  arguments: {}
})
```
Result: Andes expertise activated

#### Step 2: Search for Datasets
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "SearchDatasets",
  arguments: {
    query: "weblab",
    limit: 10
  }
})
```
Result: Found 2,394 Weblab datasets

#### Step 3: Generate SQL from Natural Language
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "GenerateAndesSqlQuery",
  arguments: {
    userQuery: "What are my weblabs? Show me all experiments where I am owner. My alias is sibagy"
  }
})
```
Result: SQL Generated with Andes catalog paths

#### Step 4: Get WEBLAB_DDL Provider (Optional)
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "ReadProviders",
  arguments: {
    operation: "GetProviderByName",
    providerName: "WEBLAB_DDL"
  }
})
```
Result: Provider ID `weblab` confirmed

#### Step 5: List Available Databases
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "get_databases"
  }
})
```
Result: Found Wstlake, SIMReporting, Andes databases

#### Step 6: Get Database Users
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "get_users_for_database",
    databaseId: "0b41fd5a-a113-442a-a6e7-6158506a204a"
  }
})
```
Result: Found `weblab_ro` read-only user

#### Step 7: Create Database Connection
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "create_connection",
    databaseId: "0b41fd5a-a113-442a-a6e7-6158506a204a",
    dbUserId: "weblab_ro"
  }
})
```
Result: Connection ID returned

#### Step 8: Get Database Catalog (Optional)
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "get_catalog",
    databaseId: "0b41fd5a-a113-442a-a6e7-6158506a204a",
    dbUserId: "weblab_ro",
    connectionId: "connection_id"
  }
})
```
Result: Found 18 schemas, 520+ tables

#### Step 9: Execute Query
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "execute_query",
    connectionId: "connection_id",
    sql: "SELECT * FROM weblab.wst.weblab_metadata WHERE primary_owner = 'sibagy'",
    recordLimit: 100
  }
})
```
Result: Query execution ID returned

#### Step 10: Get Query Results
```javascript
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "get_query_result_url",
    executionId: "execution_id"
  }
})
```
Result: Actual data retrieved

### Quick Access Workflow (3 Steps)

When you already know what you're looking for:

```javascript
// Step 1: Generate SQL
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "GenerateAndesSqlQuery",
  arguments: {
    userQuery: "Show me all my weblabs. My alias is sibagy"
  }
})

// Step 2: Create Connection & Execute
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "create_connection",
    databaseId: "0b41fd5a-a113-442a-a6e7-6158506a204a",
    dbUserId: "weblab_ro"
  }
})
// Returns connection ID

use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "execute_query",
    connectionId: "YOUR_CONNECTION_ID",
    sql: "SELECT weblab, title, created FROM weblab.wst.weblab_metadata WHERE primary_owner = 'sibagy' LIMIT 10"
  }
})

// Step 3: Get Results
use_mcp_tool({
  server_name: "andes-mcp",
  tool_name: "DataCentralWorkbench",
  arguments: {
    operation: "get_query_result_url",
    executionId: "YOUR_EXECUTION_ID"
  }
})
```

---

## Implementation Approaches

### Successful Approach: HTTP Bridge

**Status**: **WORKING**

**Files Created**:
- `andes-http-bridge.js` - HTTP server wrapping andes-mcp
- `weblab-user-experiments.ts` - Successfully uses HTTP bridge to execute queries

**How It Works**:
1. Spawns andes-mcp as a subprocess with HTTP wrapper
2. Communicates via HTTP requests instead of stdin/stdout
3. Avoids the MCP nested context deadlock issue
4. Successfully retrieves Weblab data from Andes

**Current Limitation**:
- Only works for Weblab team members using `weblab_ro` user
- Non-team members need CreateAccessRequest for permissions (to be implemented)

### Failed Attempt 1: Direct Subprocess Spawning

**Approach**: Spawn andes-mcp as persistent subprocess and communicate via stdin/stdout

**Files Created**:
- `andes-mcp-client.ts` - AndesMcpClient class with subprocess management

**Why It Failed**:
- Direct stdin/stdout communication creates deadlocks in nested MCP context
- The pipes don't work as expected when MCP server spawns another MCP server

### Failed Attempt 2: Delegation Pattern

**Approach**: Return SQL queries and instructions for AI to execute

**Files Created**:
- `weblab-andes-search.ts` - Returns delegation instructions
- `weblab-andes-objectives.ts` - Placeholder returning instructions

**Why It Failed**:
- Exposes SQL queries to the LLM (security/reliability concern)
- Requires complex coordination by the AI
- Not a clean user experience

---

## Permission System

### Access Policy Details

**Policy Name**: `Dataset_WEBLAB_DDL_ACTIVATION_EVENTS_and_more`  
**Rule**: Auto-approval for ALL access requests  
**URL**: https://datacentral.a2z.com/access-policies/Dataset_WEBLAB_DDL_ACTIVATION_EVENTS_and_more/versions/1

### Access Scenarios

#### Scenario 1: Weblab Team Members
- Use existing `weblab_ro` user with Wstlake database
- Direct access to pre-subscribed data in Wstlake
- No additional permissions needed

#### Scenario 2: Non-Weblab Team Members (Auto-Approved Tables)
- Use `CreateAccessRequest` - gets instant approval
- Create subscription to their Redshift cluster
- Query using their team's credentials
- No waiting for manual approval

#### Scenario 3: Protected Data (Manual Approval Required)
- Must use `CreateAccessRequest`
- Wait for owner approval (could take time)
- Create subscription after approval
- Query using appropriate credentials

### Key Permission Tools

- `CreateAccessRequest` - Request dataset access
- `ListAccessRequests` - Check request status
- `ManageAccessRequest` - Approve/reject (for owners)
- `CreateSubscription` - Subscribe to approved datasets

### The Correct Permission Workflow

From APM Demo Transcript:

1. **Search for datasets**: "Search for datasets that have live events metadata"
2. **Create access request**: "I want to get access for this table on my midway ID"
   - Creates access request
   - Returns request ID
   - User gets email notification
3. **Wait for approval**: "the owner needs to authorize"
   - Dataset owner must approve
   - Without approval, queries fail
4. **Create subscription**: "Subscribe this table to my redshift cluster using data share"
   - Lists available Redshift clusters
   - Creates subscription to make data available
5. **Query the data**: Once approved and subscribed, can query using generated SQL

---

## Path Resolution

### Understanding Path Differences

The different paths represent different access methods, NOT a translation issue:

#### Andes Catalog Paths
- Format: `"andes"."PROVIDER"."table_name"`
- Example: `"andes"."WEBLAB_DDL"."weblab_metadata"`
- Requires: IAM authentication or proper access requests
- Purpose: Direct catalog reference
- Error when accessed without permissions: "Current user is not authenticated with IAM credentials"

#### Redshift Schema Paths
- Format: `"schema"."subschema"."table_name"`
- Example: `"weblab"."wst"."weblab_metadata"`
- Requires: Database user (e.g., weblab_ro)
- Purpose: Local subscription copy in Redshift

### Why Queries Fail

When querying Andes catalog paths directly:
```
ERROR: Current user is not authenticated with IAM credentials
```

This means: **You don't have permission to access this Andes dataset directly. You need to request access first!**

### The Truth About Path "Translation"

There is NO path translation! The different paths exist because:
- `"andes"."PROVIDER"."table"` - The Andes catalog reference
- `"schema"."table"` in Redshift - Your subscription's local copy

When you create a subscription, Andes creates a LOCAL COPY in your Redshift cluster with its own schema path.

---

## Testing Results

### Successfully Retrieved Data

Test executed on 9/23/2025, retrieving live experiment data:

| Experiment ID | Title | Owner | Created |
|---------------|-------|-------|---------|
| VPS_REJECT_DF_FLAT_PO_INVOICES_1313553 | Reject dropship flat PO invoices | shaaneha | 2025-09-22 11:57:35 |
| ACCS_TIEREDPRICING_VIEWS_DUB_ZAZ_TRAFFIC_SWITCH_1313552 | Traffic switch from DUB to ZAZ | navendj | 2025-09-22 11:53:31 |
| RTP_FMA_MIGRATION_1313551 | RTP_FMA_MIGRATION | venkatnx | 2025-09-22 11:47:56 |
| AUTHX_HZ_MIGRATION_CLAIMUI_BATCH_OCT_1313549 | HZ MIGRATION FOR /ap/samlexception | ptalele | 2025-09-22 11:44:24 |
| A2I_PRIME_ONRAMP_SINGLE_PLAN_UPSELL_SLASH_PRIME_GATING_WEBLAB_1313548 | A2I_PRIME_ONRAMP... | ayushida | 2025-09-22 11:41:19 |

Additional experiments found for user sibagy:

| Experiment ID | Title | Owner | Created |
|---------------|-------|-------|---------|
| WEBLAB_MOBILE_TESTAPP_CUSTOMER_1299775 | Weblab Mobile Testapp Customer | renatopm | 2025-08-25 22:56:43 |
| WEBLAB_MOBILE_TESTAPP_SESSION_1299744 | Weblab Mobile Testapp Session | renatopm | 2025-08-25 22:15:33 |
| SIBAGY_EXPOSURE_TEST_879608 | Testing Exposure Control | renatopm | 2024-02-04 19:39:57 |
| SIBAGY_879607 | Exposure Control Test | renatopm | 2024-02-04 19:38:19 |
| SIBAGY_TEST_698984 | Sibagy's test weblab | renatopm | 2023-06-05 16:20:00 |
| MBM_AUTOMATION_140447 | User acceptance tests for Mobile Weblab Client | sibagy | 2018-02-23 09:11:38 |

### Working SQL Queries

#### Get Your Experiments
```sql
SELECT weblab, title, created 
FROM "weblab"."wst"."weblab_metadata" 
WHERE primary_owner = 'YOUR_ALIAS' OR created_by = 'YOUR_ALIAS'
ORDER BY created DESC;
```

#### Recent Team Experiments
```sql
SELECT weblab, title, primary_owner, created
FROM "weblab"."wst"."weblab_metadata" 
WHERE created >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY created DESC LIMIT 20;
```

#### Experiments with Activations
```sql
SELECT m.weblab, m.title, m.primary_owner, 
       a.activation_timestamp, a.allocation_percentage
FROM "weblab"."wst"."weblab_metadata" m
JOIN "weblab"."wst"."activation_events" a ON m.weblab = a.weblab
WHERE m.primary_owner = 'YOUR_ALIAS'
ORDER BY a.activation_timestamp DESC LIMIT 10;
```

#### Cross-Schema Comprehensive Analysis
```sql
SELECT 
    m.weblab,
    m.title,
    m.primary_owner,
    m.created,
    a.marketplace_id,
    a.allocation_percentage,
    d.launch_decision
FROM "weblab"."wst"."weblab_metadata" m
LEFT JOIN "weblab"."wst"."activation_events" a ON m.weblab = a.weblab
LEFT JOIN "weblab"."waba"."wla_launch_decisions" d ON m.weblab = d.experiment_id
WHERE m.created >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY m.created DESC;
```

#### Natural Language Queries That Work

**"What are my weblabs?"**
```javascript
GenerateAndesSqlQuery({
  userQuery: "What are my weblabs? My alias is YOUR_ALIAS"
})
// Generates: SELECT * FROM weblab_metadata WHERE primary_owner = 'YOUR_ALIAS'
```

**"Show me recent experiments from my team"**
```javascript
GenerateAndesSqlQuery({
  userQuery: "Show me experiments created in the last 30 days"
})
// Generates appropriate date-filtered query
```

**"Find experiments with specific keywords"**
```javascript
GenerateAndesSqlQuery({
  userQuery: "Find all experiments with 'checkout' in the title"
})
// Generates: SELECT * FROM weblab_metadata WHERE title LIKE '%checkout%'
```

---

## Implementation Guide

### Installation

```bash
# Install Andes MCP Server
q config add-mcp-server andes \
  --command "npx" \
  --args "@amazon-q/andes-mcp-server" \
  --env "ANDES_API_ENDPOINT=https://andes.amazon.com"
```

### HTTP Bridge Implementation

For integrated Weblab-to-Andes access, we have a working HTTP bridge solution:

**Files**:
- `amazon-internal-mcp-server/src/AmazonInternalMCPServer/src/tools/weblab/andes-http-bridge.js` - HTTP wrapper for andes-mcp
- `amazon-internal-mcp-server/src/AmazonInternalMCPServer/src/tools/weblab/weblab-user-experiments.ts` - Tool using the bridge

**How to Use**:
```javascript
// The weblab_user_experiments tool handles all the complexity
// It follows the full 9-step sequence internally
{
  name: "weblab_user_experiments",
  arguments: {
    owner: "sibagy",  // User alias to search for
    limit: 10         // Number of results
  }
}
```

**Current Capabilities**:
- Works for Weblab team members (uses `weblab_ro` user)
- ⚠️ Non-team members need CreateAccessRequest (to be implemented)

### Testing Commands

#### Direct andes-mcp testing
```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 1}' | andes-mcp
```

#### Test Weblab API tools
```bash
export WEBLAB_ENVIRONMENT=PROD
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "WEBLAB_MOBILE_TESTAPP_SESSION_1299744"}}, "id": 1}' | npm start
```

#### Test HTTP Bridge Tool
```bash
export WEBLAB_ENVIRONMENT=PROD
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_user_experiments", "arguments": {"owner": "sibagy", "limit": 5}}, "id": 1}' | npm start
```

### Known Database IDs

- **Wstlake**: `0b41fd5a-a113-442a-a6e7-6158506a204a`
- **SIMReporting**: `39ac3f66-4dc2-416f-a659-f7a0a6c1985f`
- **Andes - Workbench**: `Andes` (no users available)

### Known Users

- **Weblab Read-Only**: `weblab_ro`

### Connection Details

**Database**: Wstlake  
- **Database ID**: `0b41fd5a-a113-442a-a6e7-6158506a204a`
- **User**: `weblab_ro` (read-only access)
- **Connection Type**: SECRET authentication
- **Data Classification**: Highly Confidential
- **Total Schemas**: 18 schemas, 520+ tables

---

## Lessons Learned

### Technical Lessons

1. **MCP is for AI-to-Server communication**
   - Not designed for direct server-to-server
   - AI agent can orchestrate OR use HTTP bridge

2. **HTTP Bridge solves subprocess issues**
   - Wrapping MCP server in HTTP avoids stdin/stdout deadlocks
   - Successfully implemented and working in production
   - Proves server-to-server communication is possible with right approach

3. **Permissions are the real challenge**
   - Most failures are permission-related, not technical
   - Auto-approval exists for most WEBLAB_DDL tables
   - `weblab_ro` works for Weblab team members
   - Non-team members need CreateAccessRequest workflow

4. **Path differences are by design**
   - Catalog paths vs subscription schemas
   - Not a translation issue
   - Different access methods for different scenarios

### Process Lessons

1. **Try different communication patterns**
   - Direct stdin/stdout failed
   - HTTP bridge succeeded
   - Architecture constraints can be worked around

2. **Start with simple tests**
   - Test individual components first
   - Build complexity gradually
   - Verify permissions before debugging code

3. **Question assumptions**
   - "Server-to-server impossible" was incorrect
   - HTTP bridge provides viable workaround
   - Permission issues often mistaken for technical failures

### Strategic Lessons

1. **Multiple approaches work**
   - Direct AI orchestration for simplicity
   - HTTP bridge for integrated solution
   - Both are valid depending on use case

2. **Leverage existing infrastructure**
   - Use DataCentral Workbench
   - Utilize pre-configured subscriptions
   - Build on auto-approval policies

3. **Focus on user value**
   - Hide complexity from users
   - Provide clear, working solutions
   - Support both team and non-team scenarios

---

## Common Issues and Solutions

### Issue: "Current user is not authenticated with IAM credentials"
**Cause**: Attempting to query Andes catalog paths without permissions  
**Solution**: 
1. Create access request using CreateAccessRequest
2. Wait for approval (instant for auto-approved tables)
3. Create subscription
4. Query using subscription schema paths

### Issue: Query execution returns 501 error
**Cause**: Query failed and no results available  
**Solution**: Check query status using check_query_status to see actual error

### Issue: "Schema does not exist" error
**Cause**: No subscription exists for requested data  
**Solution**: Create subscription using CreateSubscription tool

### Issue: Connection timeout
**Cause**: Network issues or service unavailability  
**Solution**: Retry connection, check service status

---

## Advantages of SQL Access

| Aspect | API Access | SQL Access via Andes |
|--------|------------|----------------------|
| Rate Limits | Strict limits | None |
| Query Complexity | Limited by endpoints | Full SQL capabilities |
| Historical Data | Recent only | Years of data |
| Performance | API overhead | Optimized Redshift |
| Batch Analysis | Multiple calls | Single query |
| Cross-dataset | Not possible | JOIN with any dataset |

---

## Recommendations

### Immediate Actions

1. **Use dual-server approach**
   - Run both andes-mcp and weblab-mcp
   - Let AI coordinate between them

2. **Leverage auto-approval**
   - Most Weblab tables are instantly accessible
   - No waiting for manual approval

3. **Document accessible datasets**
   - Maintain list of available tables
   - Track subscription schemas

### Future Enhancements

1. **Smart routing**
   - Auto-decide between API vs SQL
   - Based on query requirements

2. **Query optimization**
   - Cache common queries
   - Use materialized views

3. **Advanced analytics**
   - Build complex analysis tools
   - Cross-dataset insights

4. **Monitoring and alerts**
   - Track experiment performance
   - Alert on anomalies

### Enhanced Features to Consider

1. **Hybrid Approach**
   - Use Weblab MCP for real-time data
   - Use Andes MCP for complex analytics

2. **Cross-dataset Analysis**
   - Join Weblab data with customer metrics
   - Join with product or business data

3. **Advanced Statistics**
   - Use Redshift's statistical functions
   - Build ML models on historical data

4. **Automated Reporting**
   - Generate comprehensive experiment reports
   - Create dashboards with complex KPIs

---

## Streamlined Workflow Discussion

### Current Implementation vs Optimal Approach

#### What We're Currently Doing (9 Steps)
Our `weblab-user-experiments.ts` follows the full exploration sequence:
1. LoadAndesContext
2. SearchDatasets  
3. get_databases
4. get_users_for_database
5. create_connection
6. get_catalog
7. execute_query
8. check_query_status
9. get_query_result_url

**This is overkill!** We're doing discovery steps every time when we already know:
- Database ID: `0b41fd5a-a113-442a-a6e7-6158506a204a`
- User: `weblab_ro`
- Schema: `"weblab"."wst"`

#### What We Should Do (3 Steps)
```javascript
// Step 1: Create connection (with known IDs)
createConnection(knownDatabaseId, knownUserId)

// Step 2: Execute query
executeQuery(connectionId, sql)

// Step 3: Get results
getQueryResults(executionId)
```

### Permission Handling Strategy

#### For Weblab Team Members
- **No extra steps needed** - Use `weblab_ro` directly
- **Works immediately** - Pre-existing subscription

#### For Non-Team Members
- **Auto-approved tables** (most WEBLAB_DDL):
  - CreateAccessRequest → Instant approval
  - Wait ~5 seconds for propagation
  - Then use normal 3-step flow
  
- **Protected tables** (manual approval):
  - CreateAccessRequest → Wait for owner
  - Could take hours/days
  - Tool should fail gracefully with clear message

### Recommended Approach

**Hybrid Strategy:**
1. Start optimistic - try the 3-step flow
2. If permission error, then:
   - Check if table is auto-approved
   - Submit CreateAccessRequest
   - Retry after brief wait
3. If still fails, inform user about manual approval needed

This balances speed (3 steps for most cases) with robustness (handle permissions when needed).

---

## Conclusion

The Andes MCP integration provides powerful SQL access to Weblab data, complementing the existing API tools. While direct server-to-server MCP communication is not recommended, our HTTP bridge solution works perfectly.

### Key Takeaways

- 2,397 Weblab datasets available via SQL
- Auto-approval for most tables
- HTTP bridge successfully avoids MCP limitations
- Streamline to 3 steps for better performance
- Permission handling should be reactive, not proactive

### The Complete Picture

This investigation revealed:
- HTTP bridge is a valid workaround for MCP server-to-server limitations
- Most operations can be streamlined to 3 steps
- Permissions are the main challenge, not technical architecture
- Auto-approval makes most tables instantly accessible

The combination of Weblab MCP (real-time API) and Andes MCP (analytical SQL) creates a complete Weblab data platform.

---

## Appendix: From APM Demo Transcript

Key insights from the APM team's Andes MCP demo:

1. **Access request is required**: "I want to get access for this table on my midway ID"
2. **Owner approval needed**: "the owner needs to authorize"
3. **Subscription creation**: "Subscribe this table to my redshift cluster"
4. **Query execution**: Once approved and subscribed, queries work

This confirms the complete workflow: Search → Request → Approve → Subscribe → Query

The transcript also revealed that in the demo, even with proper setup, queries can fail if permissions aren't fully configured, showing that the permission system is critical.

---

*Document Version: 1.0*  
*Last Updated: 9/24/2025*  
*Total Content: Consolidated from 6 source documents (1,566 lines)*
