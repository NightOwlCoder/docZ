# Claude's Step-by-Step Guide: Using Andes MCP for Weblab Data Access

**Created**: 9/23/2025  
**Purpose**: Foolproof guide for Claude instances to access live Weblab data via Andes MCP  
**Audience**: Other Claude instances who need Weblab data from Redshift  

## 🎯 What This Guide Achieves

By following these exact steps, you will:
- Connect to Amazon's WSTLake Redshift cluster
- Query live Weblab experiment data directly via SQL
- Access 2,394+ Weblab datasets without API limitations
- Get real experiment data from recent dates

## ⚡ Quick Success Path (Copy-Paste Ready)

### Step 1: Activate Andes Context
```json
{
  "server_name": "andes-mcp",
  "tool_name": "LoadAndesContext", 
  "arguments": {}
}
```
**Expected**: You'll get comprehensive Andes expertise loaded.

### Step 2: Search for Weblab Datasets  
```json
{
  "server_name": "andes-mcp",
  "tool_name": "SearchDatasets",
  "arguments": {
    "query": "weblab",
    "limit": 10
  }
}
```
**Expected**: ~2,394 datasets found, showing top 10 with WEBLAB_DDL provider.

### Step 3: Get WEBLAB_DDL Provider Info
```json
{
  "server_name": "andes-mcp", 
  "tool_name": "ReadProviders",
  "arguments": {
    "operation": "GetProviderByName",
    "providerName": "WEBLAB_DDL"
  }
}
```
**Expected**: Provider ID `weblab` confirmed.

### Step 4: List All Weblab Tables
```json
{
  "server_name": "andes-mcp",
  "tool_name": "ReadDatasets", 
  "arguments": {
    "operation": "ListDatasets",
    "providerId": "weblab",
    "limit": 20
  }
}
```
**Expected**: List of official Weblab tables like weblab_metadata, ACTIVATION_EVENTS, etc.

### Step 5: Get Available Databases
```json
{
  "server_name": "andes-mcp",
  "tool_name": "DataCentralWorkbench",
  "arguments": {
    "operation": "get_databases"
  }
}
```
**Expected**: Should show `Wstlake` database with ID `0b41fd5a-a113-442a-a6e7-6158506a204a`.

### Step 6: Get Database Users
```json
{
  "server_name": "andes-mcp", 
  "tool_name": "DataCentralWorkbench",
  "arguments": {
    "operation": "get_users_for_database",
    "databaseId": "0b41fd5a-a113-442a-a6e7-6158506a204a"
  }
}
```
**Expected**: Shows `weblab_ro` user for read-only access.

### Step 7: Create Database Connection
```json
{
  "server_name": "andes-mcp",
  "tool_name": "DataCentralWorkbench", 
  "arguments": {
    "operation": "create_connection",
    "databaseId": "0b41fd5a-a113-442a-a6e7-6158506a204a", 
    "dbUserId": "weblab_ro"
  }
}
```
**Expected**: Connection ID returned (save this for queries!).

### Step 8: Execute Your First Query
```json
{
  "server_name": "andes-mcp",
  "tool_name": "DataCentralWorkbench",
  "arguments": {
    "operation": "execute_query",
    "connectionId": "YOUR_CONNECTION_ID_FROM_STEP_7",
    "sql": "SELECT weblab, title, primary_owner, created FROM \"weblab\".\"wst\".\"weblab_metadata\" ORDER BY created DESC LIMIT 5",
    "recordLimit": 5
  }
}
```
**Expected**: Query execution ID returned.

### Step 9: Get the Results
```json
{
  "server_name": "andes-mcp", 
  "tool_name": "DataCentralWorkbench",
  "arguments": {
    "operation": "get_query_result_url", 
    "executionId": "YOUR_EXECUTION_ID_FROM_STEP_8"
  }
}
```
**Expected**: Actual Weblab experiment data displayed in table format!

## 🚫 Common Mistakes to Avoid

### Wrong SQL Syntax
```sql
-- DON'T: Missing schema qualification
SELECT * FROM weblab_metadata 

-- DON'T: Wrong schema reference  
SELECT * FROM "andes"."WEBLAB_DDL"."weblab_metadata"

-- DO: Correct schema reference for Redshift
SELECT * FROM "weblab"."wst"."weblab_metadata"
```

### Wrong Operation Parameters
```json
// DON'T: Call execute_query without connection setup
{
  "operation": "execute_query",
  "sql": "SELECT * FROM table"  // Missing connectionId!
}

// DO: Always include connectionId from step 7
{
  "operation": "execute_query", 
  "connectionId": "8ed3b171-51b4-47f4-a45c-b75515882d4d",
  "sql": "SELECT * FROM \"weblab\".\"wst\".\"weblab_metadata\" LIMIT 5"
}
```

### Not Following the Workflow
Don't skip steps! The workflow is:
1. LoadAndesContext
2. Search/Read datasets  
3. get_databases
4. get_users_for_database
5. create_connection
6. execute_query
7. get_query_result_url

##  Proven Working Queries

### Get Recent Experiments
```sql
SELECT weblab, title, primary_owner, created 
FROM "weblab"."wst"."weblab_metadata" 
ORDER BY created DESC LIMIT 5;
```

### Get Experiments by Owner
```sql
SELECT weblab, title, created 
FROM "weblab"."wst"."weblab_metadata" 
WHERE primary_owner = 'OWNER_ALIAS'
ORDER BY created DESC;
```

### Check Table Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'wst' 
  AND table_name = 'weblab_metadata'
ORDER BY ordinal_position;
```

## 🗄️ Key Table Locations (CONFIRMED)

| Table | Full Path | Purpose |
|-------|-----------|---------|
| **weblab_metadata** | `"weblab"."wst"."weblab_metadata"` | Main experiment details |
| **activation_events** | `"weblab"."wst"."activation_events"` | Allocation changes |
| **weblab_launches** | `"weblab"."wst"."weblab_launches"` | Launch history |
| **wla_experiments** | `"weblab"."waba"."wla_experiments"` | Analytics view |
| **wla_launch_decisions** | `"weblab"."waba"."wla_launch_decisions"` | Decision tracking |

##  Schema Guide

**Database**: `Wstlake` (ID: `0b41fd5a-a113-442a-a6e7-6158506a204a`)  
**Catalogs**: `weblab`, `dev`  
**Key Schemas**:
- `wst` - Weblab Science Team (main data)
- `waba` - Weblab Analytics (detailed views) 
- `weblab_ddl` - Aggregated data
- `public` - Test and utility tables

## 🎯 Real Data Examples

When you successfully run the queries, you'll see data like:

| weblab | title | primary_owner | created |
|--------|-------|---------------|---------|
| VPS_REJECT_DF_FLAT_PO_INVOICES_1313553 | Reject dropship flat PO invoices | shaaneha | 2025-09-22 11:57:35 |
| ACCS_TIEREDPRICING_VIEWS_DUB_ZAZ_TRAFFIC_SWITCH_1313552 | Traffic switch from DUB to ZAZ | navendj | 2025-09-22 11:53:31 |

## 🛠️ Troubleshooting Guide

### Problem: "relation does not exist"
**Solution**: Use correct schema qualification: `"weblab"."wst"."table_name"`

### Problem: "Invalid request parameters"
**Solution**: Check you're using the right operation name and required parameters.

### Problem: No connection ID
**Solution**: Make sure Step 7 (create_connection) succeeded before trying execute_query.

### Problem: Query fails with syntax error
**Solution**: Use simpler SQL first, then add complexity. Remove semicolons if present.

##  Advanced Capabilities  

Once you master the basics, you can:

### Cross-Schema JOINs
```sql
SELECT m.weblab, m.title, a.activation_timestamp
FROM "weblab"."wst"."weblab_metadata" m
JOIN "weblab"."wst"."activation_events" a ON m.weblab = a.weblab
WHERE m.created >= '2025-09-01'
ORDER BY a.activation_timestamp DESC;
```

### Analytics with Window Functions
```sql
SELECT 
    weblab,
    title, 
    created,
    ROW_NUMBER() OVER (PARTITION BY primary_owner ORDER BY created DESC) as owner_rank
FROM "weblab"."wst"."weblab_metadata"
WHERE created >= '2025-09-01';
```

##  Pro Tips for Claude Instances

1. **Always call LoadAndesContext first** - This activates specialized Andes expertise
2. **Save connection IDs** - You'll need them for multiple queries
3. **Start simple** - Get basic SELECT working before complex JOINs
4. **Use LIMIT** - Always limit results to avoid huge responses
5. **Qualify everything** - Use full `"catalog"."schema"."table"` syntax
6. **Check execution status** - Queries are asynchronous, check before getting results

## 📋 Checklist for Success

- [ ] LoadAndesContext activated ✓
- [ ] Found WEBLAB_DDL provider  
- [ ] Connected to Wstlake database ✓
- [ ] Created connection with weblab_ro user ✓
- [ ] Executed simple SELECT query ✓
- [ ] Retrieved actual experiment data ✓
- [ ] Documented working queries ✓

## 🎉 Success Indicators

You know you've succeeded when you see:
- Real experiment IDs (like `VPS_REJECT_DF_FLAT_PO_INVOICES_1313553`)
- Actual owner aliases (like `shaaneha`, `navendj`)  
- Recent timestamps (2025-09-22 format)
- Download URLs for TSV files with results

**Remember**: If you get stuck, refer back to this guide and follow the exact JSON parameters provided!

CLR: 99%
