# Doug's Strands Patterns Reference for Weblab MCP Phase 2

## Overview

Doug Hains' team has implemented a production Strands-based service that provides the perfect template for Phase 2 of our weblab MCP integration. This document captures the key patterns and implementation details from their WeblabLearningAppBackendPython package.

## Key Discovery: Doug's Code Purpose

**Important Clarification**: Doug's WeblabLearningAppBackendPython is NOT a weblab data service - it's a weblab experiment description clarification service.

### What Doug's Code Actually Does
- **Input**: User provides experiment description text
- **Processing**: Strands agent analyzes description for clarity and completeness  
- **Output**: Structured feedback and improved description suggestions
- **No External APIs**: Pure LLM-based text analysis, no weblab API calls

### Perfect Template for Our Use Case
Doug's code shows exactly how to build production Strands agents with full observability. We use his framework patterns and add our Keith-approved weblab API tools.

## Key Packages

- **WeblabLearningAppBackendPython**: Production Strands implementation
- **WeblabLearningAppBackendCDK**: CDK deployment patterns with IAM roles
- **WeblabLearningAppBackendTests**: Integration testing patterns

## Architecture Patterns

### 1. Direct Strands Agent (No MCP Middleman)

Doug's approach uses direct Strands tools instead of MCP protocol:

```python
from strands import Agent, tool
from strands.session.s3_session_manager import S3SessionManager
from strands.telemetry import StrandsTelemetry

# Direct tool implementation
@tool
def weblab_details(experiment_id: str, environment: str = "BETA") -> dict:
    """Get weblab experiment details using IAM auth"""
    # Direct API call with Keith's approved endpoints
    return call_weblab_api_with_iam_auth(experiment_id)

# Agent with full observability
agent = Agent(
    tools=[weblab_details, weblab_allocations, weblab_activation_history],
    model="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    session_manager=session_manager
)
```

### 2. Authentication: IAM Roles (Not Midway)

Doug confirmed they use **IAM_AWS auth** for APIs:
- Uses assumed IAM roles with trust relationships
- No Midway complexity required
- Service-level authentication via Lambda execution role
- Proven pattern from WeblabLearningAppBackendCDK

### 3. Complete Observability Setup

Doug's implementation provides exactly what Aaron requested:

```python
# OpenTelemetry integration
from strands.telemetry import StrandsTelemetry
setup_otel_log_correlation()

# Initialize telemetry
StrandsTelemetry().setup_console_exporter().setup_otlp_exporter()

# Comprehensive logging with trace correlation
log_context.log_agent_processing(
    stage="agent_creation",
    details={"model_id": model_id},
    model_id=model_id
)

# CloudWatch metrics for cost tracking
metrics_emitter.emit_agent_metrics(
    agent.metrics.get_summary(),
    operation="clarification",
    weblab_id=weblab_id,
    model_id=model_id
)
```

## Key Implementation Files

### 1. Main Agent Implementation
**File**: `src/weblab_learning_app_backend_python/clarification/experiment_description_clarification.py`

**Key Patterns**:
- Complete Strands Agent setup with telemetry
- S3SessionManager for conversation persistence
- Structured output with Pydantic models
- CORS handling for web integration
- Comprehensive error handling

### 2. Logging Context Helper
**File**: `src/weblab_learning_app_backend_python/shared/logging_context.py`

**Key Features**:
- User context correlation (user_id, session_id, weblab_id)
- OpenTelemetry trace/span correlation
- Conversation logging for debugging
- Request lifecycle tracking

### 3. Metrics Emitter
**File**: `src/weblab_learning_app_backend_python/shared/metrics.py`

**Key Features**:
- CloudWatch metrics emission for Strands usage
- Cost tracking with token usage metrics
- Performance metrics (latency, duration)
- Tool-specific metrics and success rates
- Environment-driven configuration

## Production Deployment Patterns

### CDK Integration
From WeblabLearningAppBackendCDK:
- Lambda deployment with proper IAM roles
- API Gateway integration with CORS
- Environment variable configuration
- Gradual deployment with rollback

### Authentication Flow
```typescript
// IAM role with trust relationships (no Midway)
const trustRelationshipPolicy = new PolicyStatement({
  actions: ['sts:AssumeRole'],
  principals: [
    new ArnPrincipal('arn:aws:iam::357229612043:root'), // Harmony accounts
    // ... more account ARNs
  ],
});
```

## Observability Benefits

Doug's approach solves Aaron's observability requirements:

1. **End-to-End Tracing**: OpenTelemetry captures full request flow
2. **Natural Language Context**: Agent preserves original user queries
3. **Tool Execution Tracking**: Complete visibility into API calls
4. **Cost Monitoring**: Token usage and estimated costs
5. **Performance Metrics**: Latency, success rates, error tracking

## Migration from Phase 1

### What to Reuse
- All Keith-approved API logic and endpoints
- Authentication patterns and error handling
- Test cases and validation scenarios
- API parameter validation and response formatting

### What Changes
- 🔄 TypeScript MCP tools → Python Strands tools
- 🔄 amzn-mcp registration → Direct agent deployment
- ➕ OpenTelemetry observability integration
- ➕ S3 session management for conversations
- ➕ CloudWatch metrics for cost tracking

## Implementation Checklist

### Phase 2 Task 23 Enhancement
- [ ] Study Doug's experiment_description_clarification.py structure
- [ ] Implement direct Strands @tool decorators for weblab functions
- [ ] Reuse Phase 1 API logic in Python Strands tools
- [ ] Add Doug's telemetry initialization
- [ ] Implement Doug's logging context patterns
- [ ] Add Doug's metrics emission for cost tracking

### Phase 2 Task 24 Enhancement
- [ ] Use Doug's S3SessionManager for conversation persistence
- [ ] Implement Doug's structured output with Pydantic models
- [ ] Add Doug's error handling and CORS patterns
- [ ] Follow Doug's conversation logging for debugging

### Phase 2 Task 25 Enhancement
- [ ] Use Doug's Lambda deployment patterns
- [ ] Implement Doug's IAM role authentication
- [ ] Add Doug's comprehensive observability setup
- [ ] Configure Doug's cost tracking and monitoring

## Benefits Over MCP Approach

1. **Better Observability**: Native Strands telemetry vs MCP protocol overhead
2. **Simpler Authentication**: IAM roles vs Midway complexity
3. **Better Performance**: Direct API calls vs MCP protocol layer
4. **Production Ready**: Doug's proven patterns vs experimental MCP integration
5. **Cost Tracking**: Built-in token usage monitoring
6. **Session Management**: S3-based conversation persistence

## References

- **Doug's Code**: WeblabLearningAppBackendPython package
- **CDK Patterns**: WeblabLearningAppBackendCDK/lib/api/restApiTypescriptLambdaEndpointP0.ts
- **Authentication Guidance**: Doug's IAM_AWS auth approach
- **Observability Requirements**: Aaron's OpenTelemetry + CloudWatch needs

This approach gives us production-grade Strands implementation with full observability while reusing all our Phase 1 API work.