# Weblab MCP Testing Guide

## Overview

This guide provides both **explicit tool testing** (direct tool usage) and **natural discovery testing** (Q's ability to pick the right tools from natural language).

**Available Tools (5 total)**:
1. **weblab_details** - Get experiment information (working)
2. **weblab_allocations** - Check current allocations (working) 
3. **weblab_activation_history** - Get change history (working)
4. ⚠️ **weblab_search** - Search experiments (returns limitation message)
5. **weblab_user_experiments** - Get user's experiments via Andes SQL (NEW - working!)

## Test Environment Setup

```bash
# Start MCP server
cd amazon-internal-mcp-server/src/AmazonInternalMCPServer
npm start

# Test with Q CLI (in separate terminal)
export WEBLAB_ENVIRONMENT=BETA  # Use BETA for testing
```

## Explicit Tool Testing (Direct Usage)

### Multi-Tool Test Prompts

Use this prompt with Amazon Q CLI to test all weblab tools:

```bash
# PROD Environment Test (use known PROD experiment)
q chat -a --no-interactive "I need a comprehensive analysis of weblab experiments in the PROD environment. Please help me with the following:

1. Get detailed information for experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' using weblab_details with environment set to PROD
2. Check the current allocation status for that experiment using weblab_allocations in PROD
3. Get the activation history to see recent changes using weblab_activation_history in PROD
4. If weblab_search works, search for other experiments by the same creator

Please provide a structured report with:
- Experiment configuration details
- Current allocation percentages  
- Recent change history
- Overall assessment and recommendations

Make sure to specify PROD environment for all tool calls."

# BETA Environment Test (use BETA experiments)
q chat -a --no-interactive "I need a comprehensive analysis of weblab experiments in the BETA environment. Please help me with the following:

1. Search for any available experiments using weblab_search (BETA is default)
2. Pick one experiment from the results and get detailed information using weblab_details
3. Check the current allocation status for that experiment using weblab_allocations
4. Get the activation history to see recent changes using weblab_activation_history

Please provide a structured report with all findings. Use BETA environment (which is the default)."
```

## Individual Tool Test Prompts

### Test weblab_search
```bash
q chat -a --no-interactive "Please search for weblab experiments using weblab_search. Look for experiments created by 'sibagy' or any active experiments. Show me what you find."
```

### Test weblab_details  
```bash
# PROD environment (for production experiments)
q chat -a --no-interactive "Please analyze weblab experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' in the PROD environment using weblab_details and tell me about its configuration, treatments, and current status."

# BETA environment (default)
q chat -a --no-interactive "Please analyze a weblab experiment in the BETA environment using weblab_details. Use any available experiment ID."
```

### Test weblab_allocations
```bash
q chat -a --no-interactive "Please check the current allocation status for weblab experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' using weblab_allocations. Tell me the treatment percentages and exposure levels."
```

### Test weblab_activation_history
```bash
q chat -a --no-interactive "Please get the activation history for weblab experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' using weblab_activation_history. Show me recent changes and who made them."
```

### Test weblab_user_experiments (NEW!)
```bash
# Basic test - get your own experiments
q chat -a --no-interactive "Show me my weblab experiments"

# With specific user
q chat -a --no-interactive "Show me sibagy's weblab experiments"

# With limit
q chat -a --no-interactive "Show me my last 5 weblab experiments"

# Natural language variations
q chat -a --no-interactive "What weblabs do I own?"
q chat -a --no-interactive "List experiments for user sibagy"
q chat -a --no-interactive "Find all weblabs where I'm the owner"
```

## Environment-Specific Testing

### BETA Environment (Default)
```bash
q chat -a --no-interactive "Please analyze a BETA weblab experiment. Use weblab_search to find any available experiments in the BETA environment, then analyze one with weblab_details."
```

### PROD Environment (NOW SUPPORTED - CR-220258045)
```bash
# Set environment to PROD
export WEBLAB_ENVIRONMENT=PROD

# Test PROD experiment with activation history (now works!)
q chat -a --no-interactive "Please analyze weblab experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' in the PROD environment. Get the experiment details, current allocations, and activation history using all available weblab tools."
```

## Expected Behavior

### Success Indicators:
- LLM calls all 4 weblab tools in logical sequence
- Each tool returns structured data (not errors)
- LLM synthesizes information across tools
- Final report includes insights from all data sources

### Failure Indicators:
- Tools return authentication errors
- Environment mismatch (BETA tools, PROD experiment IDs)
- LLM doesn't recognize when to use which tool
- Generic responses without tool usage

## Debugging Commands

### Check Tool Registration
```bash
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | npm start
```

### Test Individual Tools Directly
```bash
# weblab_search
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_search", "arguments": {"query": {"creatorLogin": "sibagy"}}}, "id": 1}' | npm start

# weblab_details  
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "TEST_EXP"}}, "id": 1}' | npm start

# weblab_allocations
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_allocations", "arguments": {"experimentId": "TEST_EXP"}}, "id": 1}' | npm start

# weblab_activation_history
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_activation_history", "arguments": {"experimentId": "TEST_EXP"}}, "id": 1}' | npm start
```

## Current Issues to Address

1. **Environment Configuration**: Tools need environment parameter
2. **API Key Selection**: Different keys for BETA vs PROD
3. **Test Data**: Need known good experiment IDs for both environments
4. **Error Handling**: Graceful handling of environment mismatches

## Natural Discovery Testing

### Tool Discovery Tests

#### 1. weblab_details Discovery
**Natural prompts that should trigger weblab_details**:
```bash
q chat -a --no-interactive "What is the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 weblab experiment about?"
q chat -a --no-interactive "Can you tell me about the weblab experiment OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516? What treatments does it have?"
q chat -a --no-interactive "Who owns the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 experiment and what team created it?"
```

#### 2. weblab_allocations Discovery
**Natural prompts that should trigger weblab_allocations**:
```bash
q chat -a --no-interactive "Is the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 weblab currently running?"
q chat -a --no-interactive "What percentage of traffic is going to each treatment in OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516?"
q chat -a --no-interactive "How much traffic is exposed to the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 experiment right now?"
```

#### 3. weblab_activation_history Discovery
**Natural prompts that should trigger weblab_activation_history**:
```bash
q chat -a --no-interactive "What changes have been made to the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 experiment recently?"
q chat -a --no-interactive "Who made changes to experiment OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 and when?"
q chat -a --no-interactive "Show me the timeline of changes for the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 weblab experiment."
```

#### 4. weblab_search Discovery
**Natural prompts that should trigger weblab_search**:
```bash
q chat -a --no-interactive "Find all weblab experiments created by myalias"
q chat -a --no-interactive "Search for weblab experiments related to user authentication"
q chat -a --no-interactive "What weblab experiments are owned by the MyTeam resolver group?"
```

### Multi-Tool Discovery Tests
**Complex prompts that should trigger multiple tools**:
```bash
q chat -a --no-interactive "Give me a complete analysis of the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 experiment - what it is, current status, and recent changes."
q chat -a --no-interactive "Is the OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516 experiment healthy? Check its details, current allocations, and recent history."
q chat -a --no-interactive "I need to investigate experiment OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516. Show me what it does, how traffic is allocated, and what changes were made recently."
```

### Negative Tests (Should NOT trigger weblab tools)
```bash
q chat -a --no-interactive "What is the weather today?"
q chat -a --no-interactive "How do I submit a code review in Amazon?"
q chat -a --no-interactive "What is A/B testing?"
```

## Automated Testing

Use the test runner for automated validation:
```bash
node docs/testing/weblab-test-runner.js
```

## Success Criteria

- Q naturally discovers correct tools for each type of question
- Tools return real data (not errors)
- Q uses multiple tools intelligently for complex analysis
- Q does NOT use weblab tools for unrelated questions

## Environment Notes

- Use `WEBLAB_ENVIRONMENT=BETA` for testing
- Test experiment: `OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516` (confirmed working in BETA)
- Requires `mwinit --aea` authentication
- MCP server must be running locally


# Testing Permission Denied Scenario for weblab_user_experiments

## Test Method (Successfully Tested)

We added a test condition to weblab-user-experiments.ts that simulates a permission error:

```javascript
// TEST: Force permission error for testing
if (owner === "test-no-access") {
  throw new Error('PERMISSION_DENIED');
}
```

### How to Test
In Q, use this prompt: `"Show me test-no-access's weblab experiments"`

### Result
Q correctly:
1. Detected the permission error
2. Asked: "Looks like you need Weblab access first. Want me to request it for you?"
3. Would call `weblab_request_andes_access` tool if user says yes

### Next Steps for Real Testing
To test with actual Andes permission flow:
1. Find someone without existing weblab_metadata access, OR
2. Investigate other Andes tables that sibagy doesn't have access to

## Expected Behavior

When permission is denied, the tool should return:
```json
{
  "status": "error",
  "error": "PERMISSION_DENIED",
  "message": "You don't have access to Weblab data yet. Would you like me to request access for you? It only takes about 10 seconds.",
  "owner": "sibagy"
}
```

Q should then:
1. Show the error message to the user
2. Ask if they want to request access
3. If yes, call the `weblab_request_andes_access` tool
4. Wait 5-10 seconds for auto-approval
5. Retry the original query

## Implementation Status

**Both tools now return proper MCP format:**
- `weblab_user_experiments` - Fixed to return MCP-compatible JSON
- `weblab_request_andes_access` - Fixed to return MCP-compatible JSON

The complete permission flow is implemented and tested with simulated errors. For production testing with real permission denials, we need access to tables without existing permissions.
