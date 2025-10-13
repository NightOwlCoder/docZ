# Weblab MCP Demo Script

## Demo Overview (2-3 minutes)
**What**: AI agents can now access read-only weblab data through natural language
**Why**: Teams need programmatic weblab access for analysis, troubleshooting, and automation
**Why**: Teams spend time clicking through UIs or asking experts for basic weblab info - now just ask Q in natural language
**How**: Model Context Protocol (MCP) integration with Amazon Q and any other MCP capable AI tools

---

## Demo Flow

### 1. **The Problem** (30 seconds)
"Teams constantly need weblab data but have to manually navigate the UI. What if AI agents could just... know about weblabs?"

### 2. **The Solution** (30 seconds)
"We built MCP tools that let AI agents access weblab data through natural language."

### 3. **Live Demo** (90 seconds)

#### Setup
```bash
# Authenticate
mwinit
```

#### Natural Workflow Demo - "A Day in the Life of a Weblab Developer"

**"Let me show you how I use Q to manage my weblab experiments for our mobile test app..."**

```bash
# Start Q conversation
q chat -a
```

**Demo Flow (Interactive Conversation):**

1. **Morning Check-in**:
```
I need to check on my mobile test app experiments. What's the status of WEBLAB_MOBILE_TESTAPP_SESSION_1299744?
```

2. **Dig Deeper**:
```
Show me the activation history for the PILOT domain of that experiment in JP
```

3. **Compare Experiments**:
```
I also have WEBLAB_MOBILE_TESTAPP_CUSTOMER_1299775. Can you compare the allocations between these two experiments?
```

4. **Compare**:
```
Which experiment has been running longer and what are the key differences in their configurations?
```

5. **Fun**
```
Can you run all weblab tools on WEBLAB_MOBILE_TESTAPP_SESSION_1299744 and give me a nice, 80 columns terminal formatted table (no MD) of the most important data?
```

**Key Points During Demo:**
- Show how Q maintains context across questions
- Highlight natural language understanding
- Demonstrate multi-tool orchestration happening automatically

#### Alternative: Quick Individual Commands (If Interactive Doesn't Work)
```bash
# Quick status check
q chat -a "Check the status of my mobile test app experiments WEBLAB_MOBILE_TESTAPP_SESSION_1299744 and WEBLAB_MOBILE_TESTAPP_CUSTOMER_1299775"

# Detailed analysis
q chat -a "I need a complete analysis of WEBLAB_MOBILE_TESTAPP_SESSION_1299744 including its history and current allocations"

# Comparison
q chat -a "Compare the configurations between WEBLAB_MOBILE_TESTAPP_SESSION_1299744 and WEBLAB_MOBILE_TESTAPP_CUSTOMER_1299775"
```

### 4. **The Magic** (30 seconds)
- **No manual API calls** - AI figures out which tools to use
- **No weblab UI navigation** - Data comes directly to your workflow
- **Works with any AI tool** - Q CLI, Cline, RooCode, custom agents
- **Service protection** - Uses public APIs with proper rate limiting

---

## Key Talking Points

### **Technical Achievement**
- Uses our team's public weblab APIs, that leverage throttle and user authentication
- Proper authentication, rate limiting, error handling

### **Business Impact**
- Reduces weblab expert bottlenecks
- Enables AI-powered weblab analysis workflows
- Foundation for additional automation and monitoring

### **What's Next**
- Planning Strands agent integration for complex workflows
- Will implement weblab search capabilities (pending API support)

---

## Demo Environment Setup

### Before Demo:
```bash
# Ensure you're authenticated
mwinit --aea

# Test BETA environment
cd amazon-internal-mcp-server/src/AmazonInternalMCPServer
env WEBLAB_ENVIRONMENT=BETA bash -c 'echo "{\"jsonrpc\": \"2.0\", \"method\": \"tools/call\", \"params\": {\"name\": \"weblab_details\", \"arguments\": {\"experimentId\": \"OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516\"}}, \"id\": 1}" | npm start'

# Test PROD environment (inline, doesn't affect your shell)
env WEBLAB_ENVIRONMENT=PROD bash -c 'echo "{\"jsonrpc\": \"2.0\", \"method\": \"tools/call\", \"params\": {\"name\": \"weblab_details\", \"arguments\": {\"experimentId\": \"WEBLAB_MOBILE_TESTAPP_SESSION_1299744\"}}, \"id\": 1}" | npm start'
```

### Backup Demo (if live demo fails):
Show the test runner output:
```bash
# Test BETA environment (inline, preserves your shell)
env WEBLAB_ENVIRONMENT=BETA node docs/testing/weblab-test-runner.js

# Test PROD environment (inline, preserves your shell)
env WEBLAB_ENVIRONMENT=PROD node docs/testing/weblab-test-runner.js
```

---

## Potential Questions & Answers

**Q: "How does this compare to direct API calls?"**
A: "AI agents can discover and combine multiple weblab operations automatically. Instead of writing custom scripts, you just ask in natural language."

**Q: "What about rate limiting?"**
A: "We use WeblabAPI's public APIs with proper API keys and service protection. Much safer than UI scraping."

**Q: "Can this work with other tools besides Q?"**
A: "Yes! MCP is a standard protocol. Works with Cline, custom Strands agents, any MCP-compatible AI tool."

**Q: "What's the performance?"**
A: "Reasonable response times (sub 2s) for most queries. Weblab API is fast."

**Q: "Security concerns?"**
A: "Uses standard Midway authentication + API keys. Same security model as weblab UI."

---

## Success Metrics to Mention

- 3 weblab tools implemented (details, allocations, activation history)
- Sub-2 second response times
- Proper error handling and service protection
- WeblabAPI's team collaboration and approval

---

## Call to Action

This is a prototype that shows the potential. If this resonates with our team's needs, I'd love to:
1. **Get feedback** on what weblab workflows we'd want to automate
2. **Discuss integration** with existing AI tools and processes
3. **Explore additional scenarios** like multi-agent weblab analysis workflows

---

Remember: **Keep it conversational, focus on business value, and be ready for technical deep-dives if they're interested!**
--
-

## 🧪 **Q Validation System** (For Technical Deep-Dive)

### **The Problem We Solved**
"How do we know Amazon Q can actually discover and use our weblab tools correctly from natural language?"

### **Our Solution: Automated Q Testing**

#### **Test Architecture**
- **18 test scenarios** across 6 categories (`docs/testing/weblab-test-cases.json`)
- **Automated test runner** (`docs/testing/weblab-test-runner.js`)
- **Natural language prompts** → **Expected tool usage validation**

#### **What We Test**
1. **Natural Language Discovery**: "What can you tell me about experiment XYZ?" → Should use `weblab_details`
2. **Multi-Tool Orchestration**: "Health check on experiment XYZ" → Should use `weblab_details` + `weblab_allocations`
3. **Business Scenarios**: Real troubleshooting, optimization, readiness workflows
4. **Environment Handling**: BETA vs PROD environment switching
5. **Error Handling**: Invalid experiments, malformed IDs
6. **Complex Analysis**: Multi-tool workflows with synthesis

#### **Demo the Validation**
```bash
# Show automated Q testing (defaults to BETA)
node docs/testing/weblab-test-runner.js

# Test specific environment (inline, doesn't affect shell)
env WEBLAB_ENVIRONMENT=PROD node docs/testing/weblab-test-runner.js
```

#### **Key Talking Points**
- **"We don't just build tools - we validate the AI can use them correctly"**
- **"18 test scenarios ensure reliable natural language understanding"**
- **"Tests both individual tools and multi-tool orchestration"**
- **"Automated testing catches regressions as we evolve"**

#### **Results**: All core functionality validated - Q successfully discovers and uses our tools 

#### **Why This Matters**
- **Reduces risk** of deploying AI tools that don't work properly
- **Proves business value** - AI can handle real weblab workflows
- **Foundation for production** - confident deployment with validation

# Redshift access
```
 ada profile add --profile=redshift \
--account=199193740904 \
--provider=conduit \
--role=IibsAdminAccess-DO-NOT-DELETE

export AWS_PROFILE=redshift
```

# Raw, tools testing
```
export WEBLAB_ENVIRONMENT=PROD
export AWS_PROFILE=redshift

# Core Weblab API tools
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "WEBLAB_MOBILE_TESTAPP_SESSION_1299744"}}, "id": 1}' | npm start 2>&1

echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_allocations", "arguments": {"experimentId": "WEBLAB_MOBILE_TESTAPP_SESSION_1299744"}}, "id": 1}' | npm start 2>&1

echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_activation_history", "arguments": {"experimentId": "WEBLAB_MOBILE_TESTAPP_SESSION_1299744"}}, "id": 1}' | npm start 2>&1

# New WSTLake SQL tools
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_query_data", "arguments": {"table": "weblab_metadata", "limit": 5}}, "id": 1}' | npm start 2>&1

echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_query_data", "arguments": {"table": "activation_events", "startDate": "2025-09-01", "limit": 10}}, "id": 1}' | npm start 2>&1

# Custom SQL example
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_query_data", "arguments": {"customQuery": "SELECT weblab, title, primary_owner FROM \"weblab\".\"wst\".\"weblab_metadata\" WHERE created >= '\''2025-09-22'\'' LIMIT 3"}}, "id": 1}' | npm start 2>&1

# User experiments - "What are MY weblabs?" 
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_user_experiments", "arguments": {"owner": "sibagy", "limit": 5}}, "id": 1}' | npm start 2>&1

# User active experiments
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_user_experiments", "arguments": {"owner": "sibagy", "status": "active", "days": 30}}, "id": 1}' | npm start 2>&1
```
