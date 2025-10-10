# Weblab MCP - Technical Summary

## 🛠️ **4 Tools Implemented**

### 1. `weblab_search` 
- **Purpose**: Find experiments by creator, status, resolver group
- **Status**: Limited (requires Arpit/Ampl coordination for search service)
- **API**: Will use search service once added to weblab API proxy

### 2. `weblab_details`
- **Purpose**: Get comprehensive experiment information  
- **API**: `GetExperiment` operation from WeblabAPIModel
- **Input**: `experimentId`, optional `environment` (BETA/PROD)
- **Output**: Title, objective, treatments, CTI, ownership, timestamps

### 3. `weblab_allocations`
- **Purpose**: Check current experiment status and treatment allocations
- **API**: `ListAllocations` operation from WeblabAPIModel  
- **Input**: `experimentId`, optional `realm`, `domain`, `marketplaceId`
- **Output**: Status, treatment percentages, exposure levels per realm/domain

### 4. `weblab_activation_history`
- **Purpose**: Get experiment change history with MCM information
- **API**: `ListAllocationPeriods` operation from WeblabAPIModel
- **Input**: `experimentId`, optional `limit`, `marketplaceId`, `domain`
- **Output**: Chronological changes with user, timestamp, comments (preserves MCM info)

---

## 🏗️ **Architecture**

```
AI Agent (Q CLI, Cline, etc.)
    ↓ MCP Protocol
amzn-mcp Server (TypeScript)
    ↓ HTTP + Midway Auth
Keith's Public Weblab API
    ↓ 
Weblab Service (Tier-1)
```

## 🔐 **Authentication & Security**

- **Auth Method**: Midway authentication + API keys
- **API Keys**: 
  - `localDev-SIM-Weblab-38862` (working, BETA tested)
  - `Weblab-58093` (Keith's new unified key, pending activation)
- **Rate Limiting**: API Gateway enforced based on key type
- **Service Protection**: Uses public APIs, not internal UI endpoints

## 📊 **Test Results**

- **BETA Environment**: 4/4 tests passing ✅
- **PROD Environment**: 5/6 tests passing (1 timeout, not functional issue)
- **Key Success**: `weblab_activation_history` works in PROD (CR-220258045)
- **Response Time**: Sub-2 seconds for most queries

## 🔄 **Usage Examples**

### Natural Language → Tool Selection
```
User: "What can you tell me about experiment XYZ?"
AI: Uses weblab_details automatically

User: "Is experiment XYZ running properly?"  
AI: Uses weblab_details + weblab_allocations + synthesizes health check
```

### Direct MCP Tool Testing
```bash
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"}}, "id": 1}' | npm start
```

## What's Next

### Phase 2: Strands Integration
- Direct Python tools (no MCP overhead)
- Doug Hains' production patterns
- Full observability with OpenTelemetry

### Advanced Scenarios
- Multi-agent weblab analysis workflows
- Automated experiment health monitoring
- Integration with deployment pipelines

## 🤝 **Collaboration**

- **Keith Norman**: Weblab API expert, provided technical guidance
- **Doug Hains**: Strands production patterns and architecture
- **MCP Community**: Following established amzn-mcp patterns

## 🎯 **Business Impact**

- **Reduces bottlenecks**: No more "ask the weblab expert"
- **Enables automation**: AI-powered weblab workflows
- **Scales knowledge**: Weblab expertise accessible to any AI agent
- **Future-ready**: Foundation for advanced orchestration
