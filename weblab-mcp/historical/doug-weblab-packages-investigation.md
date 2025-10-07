# Doug's Weblab Packages Investigation

**Date**: 9/23/2025  
**Investigator**: Kova (for Sergio)  
**Purpose**: Understanding how Doug's packages access Weblab data

## Executive Summary

Doug has created multiple packages for Weblab, but only one actually accesses Weblab data directly. His approach uses API key authentication combined with cookies through a proxy layer, designed for browser-based Harmony UI integration.

## Package Overview

### 1. WeblabLearningAppBackendPython - AI Service (No Direct Data Access)

**Purpose**: WLBRai (Weblab Bar Raiser AI) - AI-powered clarification service  
**What it does:**
- Helps experimenters write better Weblab experiment descriptions
- Uses Amazon's Strands agents framework with Claude Sonnet models
- Focuses on making descriptions clear, specific, and customer-focused
- Implements Socratic questioning to improve documentation

**What it doesn't do:**
- ❌ No direct Weblab API integration
- ❌ Doesn't fetch experiment data, metrics, or allocations
- ❌ Only receives weblab_id and descriptions as input parameters

**Tech Stack:**
- Framework: Strands agents (Amazon's internal AI framework)
- Model: Claude Sonnet 4 (`us.anthropic.claude-sonnet-4-20250514-v1:0`)
- Deployment: Python Lambda functions with CDK
- Session Management: S3-based conversation persistence
- Observability: OpenTelemetry instrumentation

### 2. HarmonyWeblabClient-JS - The Actual Data Access Client ✅

**Purpose**: JavaScript client library for accessing Weblab data from Harmony UI

**Authentication Method:**
- API key authentication via `x-api-key` header
- Cookie-based credentials using `xhr.withCredentials = true`
- Uses Amazon's IDP xhr for requests (`window.Amazon.IDP.xhr()`)

**Endpoints:**
- Beta: `https://api.us-east-1.beta.api.weblab.amazon.dev`
- Prod: `https://api.us-east-1.prod.api.weblab.amazon.dev`

**Available Operations:**
```javascript
// Create new experiment
createExperiment(input: CreateExperimentInput, weblabApiKey: string)

// Update existing experiment
updateExperiment(experiment: Experiment, weblabApiKey: string)

// Fetch experiment details
getExperiment(experimentId: string, weblabApiKey: string)

// Get allocation data
listAllocations(experimentId: string, weblabApiKey: string, domain?: string, marketplaceId?: string)
```

**Implementation Details:**
- Integrates with Harmony UI (`window.harmony.api`)
- Uses promise-based async/await pattern
- Includes error handling with HttpError class
- Stage detection for endpoint selection (beta vs prod)

### 3. WeblabAPI - Routing/Proxy Layer

**Purpose**: Routes requests to various Weblab microservices

**Microservices Routed:**
- **Experiment Service**: `https://api.us-east-1.{stage}.experiment.weblab.amazon.dev`
  - Resources: experiment, experiments, experimentauthorization, trackedmetrics
  
- **Metric Service**: `https://api.us-east-1.{stage}.metric.weblab.amazon.dev`
  - Resources: metric, metrics, dimension, metricset, inputdataset
  
- **Allocation Service**: `https://api.us-east-1.{stage}.allocation.weblab.amazon.dev`
  - Resources: allocations, allocationperiods, rollbackmonitors
  - Includes throttling configuration
  
- **Review Service**: `https://api.us-east-1.{stage}.review.weblab.amazon.dev`
  - Resources: review, reviews, reviewactor, sim
  
- **Policy Service**: `https://api.us-east-1.{stage}.policy.weblab.amazon.dev`
  - Resources: policyviolations, experimentpolicies, defaultlaunchcriteria
  
- **Outcome Service**: `https://api.us-east-1.{stage}.outcome.weblab.amazon.dev`
  - Resources: outcome, outcomes

**Features:**
- Supports both HTTP endpoints and Lambda functions
- Environment-specific routing (Dev, Beta, Prod)
- Method-specific throttling options
- Microservice configuration management

### 4. WeblabLearningAppBackendCDK - Infrastructure

**Purpose**: CDK infrastructure for deploying the WLBRai service

**Key Components:**
- API Gateway with IAM/Midway authentication
- Lambda functions with Bedrock permissions
- S3 bucket for Strands session management
- CloudWatch monitoring and canaries
- Stage-specific deployments (beta, prod)

## Comparison: Doug's Approach vs Our MCP Server

| Aspect | Doug's HarmonyWeblabClient | Our Weblab MCP Server |
|--------|---------------------------|------------------------|
| **Primary Purpose** | Harmony UI integration | AI agent/LLM tools |
| **Technology** | JavaScript/TypeScript | TypeScript MCP protocol |
| **Authentication** | API key + cookies | Cookie-based only |
| **Endpoint Access** | Through proxy (`api.weblab.amazon.dev`) | Direct service calls |
| **Client Type** | Browser-based | Server-side |
| **Operations** | CRUD for experiments | Read-only data access |
| **Use Cases** | Creating/updating experiments | Fetching data for analysis |
| **Protocol** | HTTP with XHR | MCP over stdio/HTTP |
| **Deployment** | Part of Harmony UI | Standalone MCP server |

## Key Insights

1. **Authentication Strategy**: Doug uses dual authentication (API key + cookies) for enhanced security in browser environments. This is more complex than our cookie-only approach but provides additional security layers.

2. **Proxy Pattern**: The WeblabAPI proxy layer provides a unified interface to multiple microservices. This abstracts complexity but adds an additional hop.

3. **Separation of Concerns**: Doug clearly separates:
   - AI/ML functionality (WLBRai)
   - Data access (HarmonyWeblabClient)
   - Routing/proxy (WeblabAPI)
   - Infrastructure (CDK)

4. **Browser vs Server**: Doug's solution is optimized for browser-based access (using window.Amazon.IDP.xhr), while our MCP server is designed for server-side AI agent access.

## Recommendations

1. **Consider API Key Authentication**: Doug's dual authentication approach might be worth exploring for additional security in our MCP server.

2. **Proxy Layer Benefits**: The proxy pattern could simplify our MCP server by providing a single endpoint for all Weblab services.

3. **Microservice Documentation**: Doug's microservice configuration provides excellent documentation of available Weblab services and their endpoints.

4. **Complementary Solutions**: Doug's WLBRai and our MCP server are complementary:
   - WLBRai: Helps write better experiment descriptions
   - MCP Server: Provides data access for analysis and automation

## Files Investigated

- `WeblabLearningAppBackendPython/src/weblab_learning_app_backend_python/`
- `WeblabLearningAppBackendCDK/lib/serviceStack.ts`
- `WeblabAPI/src/micro-services.ts`
- `HarmonyWeblabClient-JS/src/index.ts`
- `HarmonyWeblabClient-JS/src/utils/xhr.ts`

## Conclusion

Doug's packages demonstrate a sophisticated approach to Weblab integration with clear separation of concerns. The HarmonyWeblabClient-JS provides the actual data access using API key authentication, while the other packages handle AI services, routing, and infrastructure. This architecture could provide valuable patterns for enhancing our own Weblab MCP server implementation.

CLR: 99%
