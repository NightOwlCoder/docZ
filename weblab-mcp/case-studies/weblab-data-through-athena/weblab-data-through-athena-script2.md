
# AI Agent Setup: Weblab Data Query Context
This script enables natural language querying of AWS Athena databases. It helps users discover databases and tables, translates natural language requests into SQL queries, executes them via Athena, and downloads results in various formats.

**Mermaid Execution Flowchart**

flowchart TD
A[Start] --> D[Read Weblab Wiki]
D --> E[Get Database Config]
E --> F[Test Athena Connection]
F --> G[Query table names using Athena]
G --> H{WSTLake Tables Found?}
H -->|Yes| I[Ready for Queries - Use quoted table names]
H -->|No| J[Error: WSTLake tables not available in database]
I --> K[Get User Query Request]
K --> L[Analyze Query Requirements]
L --> M[MUST: Show SQL Query to User]
N --> O[MUST: Request User Permission]
P --> Q{User Approves?}
R-->|Yes| S[Execute Query]
R -->|No| T[Revise Query Based on User Input]
T -->|Modify| L
S --> U{Query Successful?}
U -->|Yes| V[Return Results]
U -->|No| W[Debug Query Issues]
W --> X{Schema Error?}
X -->|Yes| R
X -->|No| Y[Analyze Other Errors]
Y --> Z[Provide Error Details to User]
D --> D1[URL: w.amazon.com/bin/view/Weblab/Wstlake/]
D --> D2[Tool: ReadInternalWebsites]
E --> E1[Ask: database_name]
E --> E2[Ask: s3_output_location]
F --> F1[Tool: use_aws]
F --> F2[Operation: list-databases]
G --> G1[Tool: use_aws]
G --> G2[query: SELECT table_name  FROM information_schema.tables  WHERE table_schema = '<database_name>' AND table_name LIKE 'weblab%';]
M --> M1[Note: Quote table names to escape '.']

Error States:
  - Missing tools → MUST not proceed
  - Wiki access denied → MUST not proceed and midway credentials
  - Athena connection failed → MUST not proceed and Verify aws_credentials
Other Instructions:
* You MUST wait for queries to run for atleast 2 min, before giving up.
* You MUST use quotes around table names: "weblab_ddl.weblab_metadata" as table name has '.' in them.
* You MUST download the results from S3, if the executed query didnt had a LIMIT clause in it. and use: `aws s3 cp <S3_Athena_query_response> <local_file_path> --profile athena`
* You MUST use credential profile athena.
* You MUST use 'use_aws' for running Athena queries using:
```
aws athena start-query-execution --query-string "<query>" --query-execution-context Database=<database_name> --result-configuration "OutputLocation=<s3_staging_dir>" --region <region> --profile <aws_profile>
```


