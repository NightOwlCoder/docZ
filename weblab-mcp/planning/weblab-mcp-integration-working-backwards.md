# Working Backwards Document: Weblab MCP Integration

**Date:** September 5, 2025  
**Author:** Sergio Ibagy  
**Status:** Draft for Review

---

## Press Release

### Amazon Launches AI-Powered Weblab Analysis Through Natural Language Interface

**New MCP Integration Enables Developers to Query Experiment Data Using Plain English Commands**

*SEATTLE, WA - September 5, 2025* - Amazon today announced the launch of Weblab MCP Integration, 
a feature that allows developers to analyze weblab experiments using natural language through AI agents. 
The integration connects Amazon's internal Weblab API with the Model Context Protocol (MCP), allowing 
experiment analysis through tools like Amazon Q, Cline, and other AI assistants.

"Previously, analyzing weblab experiments required navigating complex UIs and remembering specific 
experiment IDs," said Sergio Ibagy, Senior Software Engineer at Amazon. "Now developers can ask 'What's the current allocation for my team's experiments?' and get direct answers."

The integration provides five core capabilities:
- **Experiment Search**: Find experiments by creator, team, or status using natural language queries
- **Real-time Status**: Check current allocations and treatment assignments across all realms
- **Change History**: Track experiment modifications with MCM information for compliance
- **Treatment Assignment**: Verify specific user assignments for debugging
- **Detailed Analysis**: Access comprehensive experiment metadata and configuration

Built using Amazon's internal Weblab API with proper authentication and rate limiting, the integration 
provides safe access to weblab data while maintaining service reliability. The system supports both 
individual API keys for power users and a shared community key for casual access.

The Weblab MCP Integration is available to Amazon developers wherever the amzn-mcp server can be 
installed and configured, enabling access through existing AI tools and custom workflows.

---

## FAQ

**Q: What is the Weblab MCP Integration?**  
A: MCP tools that let developers query weblab experiments using natural language through AI agents 
like Amazon Q, RooCode, Cline and others. Anywhere you can install an MCP agent.

**Q: Who is the target audience?**  
A: Amazon developers who work with weblab experiments - engineers, data scientists, PMs, anyone 
who needs to analyze experiment performance or debug experiment behavior.

**Q: How is this different from the existing Weblab UI?**  
A: Instead of navigating web interfaces and remembering experiment IDs, developers ask questions 
in plain English like "Show me all experiments created by my team this month."

**Q: What tools are included?**  
A: Five core tools: search experiments, get experiment details, check allocations, review change 
history, and verify treatment assignments.

**Q: How does authentication work?**  
A: Requires both Midway authentication and API key. Individual API keys provide higher limits 
for power users, shared community key provides basic limits for casual users.

**Q: How do I get started?**  
A: Configure your MCP client (Amazon Q, etc.) to use the amzn-mcp server. Shared access works 
with existing Midway authentication. For individual API keys with higher limits, submit a request 
to the Weblab GenAI team.

---

## Customer Benefits

### Primary Benefits

**1. Simplified Weblab Access**
- **Before**: Navigate Weblab UI, remember experiment IDs, manually correlate data
- **After**: Ask "What experiments is my team running?" and get direct answers
- **Impact**: Eliminates UI navigation friction for routine queries

**2. Natural Language Interface**
- **Before**: Learn Weblab UI navigation, understand experiment terminology
- **After**: Use plain English queries like "Show me experiments with allocation changes this week"
- **Impact**: Reduces learning curve for new team members and occasional users

**3. Multi-Tool Analysis**
- **Before**: Manually gather data from multiple Weblab pages
- **After**: AI agents combine data from multiple tools
- **Impact**: Supports analysis workflows through conversational interface

### Use Case Examples

**Daily Standup**: "What experiments did my team modify yesterday?" → List with change 
details and MCM numbers

**Debugging**: "Why is user ABC getting treatment T1 in experiment XYZ?" → Treatment assignment 
verification with allocation details

**Compliance**: "Show experiments with allocation changes requiring MCM approval this month" → 
Report with MCM numbers and approval status

---

## Technical Approach

### Architecture
```
AI Clients (Amazon Q, RooCode, Cline) 
    ↓ MCP Protocol
amzn-mcp Server (TypeScript)
    ↓ Internal API + Authentication
Weblab API Gateway
    ↓ Rate Limiting
Weblab Services
```

### Key Decisions
- **Internal API Usage**: Uses proper Weblab API endpoints (not internal UI backdoors)
- **Hybrid Authentication**: Individual API keys for power users, shared community key for casual access
- **MCP Integration**: Leverage existing amzn-mcp infrastructure for consistency and community support

### Service Protection
- Rate limiting handled by Weblab API Gateway based on API key
- Shared key: 5 TPS, individual keys: TK TPS with custom limits
- Circuit breaker patterns for fail-fast behavior under load

---

## Success Metrics

### Developer Adoption
- **Active Users**: Track monthly active users of weblab MCP tools
- **Query Volume**: Monitor usage patterns across the 5 weblab tools
- **Feedback**: Collect developer satisfaction and feature requests

### Service Health
- **Response Time**: Monitor API response times for performance
- **Error Rate**: Track tool failures and authentication issues
- **Rate Limiting**: Ensure proper throttling without service impact

---

## Risk Assessment

**Technical Risk**: Weblab service impact from increased usage  
**Mitigation**: Proper rate limiting, coordination with WeblabAPI's team, circuit breakers

**Business Risk**: Low adoption due to setup complexity  
**Mitigation**: Shared community key requires zero setup, clear documentation

**Operational Risk**: Support burden for authentication  
**Mitigation**: Self-service docs, escalation path to WeblabAPI's team

---

## Conclusion

The Weblab MCP Integration enables developers to analyze experiments using natural language queries, 
reducing routine task time while maintaining service reliability. Built on Amazon's internal 
Weblab API with proper authentication and delivered through the amzn-mcp server, it provides scalable 
access for developers with zero setup required for basic usage.

---
file was published to QUIP DOC on 9/25/25:
https://quip-amazon.com/maowAvtplLmZ/Working-Backwards-Weblab-MCP-Integration