## Agent script to enable AI agents to access Weblab data

**Purpose**: In absence of Weblab APIs, make Weblab data to AI agent by querying Weblab Andes tables via Athena.  My hope is that it is useful low-effort way to get weblab data to agent context.

### Pre-requisites
1. Athena access to Andes tables
2. Weblab Andes table subscription through Andes 3.0

## Setup

1. Refresh Midway cookie using `mwinit -o -s`
1. Configure AWS credentials:
	1. Run ADA for Athena access role
	2. Set profile name: athena
1. Optimize your context.
	1. Clear existing context
	2. Disable unnecessary tools - only MCP server required: `builder-mcp` and `use_aws`
1. Identify required Athena resources:
	1. Database name
	2. Staging S3 directory

### What the script does:
- Connects to Athena, 
- Discovers available Weblab tables, retrieving their schemas
- Loads wiki guides on how to query Weblab data into the context
- Executing natural language queries against Weblab data.

### Running the script
1. ADA: ```ada credentials update --account=199193740904 --role=IibsAdminAccess-DO-NOT-DELETE --provider=conduit --once --profile=athena```
1. In Q CLI: 
```read and run /Users/akhurdiy/workplace/q/src/AmazonBuilderGenAIPowerUsersQContext/scripts/weblab-andes-athena-access.script.md```

1. Provide database and Staging S3 directory : ```database_name andes_wstlake3, s3 location: s3://aws-athena-query-results-us-east-1-199193740904```

### DEMO
Video: https://drive.corp.amazon.com/documents/akhurdiy@/share/weblab_andes_mcp.m4v


## Quality of conversion of NL queries to SQL queries 
We are just relying on model's intelligence on reading through a wiki to come up with queries with no prior training or KB. So its, the bare minimum starting point.
- At the very minimum this should allow users to specify SQL queries and get relevant Weblab data to automate their workflows
- Agent is able to do good job at running basic queries like: 
    - "Find all weblabs owned by XX" 
- Agent is able to iterate and come up with sensible (not perfect) queries like
Ex: get experiments that are currently running or have mixed allocations
```
SELECT DISTINCT ae.weblab, ae.activation_state, ae.event_time, ae.treatments, ae.normalized_treatments, wm.title, wm.primary_owner FROM \"weblab_ddl.activation_events\" ae JOIN \"weblab_ddl.weblab_metadata\" wm ON ae.weblab = wm.weblab WHERE ae.activation_state IN ('run', 'launch') AND ae.event_time >= date('2024-01-01') AND (ae.treatments LIKE '%,%' OR ae.normalized_treatments LIKE '%,%') ORDER BY ae.event_time DESC LIMIT 100
```

Another example:
get all search weblabs that were analyzed in April 2025 for 28 day analysis for metrics OPS, "GCCP V14 Shipped in 2 days" and contribution profit. Then generate a GCCP winners and losers table formatted in Markdown
```
SELECT DISTINCT wm.weblab,
                wm.marketplace_id,
                wm.analysis_start_date,
                wm.analysis_end_date,
                wm.metric_name,
                wm.overall_posterior_probability_positive AS ppr,
                wm.overall_annualized_impact,
                wm.metric_p_value,
                wm.treatment_name_a,
                wm.treatment_name_b,
                wm.active_alarm_names,
                meta.primary_owner,
                meta.remedy_category
FROM            "weblab-science-team.weblab_metrics" wm
JOIN            "weblab_ddl.weblab_metadata" meta
ON              wm.weblab = meta.weblab
WHERE           wm.analysis_create_time >= Date('2025-08-01')
AND             wm.num_days_inc_in_analysis = 28
AND             wm.metric_name IN ('OPS (Purchases)',
                                   'Contribution Profit (Contribution Profit 2 Day Delay 2 day delay)')
AND             (
                                meta.remedy_category LIKE '%Search%'
                OR              meta.remedy_type LIKE '%Search%'
                OR              meta.remedy_item LIKE '%Search%'
                OR              meta.business_group LIKE '%Search%'
                OR              wm.weblab LIKE '%SEARCH%'
                OR              wm.weblab LIKE '%SRP%'
                OR              wm.weblab LIKE '%SERP%')
AND             wm.marketplace_id = '1'
ORDER BY        wm.weblab,
                wm.metric_name limit 50
```