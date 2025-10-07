# Phase 2 Development Setup - Strands Agent Local Testing

**Purpose:** Guide for local development of WeblabStrandsAgent without deploying to Lambda  
**Audience:** Engineers working on Phase 2 implementation  
**Date:** October 7, 2025

---

## Quick Start

**Goal:** Run Strands agent code locally with `brazil-runtime-exec` for fast iteration

**Benefits:**
- Code change → test loop in seconds (not minutes deploying Lambda)
- Debug with local IDE and breakpoints
- Test with real AWS resources via ada credentials
- No Lambda deployment needed during development

---

## Prerequisites

### 1. Brazil Workspace Setup

```bash
# Create workspace for WeblabStrandsAgent
brazil ws create --name WeblabStrandsAgent
cd WeblabStrandsAgent/src/WeblabStrandsAgent

# Install dependencies
brazil-build
```

### 2. Python Version

**Required:** Python 3.10+ (CloudAuth MCP SDK requirement, not 3.9)

```bash
# Check version
python3 --version

# If needed, configure version set for Python 3.10
# Visit https://build.amazon.com/vs/configure
# Set "Python: Default Interpreter" to "CPython310 or later"
```

### 3. Pydantic Build Issue Workaround

**Problem:** Pydantic native extension doesn't copy to brazil build directory  
**Solution:** Manual copy after build

```bash
# Build package
brazil-build

# Find where pip installed pydantic (system path)
# On Mac with mise: ~/.local/share/mise/installs/python/3.10/lib/python3.10/site-packages/

# Copy pydantic_core extension to brazil build output
# Brazil will error showing you the exact path it needs, example:
# "pydantic_core not found in /workplace/brazil-build-path/lib/"

# Copy command (adjust paths):
cp ~/.local/share/mise/installs/python/3.10/lib/python3.10/site-packages/pydantic_core/_pydantic_core.cpython-310-darwin.so \
   /path/to/brazil/build/output/lib/pydantic_core/
```

**Note:** This path is usually consistent per machine. Only need to do once per build clean.

### 4. AWS Credentials

**Option A: Personal Dev Account (Recommended for development)**

```bash
# Use ada to get credentials
ada credentials update \
  --account=YOUR_DEV_ACCOUNT \
  --provider=conduit \
  --role=IibsAdminAccess-DO-NOT-DELETE \
  --once

# Or use existing account (Jakub shared: 348835374786)
# Check Merlon: https://iad.merlon.amazon.dev/account/aws/348835374786/sdo
```

**Option B: Weblab MCP Account (For production-like testing)**

```bash
# Once MCP project account is created
ada credentials update \
  --account=WEBLAB_MCP_ACCOUNT \
  --provider=conduit \
  --role=WeblabMCPRole \
  --once
```

---

## Local Testing Workflow

### Method 1: brazil-runtime-exec (Recommended)

**For testing individual handlers:**

```bash
# Run Python handler locally
brazil-runtime-exec python3 << 'EOF'
import sys
sys.path.insert(0, 'src')

from weblab_strands_agent.handlers import analyze_experiment

# Test with fixed payload
event = {
    'experiment_id': 'TEST_EXP_123',
    'query': 'Analyze this experiment'
}

result = analyze_experiment(event, {})
print(result)
EOF
```

### Method 2: brazil-runtime-exec with Script

```bash
# Create test script: test/local_test.py
cat > test/local_test.py << 'EOF'
#!/usr/bin/env python3
import os
os.environ['WEBLAB_API_KEY'] = 'YOUR_KEY'
os.environ['WEBLAB_ENVIRONMENT'] = 'BETA'

from weblab_strands_agent.agent import weblab_agent

# Test query
result = weblab_agent("Show me details for experiment TEST_123")
print(result)
EOF

# Run it
brazil-runtime-exec python3 test/local_test.py
```

### Method 3: Unit Tests

```bash
# Run test suite
bb test

# Or specific test
brazil-runtime-exec python3 -m pytest test/test_weblab_tools.py -v
```

---

## Environment Variables

**Required for local testing:**

```bash
# Weblab API configuration
export WEBLAB_API_KEY="YourDev-Weblab-12345"
export WEBLAB_ENVIRONMENT="BETA"  # or "PROD"

# AWS configuration (from ada credentials)
export AWS_REGION="us-west-2"
export AWS_PROFILE="default"  # or your ada profile name

# For S3 session management (optional in local dev)
export SESSIONS_BUCKET_NAME="local-dev-sessions"

# For OpenTelemetry (optional in local dev)
export OTEL_EXPORTER_ENDPOINT="console"  # Print to console, not CloudWatch
```

**Override in test code:**
```python
import os
os.environ['WEBLAB_API_KEY'] = 'test-key'
os.environ['OTEL_EXPORTER_ENDPOINT'] = 'console'

# Now import and test
from weblab_strands_agent import weblab_agent
```

---

## Common Issues & Solutions

### Issue: Pydantic Import Error

**Error:** `ModuleNotFoundError: No module named 'pydantic_core'`

**Solution:** Follow Pydantic workaround above (copy .so file to brazil build)

### Issue: AWS Credentials Not Found

**Error:** `NoCredentialsError: Unable to locate credentials`

**Solution:** Run `ada credentials update` before testing

### Issue: Weblab API 403 Forbidden

**Error:** `403 Forbidden` when calling Weblab APIs

**Solution:** 
- Check `WEBLAB_API_KEY` is set
- Verify key is valid for environment (BETA vs PROD)
- Check origin header matches key prefix

### Issue: S3 Bucket Not Found

**Error:** Session bucket doesn't exist in local testing

**Solution:** Either:
- Create local test bucket in your dev account
- Mock S3 in tests
- Skip session management for simple tests

---

## Testing Individual Tools

**Test weblab_details:**
```python
# test/test_tools.py
from weblab_strands_agent.tools.weblab_details import weblab_details

def test_weblab_details():
    result = weblab_details(
        experiment_id='OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516',
        environment='BETA'
    )
    assert 'experimentId' in result
    assert result['experimentId'] == 'OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516'

# Run
brazil-runtime-exec python3 -m pytest test/test_tools.py::test_weblab_details -v
```

**Test agent orchestration:**
```python
# test/test_agent.py
from weblab_strands_agent.agent import create_weblab_agent

def test_agent_orchestration():
    agent = create_weblab_agent()
    
    result = agent("Get details and current allocation for experiment TEST_123")
    
    # Agent should call both tools
    assert 'details' in result.lower()
    assert 'allocation' in result.lower()

# Run
brazil-runtime-exec python3 -m pytest test/test_agent.py -v
```

---

## Fast Iteration Pattern

**Recommended workflow:**

```bash
# Terminal 1: Watch mode (run on every change)
while true; do
  clear
  echo "Running tests..."
  bb test
  echo "Waiting for changes..."
  sleep 2
done

# Terminal 2: Make code changes
# Tests auto-run on save

# Terminal 3: Manual testing
brazil-runtime-exec python3 test/manual_test.py
```

---

## Integration with Real Services

### Calling Real Weblab APIs

**Use beta environment for safe testing:**

```python
os.environ['WEBLAB_ENVIRONMENT'] = 'BETA'
os.environ['WEBLAB_API_KEY'] = 'YourDev-Weblab-12345'

from weblab_strands_agent.client import WeblabClient

client = WeblabClient()
result = client.get_experiment('TEST_EXP_BETA')
```

### Calling Andes via andes-mcp

**If andes-mcp server running:**

```python
from strands.tools.mcp import MCPClient
from cloudauth_mcp_support.client import cloudauth_streamablehttp_client
from cloud_auth_requests_python import AWSCloudAuthCredential
import boto3

session = boto3.Session()
creds = AWSCloudAuthCredential(session, None, "us-east-1")

andes = MCPClient(lambda: cloudauth_streamablehttp_client(
    "https://andes-mcp.internal/mcp",
    creds
))

with andes:
    # Use Andes tools
    tools = andes.list_tools_sync()
```

---

## Performance Testing Locally

**Measure tool execution time:**

```python
import time

start = time.time()
result = weblab_details(experiment_id='TEST')
duration = time.time() - start

print(f"Execution time: {duration:.2f}s")
assert duration < 2.0, "Tool too slow"
```

**Measure agent reasoning:**

```python
from strands import Agent

agent = Agent(tools=[...], model=BedrockClaude())

# Enable verbose logging
agent.set_log_level('DEBUG')

start = time.time()
result = agent("Complex multi-step query")
duration = time.time() - start

print(f"Agent reasoning time: {duration:.2f}s")
```

---

## Debugging Tips

### Enable Verbose Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Strands debug mode
from strands import Agent
agent = Agent(..., verbose=True)
```

### Inspect Agent Thought Process

```python
result = agent("Your query here")

# See what tools were called
print(f"Tools used: {agent.last_tools_used}")

# See LLM reasoning
print(f"Thought process: {agent.last_reasoning}")
```

### Test Without LLM (Mock Responses)

```python
# Mock agent responses for faster testing
class MockAgent:
    def __call__(self, query):
        return {"result": "mocked response"}

# Use in tests
agent = MockAgent()
assert agent("test") == {"result": "mocked response"}
```

---

## References

**Doug's Setup Guide:**
- Quip: https://quip-amazon.com/27RmA5laNXWb/WLBRai-Hackathon-Setup-Guide
- Similar patterns applicable to WeblabStrandsAgent

**Code Examples:**
- WeblabLearningAppBackendPython - Doug's reference implementation
- CloudAuthPythonMcpTestAgent - CloudAuth MCP client example
- CloudAuthPythonMcpTestService - CloudAuth MCP server example

**Package Dependencies:**
- Python-CloudAuth-MCP-Support (auth)
- strands-agents (agent framework)
- boto3 (AWS SDK)
- pytest (testing)

---

## Next Steps After Local Dev Works

1. **Add CloudAuth integration** - Test with CloudAuthFastMCP locally
2. **Deploy to dev account** - Use CDK to deploy test Lambda
3. **Test remote access** - Connect from Q CLI to your dev Lambda
4. **Iterate** - Use local dev for changes, deploy periodically to validate

**Goal:** Local dev for speed, remote deployment for validation

---

**Document Status:** Active  
**Maintained by:** Phase 2 implementation team  
**Related:** [Technical Vision](mcp-weblab-anywhere-technical-vision.md), [Doug's Patterns](../phase-2/doug-enhanced-phase-2-approach.md)
