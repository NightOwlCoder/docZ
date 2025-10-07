# Toolbox Vending Guide for Weblab MCP

**Date:** September 30, 2025  
**Purpose:** Document the toolbox install workflow for WeblabMCPServer

## Overview

Toolbox provides a standardized way to vend CLI tools at Amazon. Users install with a simple command:

```bash
toolbox install weblab-mcp
```

This guide documents the complete vending process for WeblabMCPServer.

## How Toolbox Works

### User Experience
```bash
# Simple installation
toolbox install weblab-mcp

# Tool is automatically:
# 1. Downloaded from S3 repository
# 2. Installed to ~/.toolbox/tools/
# 3. Made available in PATH
# 4. Auto-updated when new versions available
```

### Infrastructure Architecture

```
Your Package (WeblabMCPServer)
    ↓
LPT Pipeline (automated deployment)
    ↓
S3 Repository Bucket
    ├─ buildertoolbox-weblab-mcp-us-west-2/
    │  ├─ weblab-mcp/1.0.0/bundle.tar.gz
    │  ├─ weblab-mcp/1.0.1/bundle.tar.gz
    │  └─ metadata files
    ↓
Registry (optional, or use default)
    ├─ Index file (lists all available tools)
    └─ Channel files (stable, beta, etc.)
    ↓
User's Machine
    └─ toolbox install weblab-mcp
```

---

## Prerequisites

### Tools Required
```bash
# Install required tooling
toolbox install lpt        # LPT for pipeline synthesis
toolbox install create     # BuilderHub Create CLI
brazil-cli                 # Brazil build system
```

### Information Needed

| Item | Example | Your Value |
|------|---------|------------|
| Team Name | WebLab | _____________ |
| Team Email | weblab-team@amazon.com | _____________ |
| Tool Name | weblab-mcp | _____________ |
| AWS Account ID | 975049930647 | _____________ |
| Bindle Name | WeblabTeamBindle | _____________ |
| Bindle GUID | amzn1.bindle.resource.xxxxx | _____________ |
| Registry Name (optional) | weblab-registry | _____________ |

### Naming Constraints

**CRITICAL:** S3 bucket names have 63 character limit

**Repository bucket format:**
```
buildertoolbox-{TOOL_NAME}-{REGION}
Example: buildertoolbox-weblab-mcp-us-west-2
Available characters: ~38 for tool name
```

**Registry bucket format (if using custom registry):**
```
buildertoolbox-registry-{REGISTRY_NAME}-{REGION}
Example: buildertoolbox-registry-weblab-us-west-2
Available characters: ~29 for registry name
```

---

## Step-by-Step Process

### Phase 1: Create Vendor Config Package

This package generates CloudFormation templates that manage your AWS resources.

#### 1.1 Clone Base Version Set

```bash
# Clone the toolbox vendor infrastructure template
brazil vs clone \
  --from BuilderToolboxVendorInfrastructure/release \
  --to ToolboxVendor-WebLab/mainline \
  --bindleId {YOUR_BINDLE_GUID} \
  --mailingList weblab-team@amazon.com
```

#### 1.2 Set Tracking

```bash
# Track upstream changes
brazil vs settrackingversionset \
  --versionSet ToolboxVendor-WebLab/mainline \
  --trackingVersionSet BuilderToolboxVendorInfrastructure/release
```

#### 1.3 Create Workspace

```bash
# Create workspace for your vendor config
brazil ws create \
  --name ToolboxVendor-WebLab \
  --versionSet ToolboxVendor-WebLab/mainline

cd ToolboxVendor-WebLab
```

#### 1.4 Generate Vendor Config Package

```bash
# Create the vendor config package
create package --id toolbox-vendor-config \
  --name ToolboxVendorWebLab \
  -- \
  --toolName1 weblab-mcp \
  --toolName2 false \
  --toolName3 false \
  --registryName false  # Or your registry name

cd src/ToolboxVendorWebLab
```

#### 1.5 Publish to Brazil

```bash
# Promote package to Brazil
create pkg promote \
  --bindleId {YOUR_BINDLE_GUID} \
  --primaryExportControlType none \
  --push
```

#### 1.6 Build Package

```bash
# Build into version set
brazil pb build \
  --versionSet ToolboxVendor-WebLab/mainline \
  --package ToolboxVendorWebLab \
  --branch mainline \
  --useLatestChange \
  --waitForCompletion
```

#### 1.7 Update Version Set Targets

```bash
# Add your package as target
brazil vs addtargets \
  --versionSet ToolboxVendor-WebLab/mainline \
  --majorVersions ToolboxVendorWebLab-1.0

# Remove base templates
brazil vs removetargets \
  --versionSet ToolboxVendor-WebLab/mainline \
  --majorVersions BuilderToolboxVendorInfrastructureBuild-2.0,BuilderToolboxVendorInfrastructureLambda-2.0
```

---

### Phase 2: Create Pipeline

#### 2.1 Create Pipeline in UI

1. Go to https://pipelines.amazon.com/pipelines/new
2. Under "From a Version Set": `ToolboxVendor-WebLab/mainline`
3. Click "Preview Version Set-based Pipeline"
4. Select your Bindle
5. Click "Create Your Pipeline"
6. Note the Pipeline ID from Edit tab
7. Rename pipeline to `ToolboxVendorWebLab`

#### 2.2 Create LPT Package

```bash
# Create workspace for LPT definition
brazil ws create \
  --name ToolboxVendor-WebLabLpt \
  --versionset BuildExecutionLPT/development

cd ToolboxVendor-WebLabLpt

# Generate LPT package
create pkg --id toolbox-vendor-lpt \
  --name ToolboxVendor-WebLabLpt \
  -- \
  --pipelineId {YOUR_PIPELINE_ID} \
  --versionSet ToolboxVendor-WebLab/mainline \
  --configPackage ToolboxVendorWebLab \
  --awsAccountId 975049930647 \
  --bindleGuid {YOUR_BINDLE_GUID}

cd src/ToolboxVendor-WebLabLpt
```

#### 2.3 Configure IAM Role (If Using Isengard)

Edit `src/ToolboxVendor-WebLabLpt/lib/amazon/lpt/btb_vendor_template.rb`:

```ruby
# Enable IAM role creation
def create_IAM_role_for_toolbox_publish?
  true
end

# Add your team's POSIX groups
def posix_groups
  ['weblab-team', 'other-groups']
end

# Add specific users if needed
def posix_users
  ['sibagy', 'other-users']
end
```

#### 2.4 Publish LPT Package

```bash
create pkg promote \
  --bindleId {YOUR_BINDLE_GUID} \
  --primaryExportControlType none \
  --push
```

#### 2.5 Synthesize Infrastructure

```bash
# Build CloudFormation templates
lpt synthesize -r cloud-formation --skip-dependencies
```

**Wait for CloudFormation stacks to complete in AWS Console**

```bash
# After stacks are CREATE_COMPLETE, synthesize pipeline
lpt synthesize -r pipeline --skip-dependencies
```

#### 2.6 Deploy Package

1. Go to your pipeline: `https://pipelines.amazon.com/pipelines/ToolboxVendorWebLab`
2. Enable promotions between stages
3. Wait for deployment to Prod stage
4. Run final synthesis: `lpt synthesize`

---

### Phase 3: Bundle and Publish Your Tool

Now that infrastructure exists, you can publish WeblabMCPServer.

#### 3.1 Create Tool Bundle

In your WeblabMCPServer package:

```bash
cd /path/to/WeblabMCPServer

# Run bundling script (from MCP template)
bb run toolbox:bundle
```

This creates `build/tool-bundle/` with:
- Your compiled MCP server
- Runtime dependencies
- Metadata files
- Installation scripts

#### 3.2 Publish to Repository

```bash
# Publish to your S3 repository
bb run toolbox:publish-stable

# This uploads to:
# s3://buildertoolbox-weblab-mcp-us-west-2/
```

#### 3.3 Add to Registry

**Option A: Default Registry**
Submit ticket to add tool to default registry

**Option B: Custom Registry**
Update your registry index file

---

### Phase 4: User Installation

Once published, users can install:

```bash
# Users run this command
toolbox install weblab-mcp

# Tool is installed to:
# ~/.toolbox/tools/weblab-mcp/1.0.0/

# And added to PATH automatically
```

---

## Automation in Package Template

The golden path MCP template includes utilities for bundling and publishing:

### From Package Template

```typescript
// package.json scripts
{
  "scripts": {
    "toolbox:bundle": "...",    // Creates bundle
    "toolbox:publish-head": "...",  // Publish to head channel
    "toolbox:publish-stable": "..." // Publish to stable channel
  }
}
```

### Publishing Script Location

```
WeblabMCPServer/
├─ scripts/
│  └─ toolbox/
│     ├─ toolbox-bundle.ts     // Bundle creation
│     └─ toolbox-publish.ts    // S3 publishing
```

You'll need to update `toolbox-publish.ts` with your:
- AWS Account ID
- Repository bucket name
- Region

---

## Key Files Created

### In AWS

```
S3 Buckets:
├─ buildertoolbox-weblab-mcp-us-west-2/
│  ├─ weblab-mcp/
│  │  ├─ 1.0.0/
│  │  │  ├─ weblab-mcp.tar.gz
│  │  │  └─ metadata.json
│  │  └─ 1.0.1/
│  └─ index files
│
└─ buildertoolbox-registry-weblab-us-west-2/ (optional)

IAM:
└─ toolbox-publish-role (write access to buckets)

CloudFormation Stacks:
├─ ToolboxVendorWebLab-WebLabMcp
└─ ToolboxVendorWebLab-Registry (if using custom registry)
```

### In Your Workspace

```
ToolboxVendor-WebLab/
└─ src/
   └─ ToolboxVendorWebLab/
      ├─ Config
      └─ (CloudFormation templates)

ToolboxVendor-WebLabLpt/
└─ src/
   └─ ToolboxVendor-WebLabLpt/
      └─ lib/amazon/lpt/
         └─ btb_vendor_template.rb
```

---

## Effort Estimate

| Phase | Tasks | Time | Notes |
|-------|-------|------|-------|
| 1 | Vendor config setup | 2-3 hours | One-time setup |
| 2 | Pipeline creation | 2-3 hours | Includes IAM config |
| 3 | Bundle & publish | 1-2 hours | Per release |
| 4 | Testing | 1 hour | Per release |
| **Total** | **Initial setup** | **5-8 hours** | **Ongoing: 2-3 hours/release** |

---

## Comparison: Simple Install

### What Users Experience

**Before (manual):**
```bash
# Clone repo
git clone ...
cd WeblabMCPServer
npm install
npm run build
# Configure PATH manually
# Configure MCP client manually
```

**After (toolbox):**
```bash
toolbox install weblab-mcp
# Done! Tool is installed and in PATH
```

### What You Maintain

**Infrastructure (one-time):**
- Vendor config package
- LPT pipeline
- S3 buckets
- IAM roles

**Per Release:**
- Bundle tool
- Publish to S3
- Users auto-update

---

## Next Steps

1. **This Week:** Complete metrics implementation
2. **Week 2:** Set up vending infrastructure (5-8 hours)
3. **Week 2-3:** Fork amzn-mcp code into WeblabMCPServer package
4. **Week 3:** Test bundling and publishing
5. **Week 4:** Deploy to team, iterate

---

## Reference Links

- [Builder Toolbox User Guide](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending.html)
- [Create Vending Infrastructure](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-create-infrastructure.html)
- [Bundle and Publish](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-tool-publishing.html)
- [MCP Golden Path](https://docs.hub.amazon.dev/gen-ai-dev/creating-mcp-servers/)

---

## Troubleshooting

### Common Issues

**Issue:** S3 bucket name too long
**Solution:** Shorten tool name to fit within 38 character limit

**Issue:** CloudFormation stack fails
**Solution:** Check IAM permissions, verify account ID

**Issue:** Users can't install
**Solution:** Verify tool is in registry, check S3 permissions

**Issue:** Tool not in PATH
**Solution:** Users may need to restart shell or run `toolbox update`

---

## Toolbox Telemetry & Custom Metrics - CRITICAL DISCOVERY ✨

**EXCELLENT NEWS:** Toolbox has built-in metrics support that can complement your accessible-metrics.ts!

### What Toolbox Provides Automatically

When you vend via toolbox, you get **FREE**:
- ✅ Basic usage metrics (installs, updates, exit codes, latency)
- ✅ QuickSight dashboards (auto-generated)
- ✅ CloudWatch integration (in YOUR account)
- ✅ **Custom metrics support via EMF (Embedded Metric Format)**

### How Toolbox Telemetry Actually Works

**IMPORTANT:** After reading the actual docs, here's the correct process:

#### Step 1: Set Up CloudWatch Infrastructure

You must create:
1. **CloudWatch Log Group** (in us-east-1)
   - Format: `{tool}-{channel}-execution-logs`
   - Example: `weblab-mcp-stable-execution-logs`

2. **IAM Role** with trust relationship:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "global.prod.tools-telemetry.aws.internal"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

3. **IAM Policy** attached to role:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:CreateLogGroup",
      "logs:PutLogEvents"
    ],
    "Resource": [
      "arn:aws:logs:us-east-1:{YOUR_ACCOUNT}:log-group:weblab-mcp-*:*",
      "arn:aws:logs:*:*:tools-telemetry-*:*"
    ]
  }]
}
```

**Recommended:** Use CDK with ToolsTelemetryVendorConstructs for this (see below)

#### Step 2: Write EMF Logs to Files

**Key Environment Variable:**
```typescript
const metricsDir = process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY;
```

**How it works:**
1. Toolbox sets `TOOLBOX_{toolname}_EMF_METRICS_DIRECTORY` env var
2. Your tool writes EMF JSON to FILES in that directory
3. When tool exits, toolbox reads all files and sends to CloudWatch
4. Metrics appear in your CloudWatch account

#### Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TOOLBOX_{tool}_EMF_METRICS_DIRECTORY` | Directory to write metric files | `/tmp/toolbox-metrics/` |
| `TOOLBOX_TELEMETRY_Platform` | Arch + OS + AL version | `AL2_x86_64` |
| `TOOLBOX_TELEMETRY_User` | User who invoked tool | `sibagy` |
| `TOOLBOX_TELEMETRY_InvocationId` | AWS X-Ray ID | `1-62c89b54-...` |
| `TOOLBOX_TELEMETRY_RootInvocationId` | Root command X-Ray ID | `1-62c89b54-...` |
| `TOOLBOX_TELEMETRY_Version` | Tool version | `1.0.0` |
| `TOOLBOX_TELEMETRY_Channel` | Distribution channel | `stable` |
| `TOOLBOX_TELEMETRY_Command` | Command invoked | `weblab-mcp` |
| `TOOLBOX_TELEMETRY_Hostname` | Hostname | `dev-dsk-sibagy-...` |
| `TOOLBOX_TELEMETRY_Os` | Operating system | `darwin` |
| `TOOLBOX_TELEMETRY_Namespace` | CloudWatch namespace | `toolbox-weblab-mcp` |
| `TOOLBOX_TELEMETRY_DimensionSet` | Dimension set for metrics | `[[],["Platform"],...]` |

#### Correct Code Example for WeblabMCPServer

```typescript
// src/tools/weblab/toolbox-telemetry.ts
import * as fs from 'fs';
import * as path from 'path';

export function emitWeblabMetric(data: {
  action: string;
  success: boolean;
  durationMs?: number;
  experimentId?: string;
  errorType?: string;
}) {
  // Check if running via toolbox
  const metricsDir = process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY;
  if (!metricsDir) {
    return; // Not running via toolbox
  }

  // Create EMF format log
  const emf = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [{
        Namespace: 'toolbox-weblab-mcp',
        Dimensions: [['Action', 'Platform', 'Channel']],
        Metrics: [
          { Name: 'Duration', Unit: 'Milliseconds' },
          { Name: 'Invocations', Unit: 'Count' },
          { Name: 'Success', Unit: 'Count' }
        ]
      }]
    },
    ToolboxToolName: 'weblab-mcp', // REQUIRED FIELD
    Action: data.action,
    Duration: data.durationMs || 0,
    Invocations: 1,
    Success: data.success ? 1 : 0,
    ExperimentId: data.experimentId,
    ErrorType: data.errorType,
    // Add toolbox context
    Platform: process.env.TOOLBOX_TELEMETRY_Platform,
    Channel: process.env.TOOLBOX_TELEMETRY_Channel,
    User: process.env.TOOLBOX_TELEMETRY_User,
    Version: process.env.TOOLBOX_TELEMETRY_Version
  };

  // Write to file in metrics directory
  const filename = `weblab-${data.action}-${Date.now()}.log`;
  const filepath = path.join(metricsDir, filename);
  
  try {
    fs.writeFileSync(filepath, JSON.stringify(emf) + '\n');
  } catch (error) {
    // Silent failure - don't break tool if metrics fail
    console.error(`Failed to write metric: ${error}`);
  }
}

// Usage wrapper
export async function trackWeblabUsage<T>(
  action: string,
  operation: () => Promise<T>,
  context?: { experimentId?: string }
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    
    emitWeblabMetric({
      action,
      success: true,
      durationMs: Date.now() - startTime,
      experimentId: context?.experimentId
    });
    
    return result;
  } catch (error) {
    emitWeblabMetric({
      action,
      success: false,
      durationMs: Date.now() - startTime,
      errorType: error instanceof Error ? error.name : 'unknown',
      experimentId: context?.experimentId
    });
    
    throw error;
  }
}
```

#### Using in Weblab Tools

```typescript
// In weblab-details.ts
import { trackWeblabUsage } from './toolbox-telemetry';

cb: async (args: any): Promise<any> => {
  return trackWeblabUsage('weblab_details', async () => {
    // Your existing tool logic
    const result = await getExperimentDetails(args.experimentId);
    return result;
  }, {
    experimentId: args.experimentId
  });
}
```

### Setup Requirements - CORRECTED

**You MUST set up infrastructure first:**

#### Option A: Using CDK (Recommended)

```typescript
// In your monitoring CDK package
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ToolboxTelemetry } from '@amzn/tools-telemetry-vendor';

// Create log group in us-east-1
const logGroup = new LogGroup(this, 'weblab-mcp-stable-execution-logs', {
  logGroupName: 'weblab-mcp-stable-execution-logs',
  retention: RetentionDays.TWO_YEARS
});

// Create IAM role automatically
new ToolboxTelemetry(this, 'weblab-mcp-stable-ToolsTelemetry', {
  toolName: 'weblab-mcp',
  channel: 'stable',
  logGroup: logGroup
});
```

**CDK Dependencies:**
```
// In Config file
ToolsTelemetryVendorConstructs = 1.0;

// In package.json
"@amzn/tools-telemetry-vendor": "*"
```

#### Option B: Manual Setup

1. Create CloudWatch Log Group in us-east-1:
   - Name: `weblab-mcp-stable-execution-logs`
   - Retention: 2 years

2. Create IAM Role with trust relationship above

3. Attach policy with logs permissions

4. Submit ticket to Toolbox team with ARNs

### What This Means for accessible-metrics.ts

**BOTH systems can coexist!**

```
Toolbox Telemetry:
├─ Automatic basic metrics (invocations, latency, exit codes)
├─ QuickSight dashboard
├─ Your custom EMF metrics
└─ Requires infrastructure setup (CDK)

Your accessible-metrics.ts:
├─ Local file for immediate access
├─ CloudWatch custom metrics
├─ No toolbox dependency (works during development)
└─ Already implemented

Recommendation: Use BOTH
- Toolbox telemetry for production metrics
- accessible-metrics.ts for development/testing
```

### Benefits of Toolbox Telemetry

1. **Standardized:** Same format as all Amazon tools
2. **Dashboard Included:** QuickSight auto-generated
3. **Professional:** Proper CloudWatch integration
4. **X-Ray Tracing:** Built-in invocation tracking
5. **Filtering:** By channel, version, platform, OS

### Limitations

- ⚠️ Log group must be in us-east-1 (region expansion tracked in RDCT-6338)
- ⚠️ Combined logs per invocation cannot exceed 10MB
- ⚠️ Single log line cannot exceed 262KB
- ⚠️ Logs sent when process exits (not streaming)
- ⚠️ Requires infrastructure setup first (CDK or manual)

### Implementation Plan Update

**Use Hybrid Approach:**

1. **Development:** Keep accessible-metrics.ts for immediate feedback
2. **Production:** Add toolbox telemetry for professional dashboards

```typescript
// Dual metrics implementation
export function recordMetric(data: MetricData) {
  // Always record locally (development + immediate access)
  accessibleMetrics.recordEvent(...);
  
  // Also emit to toolbox telemetry if available (production)
  if (process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY) {
    emitWeblabMetric(...);
  }
}
```
## Toolbox Telemetry & Custom Metrics - CRITICAL DISCOVERY ✨

**EXCELLENT NEWS:** Toolbox has built-in metrics support that can complement your accessible-metrics.ts!

### What Toolbox Provides Automatically

When you vend via toolbox, you get **FREE**:
- ✅ Basic usage metrics (installs, updates, exit codes, latency)
- ✅ QuickSight dashboards (auto-generated, request via ticket)
- ✅ CloudWatch integration (in YOUR account 975049930647)
- ✅ **Custom metrics support via EMF (Embedded Metric Format)**

### How Toolbox Telemetry Actually Works (CORRECTED)

**IMPORTANT:** After reading actual docs, here's the correct process:

#### Step 1: Set Up CloudWatch Infrastructure FIRST

**You MUST create infrastructure before metrics work:**

##### Option A: Using CDK (Recommended)

```typescript
// In your WeblabMCPMonitoringCDK package
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ToolboxTelemetry } from '@amzn/tools-telemetry-vendor';

// Create log group in us-east-1 (required region)
const stableLogGroup = new LogGroup(this, 'weblab-mcp-stable-logs', {
  logGroupName: 'weblab-mcp-stable-execution-logs',
  retention: RetentionDays.TWO_YEARS
});

// Automatically creates IAM role with correct trust relationship
new ToolboxTelemetry(this, 'weblab-mcp-stable-telemetry', {
  toolName: 'weblab-mcp',
  channel: 'stable',
  logGroup: stableLogGroup
});

// Repeat for each channel (head, beta, etc.)
```

**Required Dependencies:**
```
// Config file
ToolsTelemetryVendorConstructs = 1.0;

// package.json
"@amzn/tools-telemetry-vendor": "*"
```

##### Option B: Manual Setup

If you can't use CDK:

1. **Create CloudWatch Log Group** (in us-east-1):
   - Name: `weblab-mcp-stable-execution-logs`
   - Retention: 2 years

2. **Create IAM Role** with trust relationship:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "global.prod.tools-telemetry.aws.internal"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

3. **Attach IAM Policy** to role:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:CreateLogGroup",
      "logs:PutLogEvents"
    ],
    "Resource": [
      "arn:aws:logs:us-east-1:975049930647:log-group:weblab-mcp-*:*",
      "arn:aws:logs:*:*:tools-telemetry-*:*"
    ]
  }]
}
```

4. **Submit Ticket:** Provide ARNs to Toolbox team for onboarding

#### Step 2: Write EMF Logs to Files (Not stdout!)

**Key Environment Variable:**
```typescript
const metricsDir = process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY;
```

**Correct Implementation:**

```typescript
// src/tools/weblab/toolbox-telemetry.ts
import * as fs from 'fs';
import * as path from 'path';

export function emitWeblabMetric(data: {
  action: string;
  success: boolean;
  durationMs?: number;
  experimentId?: string;
  errorType?: string;
}) {
  // Check if running via toolbox
  const metricsDir = process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY;
  if (!metricsDir) {
    return; // Not running via toolbox
  }

  // Create EMF format log
  const emf = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [{
        Namespace: 'toolbox-weblab-mcp',
        Dimensions: [['Action', 'Platform', 'Channel']],
        Metrics: [
          { Name: 'Duration', Unit: 'Milliseconds' },
          { Name: 'Invocations', Unit: 'Count' },
          { Name: 'Success', Unit: 'Count' }
        ]
      }]
    },
    ToolboxToolName: 'weblab-mcp', // REQUIRED FIELD
    Action: data.action,
    Duration: data.durationMs || 0,
    Invocations: 1,
    Success: data.success ? 1 : 0,
    ExperimentId: data.experimentId,
    ErrorType: data.errorType,
    // Add toolbox context from env vars
    Platform: process.env.TOOLBOX_TELEMETRY_Platform,
    Channel: process.env.TOOLBOX_TELEMETRY_Channel,
    User: process.env.TOOLBOX_TELEMETRY_User,
    Version: process.env.TOOLBOX_TELEMETRY_Version,
    InvocationId: process.env.TOOLBOX_TELEMETRY_InvocationId
  };

  // Write to FILE in metrics directory (not stdout!)
  const filename = `weblab-${data.action}-${Date.now()}.log`;
  const filepath = path.join(metricsDir, filename);
  
  try {
    // Ensure directory exists
    fs.mkdirSync(metricsDir, { recursive: true });
    
    // Write EMF JSON to file
    fs.writeFileSync(filepath, JSON.stringify(emf) + '\n');
  } catch (error) {
    // Silent failure - don't break tool if metrics fail
    console.error(`Failed to write toolbox metric: ${error}`);
  }
}

// Usage wrapper
export async function trackWeblabUsage<T>(
  action: string,
  operation: () => Promise<T>,
  context?: { experimentId?: string }
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    
    emitWeblabMetric({
      action,
      success: true,
      durationMs: Date.now() - startTime,
      experimentId: context?.experimentId
    });
    
    return result;
  } catch (error) {
    emitWeblabMetric({
      action,
      success: false,
      durationMs: Date.now() - startTime,
      errorType: error instanceof Error ? error.name : 'unknown',
      experimentId: context?.experimentId
    });
    
    throw error;
  }
}
```

#### Using in Weblab Tools

```typescript
// In weblab-details.ts
import { trackWeblabUsage } from './toolbox-telemetry';

cb: async (args: any): Promise<any> => {
  return trackWeblabUsage('weblab_details', async () => {
    const result = await getExperimentDetails(args.experimentId);
    return result;
  }, {
    experimentId: args.experimentId
  });
}
```

### Hybrid Metrics Strategy - RECOMMENDED

**Use BOTH systems for maximum value:**

```typescript
export function recordMetric(data: MetricData) {
  // 1. Always record to local file (immediate access, development)
  accessibleMetrics.recordEvent(data);
  
  // 2. Also emit to toolbox telemetry if available (production dashboards)
  if (process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY) {
    emitWeblabMetric(data);
  }
}
```

**Benefits of Hybrid Approach:**
- ✅ Local file works during development (no toolbox needed)
- ✅ Toolbox telemetry for production users
- ✅ QuickSight dashboards for stakeholders
- ✅ CloudWatch alarms and insights
- ✅ No single point of failure

### Stakeholder Questions - SOLVED

**"How many people are using it?"**
→ QuickSight dashboard: `https://us-east-1.prod.dash.telemetry.toolbox.builder-tools.aws.dev/v1/weblab-mcp`

**"What actions are most popular?"**
→ CloudWatch Insights query on Action dimension in YOUR account

**"What's our success rate?"**
→ CloudWatch metric: Success metric (1 = success, 0 = failure)

**"Any errors?"**
→ Filter by Success=0 and check ErrorType field

**"How do I access metrics?"**
→ CloudWatch console in us-east-1, account 975049930647

### Setup Checklist

For toolbox telemetry to work:
- [ ] Create CloudWatch log group in us-east-1
- [ ] Create IAM role with correct trust relationship
- [ ] Attach policy with logs permissions
- [ ] Submit ticket to Toolbox team with ARNs
- [ ] Request QuickSight dashboard via ticket
- [ ] Implement EMF file writing in tool code
- [ ] Test with `TOOLBOX_TELEMETRY_RETAIN_LOG_FILES=1`

### Real-World Examples

- **Hydra CLI (Python):** https://code.amazon.com/packages/GigaHydraCLI/blobs/4977cd3001a4c265f237b34645ae5a01705f05dc/--/src/giga_hydra_cli/cli.py#L71
- **ADA (Golang with EMF library):** https://code.amazon.com/packages/GoAmzn-AmalfiCli/blobs/82a95f3ae3f2787f3e7be9f223a79070e8aaa2db/--/metrics/metric_logger.go
- **Toolbox itself (Golang):** https://code.amazon.com/packages/BuilderToolboxClient/blobs/156590887c23dea73d3638b42ec9323fb817a0a6/--/metrics/metrics_logger.go
- **TAO (Kotlin):** https://code.amazon.com/packages/ApolloOverrideCLI/trees/mainline/--/src/main/kotlin/com/amazon/tao/metrics

### Reference

- [Toolbox Telemetry Documentation](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-monitor.html)
- [EMF Specification](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html)
- [CloudWatch Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- Metrics must be in us-east-1 currently
- Request dashboard: https://t.corp.amazon.com/create/templates/d2846e3c-c1a0-4397-a824-ca0e599084ef

---

## Conclusion

Toolbox vending provides:
- ✅ Simple user installation (`toolbox install weblab-mcp`)
- ✅ Automatic updates
- ✅ Standardized distribution
- ✅ **Metrics and monitoring BUILT-IN** (no custom code needed!)
- ✅ QuickSight dashboards auto-generated
- ⚠️ Initial setup complexity (5-8 hours)
- ⚠️ Ongoing maintenance per release (2-3 hours)

**CRITICAL UPDATE:** Toolbox telemetry requires setup (CDK + IAM roles) but provides professional dashboards. Your accessible-metrics.ts still valuable for development.

**Recommendation:** 
1. Set up toolbox vending for distribution
2. Use HYBRID metrics (both accessible-metrics.ts AND toolbox telemetry)
3. Toolbox telemetry for production stakeholder visibility
4. accessible-metrics.ts for development and immediate access

**Effort:** ~2-3 hours to set up toolbox telemetry infrastructure via CDK
