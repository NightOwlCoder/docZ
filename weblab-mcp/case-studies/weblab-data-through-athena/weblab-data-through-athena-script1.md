# Weblab Andes Athena Access

## Overview

This script automates the process of adding Weblab Andes table context to an AI agent chat session, enabling natural language queries of Weblab data via Athena. The script discovers available Weblab tables, retrieves their schemas, and provides the agent with the necessary context to understand and query the data structure.

## Parameters

- **aws_account_id** (required): AWS account ID for Athena
- **iam_role** (required): IAM role with permissions to query Athena
- **aws_profile** (required): AWS profile for credentials
- **database_name** (required): The Athena database containing Weblab tables
- **catalog** (optional, default: "AwsDataCatalog"): Data catalog name
- **region** (optional, default: "us-east-1"): AWS region for Athena queries
- **s3_staging_dir** (optional, default: "s3://aws-athena-query-results-us-east-1-<aws_account_id>"): S3 location for query results

**Constraints for parameter acquisition:**
- You MUST inform user that they should have setup Andes 3.0 <-> Glue integration before proceeding and share the link: https://w.amazon.com/bin/view/BDT/Support/Guides/Onboard_Glue_Catalog
- You MUST ask for all required parameters upfront in a single prompt rather than one at a time
- You MUST support multiple input methods for parameters
- You MUST confirm successful acquisition of all parameters before proceeding

## Steps

### 1. Verify Dependencies

Check for required tools and warn the user if any are missing.

**Constraints:**
- You MUST verify the following tools are available in your context:
  - use_aws
  - InternalSearch
  - ReadInternalWebsites
  - execute_bash
- You MUST ONLY check for tool existence and MUST NOT attempt to run the tools because running tools during verification could cause unintended side effects or consume resources unnecessarily
- You MUST inform the user about any missing tools
- You MUST ask if the user wants to proceed anyway despite missing tools
- You MUST respect the user's decision to proceed or abort

### 3. Get IAM Credentials

Get IAM credentials to access Athena.

**Constraints:**
- You MUST confirm with the user if they have valid midway token
- You MUST confirm with user to run `mwinit -o -s` if they do not have valid midway token because the ADA command requires valid authentication and wait for their response.
- You MAY suggest to get valid token in another terminal shell
- You MUST ask user if they wish to retrieve credentials via ADA
- You MUST use execute_bash to run the command `ada credentials update --provider=conduit --account=<aws_account_id> --role=<iam_role> --profile=<aws_profile> --once`, if the user agrees
- You MUST inspect the response and ensure that it was successful in retrieving credentials

### 4. Get Context for Weblab Andes Tables

Read Wstlake wiki to know about Weblab Andes tables.

**Constraints:**
- You MUST use ReadInternalWebsites to read https://w.amazon.com/bin/view/Weblab/Wstlake/
- You MUST understand the tables and their schemas
- You MUST also understand the sample queries provided in the wiki
- You MAY list out the tables and brief description for user reference

### 5. Connect to Athena

Establish connection to discover available Weblab databases and tables.

**Constraints:**
- You MUST use use_aws to list available databases in the specified catalog by using:
  ```
  aws athena list-databases --catalog-name <catalog> --region <region> --profile <aws_profile>
  ```
- You MUST display discovered databases to the user
- You MUST verify that provided database_name exists
- You MUST inform the user if the database_name provided is missing
- You MUST ask if the user wants to provide a new database_name or abort
- You MUST respect the user's decision to proceed or abort

### 6. Verify Weblab Tables in Database

Retrieve the list of tables in the database.

**Constraints:**
- You MUST use use_aws to list tables only by using:
  ```
  aws athena start-query-execution --query-string "SHOW TABLES in <database_name>" --query-execution-context Database=<database_name> --result-configuration "OutputLocation=<s3_staging_dir>" --region <region> --profile <aws_profile>
  ```
- You MUST use use_aws to check status of query using:
  ```
  aws athena get-query-results --query-execution-id <QueryExecutionId> --region <region> --profile <aws_profile>
  ```
- You MUST only use weblab tables defined in the wiki unless requested by the user because other tables may not contain Weblab-specific data structure
- You MUST warn user if there is no Weblab Andes tables available in the database
- You MUST display the discovered tables to the user
- You MUST run sample queries on weblab metadata table and weblab analysis results table by using command:
  ```
  aws athena start-query-execution --query-string "select * from weblab_ddl.weblab_metadata limit 10" --query-execution-context Database=<database_name> --result-configuration "OutputLocation=<s3_staging_dir>" --region <region> --profile <aws_profile>
  ```


### 7. Run Queries for User's Use Case Using Athena

Run queries using Athena and provide data for user's use case.

**Constraints:**
- You MUST ask user about their use case
- You MUST ask user to describe the query in natural language
- You SHOULD attempt to verify your assumptions by breaking the use case to smaller queries
- You SHOULD use use_aws to run queries using:
  ```
  aws athena start-query-execution --query-string "<query>" --query-execution-context Database=<database_name> --result-configuration "OutputLocation=<s3_staging_dir>" --region <region> --profile <aws_profile>
  ```
- You SHOULD ask user if you are headed in right direction in building the query and then iterate
- You MAY ask user if they wish to save final results in a csv format
- You MUST use S3 cp operation:
  ```
  aws s3 cp <S3_Athena_query_response> <local_file_path> --profile athena
  ```

## Troubleshooting

### Connection Issues
If you cannot connect to Athena, ensure you have proper AWS credentials and permissions to access Athena.

### Missing Tables
If no Weblab tables are found, verify the database name and check if tables exist in a different database or schema.

### Unable to Run Queries
Check if the S3 location provided for staging directory is correct. You MAY list S3 buckets to correct the mistake.

### Performance Issues
For slow queries, consider adding WHERE clauses, LIMIT statements, or partitioning filters to reduce data scanned.
