# Jakub Kaplan (jkkaplan)
# Mon, October 6 | 11:30 AM - 12:00 PM PDT
The meeting focused on planning the Web Lab MCP (Model Context Protocol) initiative, which is mandated for teams with over 100 clients by year-end. The discussion covered the recent shift from local to remote-first architecture, data access strategies through Westlake tables, and identification of potential use cases for external teams.

## Architecture Changes
The MCP implementation has shifted from running on user laptops with midway authentication to a remote-first approach running on Amazon infrastructure. This change eliminates previous data access permission issues encountered during the hackathon, where non-team members couldn't access Web Lab data through the direct API approach.

## Data Access Strategy
The team will leverage Westlake tables containing Web Lab data rather than direct API access. These tables are accessible to any SDO team member who requests permission through standard processes. Multiple querying options are available including EMR with Spark, Athena, and the Andes Workbench, with costs falling on the querying team's AWS account rather than Web Lab's infrastructure.

## Use Cases Discussion
Two primary categories of use cases were identified: individual web lab queries (metadata, summaries, descriptions) and portfolio analysis involving multiple experiments. A concrete example discussed was creating dashboards showing top 5 positive and negative web labs by GCCP metrics for specific organizations. The colleague shared a prototype from June demonstrating dashboard creation capabilities using Westlake data, see `Resources` links.

## Technical Implementation
The preferred approach involves users providing their IAM roles with appropriate Westlake table permissions, allowing the MCP to execute queries on their behalf. This eliminates Web Lab's responsibility for data access permissions and associated costs while providing a scalable solution for external teams.

## Decisions
-   MCP must be remote-first architecture running on Amazon infrastructure rather than user laptops
-   Data access will be through Westlake tables instead of direct Web Lab API access
-   Cost responsibility will fall on the querying team's AWS account when accessing data directly

## Next steps
-   Sergio to collect use cases and forward MCP-related requests to colleague
-   Colleague to keep Sergio informed of any MCP reviews or developments
-   Explore BDT's potential MCP solution for Westlake table access
-   Consider implementation using Athena with IAM role-based access

## Resources
- Proof of Concept for using Weblab Andes Tables via MCP in LLM applications: https://quip-amazon.com/Pn34ASAcGjjq/Proof-of-Concept-for-using-Weblab-Andes-Tables-via-MCP-in-LLM-applications
- example table's metadata: https://datacentral.a2z.com/hoot/providers/ceb744ac-c00d-4543-bdd5-54f0c060ecd5/tables/weblab_metrics/versions/9?tab=schema
- all WSTLake tables's metadata: https://w.amazon.com/bin/view/Weblab/Wstlake/