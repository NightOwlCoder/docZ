# Phase 2: Strands-Based Weblab MCP Implementation Plan

## Executive Summary

Phase 2 leverages Doug Hains' production Strands patterns to create a full-fledged weblab analysis service with complete observability. This approach addresses Aaron Gasperi's observability requirements while reusing all Phase 1 API work.

## Architecture Evolution

### Phase 1 (COMPLETED)
- **What**: 4 weblab MCP tools in amzn-mcp (TypeScript)
- **Users**: Amazon Q CLI, MCP clients
- **Observability**: Basic MCP request/response logging
- **Status**: Working, tested, ready for customer feedback

### Phase 2 (NEXT)
- **What**: Direct Strands agent with native weblab tools (Python)
- **Users**: Natural language interface, REST API, WebSocket
- **Observability**: Full OpenTelemetry + CloudWatch metrics
- **Template**: Doug's WeblabLearningAppBackendPython patterns

## Key Advantages of Doug's Approach

### 1. Authentication Solved
- **Doug's Pattern**: IAM roles with assumed role authentication
- **No Midway Required**: Service-level authentication via Lambda execution role
- **Proven in Production**: WeblabLearningAppBackendCDK deployment patterns

### 2. Complete Observability (Aaron's Requirements)
- **End-to-End Tracing**: OpenTelemetry captures original NL requests → tool calls → API responses
- **Cost Tracking**: Token usage, estimated costs, performance metrics
- **Conversation Logging**: Full debugging capabilities for user interactions
- **CloudWatch Integration**: Production-ready monitoring and alerting

### 3. Reuse Phase 1 Investment
- **API Logic**: All Keith-approved endpoints, authentication, error handling
- **Test Cases**: Complete validation scenarios and edge cases
- **Documentation**: API patterns, troubleshooting, usage examples
- **Tool Schemas**: Parameter validation and response formatting

## Implementation Strategy

### Task 23: Direct Strands Tools (Doug's Patterns)
```python
# Doug's telemetry setup (Aaron's observability requirement)
from strands import Agent, tool
from strands.telemetry import StrandsTelemetry
StrandsTelemetry().setup_console_exporter().setup_otlp_exporter()

@tool
def weblab_details(experiment_id: str, environment: str = "BETA") -> dict:
    """Get complete weblab experiment details using Doug's patterns"""
    # Reuse Phase 1 API logic with Doug's IAM auth (no Midway)
    session = get_weblab_iam_session()  # Doug's IAM assumed role pattern
    
    headers = {
        "x-api-key": get_api_key(),
        "Origin": "http://localhost", 
        "weblab-api-authorizing-actor": get_user_id()
    }
    
    # Doug's logging context for observability
    log_context.log_agent_processing(
        stage="api_call",
        details={"tool": "weblab_details", "experiment_id": experiment_id}
    )
    
    response = requests.get(
        f"{API_BASE}/sso/experiment/v1",
        params={"experimentId": experiment_id},
        headers=headers,
        auth=AWSRequestsAuth(session.get_credentials(), 'us-east-1', 'execute-api')
    )
    
    return response.json()
```

### Task 24: Doug's Workflow Patterns
```python
# Doug's complete agent setup from WeblabLearningAppBackendPython
from strands.session.s3_session_manager import S3SessionManager
from shared.logging_context import log_context
from shared.metrics import metrics_emitter

# Doug's agent structure with full observability
agent = Agent(
    tools=[weblab_details, weblab_allocations, weblab_activation_history],
    system_prompt=WEBLAB_ANALYSIS_PROMPT,
    model="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    session_manager=S3SessionManager(
        session_id=session_id,
        bucket=os.environ.get("SESSIONS_BUCKET_NAME"),
        prefix="weblab-analysis/"
    )
)

# Doug's conversation logging (Aaron's requirement)
log_context.log_conversation_input(
    user_message="What's the current allocation for weblab XYZ and any recent changes?",
    session_id=session_id
)

# Natural language interface with Doug's patterns
response = agent("What's the current allocation for weblab XYZ and any recent changes?")

# Doug's metrics emission for cost tracking
metrics_emitter.emit_agent_metrics(
    agent.metrics.get_summary(),
    operation="weblab_analysis",
    weblab_id="XYZ"
)
```

### Task 25: Doug's Deployment Patterns
- Lambda deployment with Doug's CDK patterns
- IAM roles with proper trust relationships
- API Gateway integration with CORS
- Environment variable configuration
- OpenTelemetry and CloudWatch setup

## Observability Implementation

### What Aaron Gets
1. **Original NL Request**: "What's the allocation for weblab XYZ?"
2. **Agent Reasoning**: Strands captures decision-making process
3. **Tool Execution**: Full API call tracing with parameters and responses
4. **Cost Tracking**: Token usage, estimated costs, performance metrics
5. **Error Correlation**: End-to-end error tracking and debugging

### Logging Structure
```python
# Doug's logging context patterns
log_context.log_conversation_input(
    user_message="What's the allocation for weblab XYZ?",
    additional_context={"weblab_id": "XYZ"}
)

log_context.log_agent_processing(
    stage="tool_execution",
    details={"tool": "weblab_details", "experiment_id": "XYZ"}
)

log_context.log_conversation_output(
    structured_response=response_data,
    agent_metrics=agent.metrics.get_summary()
)
```

## Timeline and Effort

### Phase 1 → Phase 2 Migration
- **API Logic**: 90% reuse (same endpoints, same authentication)
- **Framework**: TypeScript → Python (Doug's patterns provide template)
- **Observability**: Add Doug's telemetry setup
- **Deployment**: Use Doug's CDK patterns

### Estimated Timeline
- **Week 1**: Set up Strands environment, implement direct tools
- **Week 2**: Add Doug's observability patterns, test integration
- **Week 3**: Deploy using Doug's CDK patterns, production testing
- **Week 4**: Documentation, monitoring setup, handoff

## Success Criteria

### Functional Requirements
- All Phase 1 weblab functionality preserved
- Natural language interface for weblab analysis
- Session-based conversation management
- Structured output with complete analysis

### Observability Requirements (Aaron's Needs)
- End-to-end request tracing with OpenTelemetry
- Original natural language context preservation
- Tool execution visibility and correlation
- Cost tracking and performance monitoring
- CloudWatch integration for production monitoring

### Production Requirements
- IAM-based authentication (no Midway complexity)
- Lambda deployment with proper scaling
- Error handling and circuit breaker patterns
- Rate limiting and service protection

This approach provides the best of both worlds: quick Phase 1 delivery for customer feedback, and production-grade Phase 2 implementation using Doug's proven patterns.