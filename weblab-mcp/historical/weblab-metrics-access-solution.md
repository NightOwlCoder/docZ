# Weblab MCP Metrics Access Solution

## 🚨 The Real Problem

**Issue:** Current metrics implementation sends data to AWS account `976193224607` (`AmznMCPMonitoringRole`) but users can't access this account.

**Impact:** 
- Metrics are collected and sent
- **You can't see them** - CloudWatch dashboards are inaccessible
- Can't answer stakeholder questions about usage  
- No practical observability

## Practical Solutions

### Option 1: Local File-Based Metrics (Immediate)

**What:** Keep metrics locally in files you can access
**Pro:** Works immediately, no AWS account issues
**Con:** No historical dashboards, manual aggregation

```typescript
// Modify metrics.ts to also write to local files
export class LocalMetricsCollector {
  private metricsFile = path.join(os.homedir(), '.weblab-mcp', 'metrics.json');
  
  public recordMetric(metric: any): void {
    const data = this.loadMetrics();
    data.push({...metric, timestamp: new Date().toISOString()});
    fs.writeFileSync(this.metricsFile, JSON.stringify(data, null, 2));
  }
  
  public getUsageSummary(): any {
    const data = this.loadMetrics();
    return {
      totalCalls: data.length,
      uniqueUsers: new Set(data.map(d => d.userAlias)).size,
      toolUsage: this.aggregateByTool(data),
      timeRange: {
        from: data[0]?.timestamp,
        to: data[data.length - 1]?.timestamp
      }
    };
  }
}
```

### Option 2: Your Own AWS Account (Best)  

**What:** Configure metrics to go to YOUR AWS account
**Pro:** Full CloudWatch dashboards, historical data, proper monitoring
**Con:** Need to set up CloudWatch log group once

```bash
# 1. Check your current account
aws sts get-caller-identity

# 2. Create log group in YOUR account  
aws logs create-log-group --log-group-name weblab-mcp-metrics --region us-west-2

# 3. Update credential manager to use your account
```

### Option 3: Request Access to 976193224607

**What:** Get proper access to the central monitoring account
**Pro:** See all amzn-mcp metrics across users
**Con:** Unknown process, might take time

```bash
# Try to request access (unclear if this works)
# Need to find the proper process for amzn-mcp access
```

## 🔧 Immediate Fix: Local + Your Account Hybrid

Let me implement a hybrid approach that:
1. Works immediately with local file storage  
2. Optionally sends to YOUR AWS account if configured
3. Provides instant answers to stakeholder questions
4. No dependency on account 976193224607

### Modified Implementation

```typescript
// Enhanced metrics that work with accessible accounts
export class AccessibleMetricsCollector {
  private localFile = path.join(os.homedir(), '.weblab-mcp', 'usage-metrics.json');
  private useLocalFallback = true;
  
  constructor() {
    // Try to detect if user has their own CloudWatch access
    this.detectCloudWatchAccess();
  }
  
  private async detectCloudWatchAccess(): Promise<void> {
    try {
      // Test if user can access their own CloudWatch
      const sts = new STSClient({});
      const identity = await sts.send(new GetCallerIdentityCommand({}));
      
      if (identity.Account && identity.Account !== '976193224607') {
        // User has their own account - use it!
        this.configureUserAccount(identity.Account);
        this.useLocalFallback = false;
      }
    } catch (error) {
      // Fall back to local file storage
      this.useLocalFallback = true;
    }
  }
}
```

## 📊 What This Gives You RIGHT NOW

**Immediate answers to stakeholder questions:**

```bash
# How many users?
cat ~/.weblab-mcp/usage-metrics.json | jq '[.[].userAlias] | unique | length'

# Which tools are popular?  
cat ~/.weblab-mcp/usage-metrics.json | jq 'group_by(.toolName) | map({tool: .[0].toolName, count: length}) | sort_by(-.count)'

# Success rate?
cat ~/.weblab-mcp/usage-metrics.json | jq 'group_by(.success) | map({status: (if .[0].success then "success" else "failure" end), count: length})'

# Recent usage?
cat ~/.weblab-mcp/usage-metrics.json | jq 'map(select(.timestamp > "2024-09-26")) | length'
```

**Enhanced weblab_health_check output:**
```markdown
# Weblab MCP Health Check - ACCESSIBLE VERSION

**Status:** HEALTHY  
**Metrics Storage:** Local file + Optional CloudWatch
**Your Account:** 123456789012 (detected)

## 📊 Usage Summary (Last 7 Days)
- **Unique Users:** 8 users
- **Total Queries:** 156 calls
- **Success Rate:** 94.2%  
- **Most Popular:** weblab_details (67 calls)

## 🔍 Detailed Breakdown
Tool Usage:
- weblab_details: 67 calls (42.9%)
- weblab_allocations: 34 calls (21.8%) 
- weblab_user_experiments: 28 calls (17.9%)
- weblab_activation_history: 19 calls (12.2%)
- weblab_request_andes_access: 8 calls (5.1%)

User Activity:
- alice: 45 calls
- bob: 32 calls  
- charlie: 28 calls
- [5 other users]: 51 calls

## 💾 Data Storage
- **Local File:** ~/.weblab-mcp/usage-metrics.json
- **CloudWatch:** Optional, using your account if configured
- **Accessible:** You can view/analyze all data
```

## 🛠️ Next Steps

**Immediate (5 minutes):**
1. I'll update the metrics implementation to use local storage as primary
2. Test with a few weblab calls to populate data
3. Run `weblab_health_check` to see real usage data

**Short-term (next session):**
1. Configure to use your AWS account for CloudWatch
2. Set up proper dashboards in YOUR account  
3. Historical analysis with real CloudWatch integration

**Want me to implement the accessible version right now?** This will give you immediate metrics that actually work.
