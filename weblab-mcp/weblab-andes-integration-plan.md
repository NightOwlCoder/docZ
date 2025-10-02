# Weblab Andes Integration Plan for MCP Tools

## Current Status
✅ **Successfully implemented and tested!** We have:
1. Created the `weblab_andes_objectives` MCP tool structure
2. Set up authentication using ada profile with IibsAdminAccess role
3. Created a working shell script that queries WSTLake Andes tables
4. Successfully retrieved weblab objectives from `ANDES.WEBLAB_DDL.WEBLAB_METADATA`

## What We Have
1. **Tool Structure**: Complete MCP tool (`weblab-andes-objectives.ts`) that:
   - Accepts date ranges and parameters
   - Validates inputs
   - Generates the correct SQL query for `ANDES.WEBLAB_DDL.WEBLAB_METADATA`
   - Returns structured response

2. **SQL Query**: Based on Ryan's example from `WSTLakeAI` package:
```sql
WITH WEBLAB_OBJECTIVES AS (
  SELECT WEBLAB AS WEBLAB_ID,
         OBJECTIVE,
         CREATED,
         ROW_NUMBER() OVER (PARTITION BY WEBLAB ORDER BY CREATED DESC) AS ENTRY_NUM
  FROM ANDES.WEBLAB_DDL.WEBLAB_METADATA
  WHERE CREATED::date >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
    AND CREATED::date <= TO_DATE('2025-08-30', 'YYYY-MM-DD')
)
SELECT WEBLAB_ID, OBJECTIVE, CREATED
FROM WEBLAB_OBJECTIVES
WHERE ENTRY_NUM = 1
LIMIT 100
```

## What We Need

### Option 1: Python Proxy Service (Recommended)
Create a Python microservice that:
1. Uses `redshift_connection()` from Ryan's example
2. Handles authentication/credentials (likely via IAM/Isengard)
3. Exposes REST API endpoints
4. Returns JSON responses

**Implementation Steps:**
```python
# weblab_andes_service.py
from flask import Flask, jsonify, request
from lib.redshift_connection import redshift_connection
import pandas as pd

app = Flask(__name__)

@app.route('/api/weblab-objectives', methods=['POST'])
def get_weblab_objectives():
    data = request.json
    start_date = data.get('startDate')
    end_date = data.get('endDate')
    limit = data.get('limit', 100)
    
    cxn = redshift_connection()
    
    # Use the SQL query from our tool
    query = f"""
    WITH WEBLAB_OBJECTIVES AS (
        SELECT WEBLAB AS WEBLAB_ID,
               OBJECTIVE,
               CREATED,
               ROW_NUMBER() OVER (PARTITION BY WEBLAB ORDER BY CREATED DESC) AS ENTRY_NUM
        FROM ANDES.WEBLAB_DDL.WEBLAB_METADATA
        WHERE CREATED::date >= TO_DATE('{start_date}', 'YYYY-MM-DD')
          AND CREATED::date <= TO_DATE('{end_date}', 'YYYY-MM-DD')
    )
    SELECT WEBLAB_ID, OBJECTIVE, CREATED
    FROM WEBLAB_OBJECTIVES
    WHERE ENTRY_NUM = 1
    LIMIT {limit}
    """
    
    results = cxn.execute(query).fetchall()
    df = pd.DataFrame(results)
    
    return jsonify({
        'status': 'success',
        'data': df.to_dict('records'),
        'count': len(df)
    })
```

Then update our TypeScript tool to call this API:
```typescript
// In weblab-andes-objectives.ts
const apiUrl = 'http://internal-weblab-andes-service.amazon.com/api/weblab-objectives';
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startDate,
    endDate,
    limit,
    includeTimestamp
  })
});
const data = await response.json();
```

### Option 2: Use Existing Internal APIs
Check if there's already an internal API that exposes WSTLake data:
- The wiki mentions APT (Analysis Platform for Testing) integration
- There might be a Weblab API that already provides this data
- Check with the Amplified Learning team mentioned in the wiki

### Option 3: Direct Database Access from Node.js
Use a Node.js Redshift client (less ideal due to credential management):
```typescript
import { Client } from '@aws-sdk/client-redshift-data';
// Would need proper credential handling, connection pooling, etc.
```

## Available WSTLake Tables (from Wiki)

The wiki shows these Andes tables are available:
1. `weblab_metadata` - Non-metric metadata (what we're trying to query)
2. `activation_events` - Activation history
3. `weblab_metrics` - Auto-calculated metrics
4. `launch_criteria` - Launch criteria for weblabs
5. `long_running_weblabs` - Weblabs running >90 days
6. `experiment_experiences` - Experience areas impacted
7. `weblab_analysis_results` - All analysis results
8. `experiment_decisions` - Launch decisions
9. `weblab_rollups` - Worldwide rollups

## Next Steps

1. **Short Term (Quick Win)**: 
   - Document the SQL queries for manual use
   - Create a shell script that uses `aws redshift-data execute-statement`

2. **Medium Term**:
   - Set up Python proxy service with proper authentication
   - Deploy to internal infrastructure (Apollo/Sable)
   - Update MCP tool to use the API

3. **Long Term**:
   - Integrate with more WSTLake tables
   - Add caching layer for frequently accessed data
   - Create more sophisticated analysis tools

## Authentication Considerations

Based on the WSTLake wiki documentation:
- **Cluster**: `wst-redshift-cluster` in `us-east-1` region
- **AWS Account**: `wst-production` (Account ID: 199193740904)
- **Database**: `weblab`
- **Authentication Methods**:
  - AWS Secrets Manager with team-specific secrets:
    - `wit_read_only` - WIT team
    - `ampl_read_only` - AMPL team  
    - `decsci_read_only` - DecSci team
    - `wex_read_only` - WEX team
  - Admin access via `wst-redshift-cluster-secret`
  - IAM role-based access for programmatic use
- **Access via**: Hubble, DataGrip, SQL Workbench, Python/R scripts

## Example Shell Script (Interim Solution)

```bash
#!/bin/bash
# weblab-andes-query.sh

START_DATE=$1
END_DATE=$2

aws redshift-data execute-statement \
  --cluster-identifier weblab-redshift-cluster \
  --database andes \
  --db-user weblab-user \
  --sql "
    WITH WEBLAB_OBJECTIVES AS (
      SELECT WEBLAB AS WEBLAB_ID,
             OBJECTIVE,
             CREATED,
             ROW_NUMBER() OVER (PARTITION BY WEBLAB ORDER BY CREATED DESC) AS ENTRY_NUM
      FROM ANDES.WEBLAB_DDL.WEBLAB_METADATA
      WHERE CREATED::date >= TO_DATE('$START_DATE', 'YYYY-MM-DD')
        AND CREATED::date <= TO_DATE('$END_DATE', 'YYYY-MM-DD')
    )
    SELECT WEBLAB_ID, OBJECTIVE, CREATED
    FROM WEBLAB_OBJECTIVES
    WHERE ENTRY_NUM = 1
    LIMIT 100
  " \
  --output json
```

## Contact Points

From the wiki:
- **Weblab Support**: https://w.amazon.com/index.php/Weblab/Support
- **Data Quality Issues**: https://tiny.amazon.com/1d90ywmfa/wstlake-data-quality
- **Feature Requests**: Use SIM template for WSTLake feature requests

## Summary

The MCP tool structure is ready, but needs backend infrastructure to actually query Redshift. The most practical approach is likely creating a Python microservice that handles the database connection and exposes REST endpoints that our TypeScript MCP tool can call.
