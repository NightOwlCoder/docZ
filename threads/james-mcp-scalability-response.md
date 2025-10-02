# Response to James on MCP Scalability

## Draft Response

James,

You raise valid concerns. Here's the actual plan:

## Current State
- **Phase 1 release**: 3 read-only MCP tools (details, allocations, activation_history)
- **Default shared key**: WeblabMCPServer-Weblab-58093 (throttled for testing)
- **BYOK model**: Teams can request their own API keys for higher TPS

## Scaling Plan

When teams need more TPS:
1. **Open a SIM** with use case, benefit estimation, and TPS requirements (per wiki process)
2. **Weblab API team provisions the key** - Added to usage-plans.ts with appropriate limits
3. **Team configures their key** in their MCP config

This is the same documented process weblab API uses today for all consumers (detailed at https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/).

## If we get 100s of SIM tickets

For handling many intake SIMs requesting higher TPS:

1. **Most teams won't need it** - The shared key should handle exploratory/testing use cases
2. **Batch processing** - If we get multiple similar requests, we can handle them together
3. **Standard process** - Weblab API team already handles API key requests today for other consumers
4. **Create tiers if needed** - If volume becomes significant, we could standardize a few TPS levels

Realistically, based on current weblab API usage, we expect:
- Most teams will be fine with the shared throttled key
- A handful might need dedicated keys for production use cases
- This matches the pattern the Weblab API team sees today with other API consumers

## Why start small?

Starting with a throttled shared key lets us:
- See actual adoption patterns (not guesses)
- Understand what teams are trying to do
- Identify the additional tools needed beyond the 3 we will offer

## The holistic vision

You're right - this is just Phase 1 to start the feedback loop. The broader vision includes:
- Adding more tools as the API proxy supports them (search is not available yet for instance)
- Learning from real usage to inform Phase 2
- Potentially building orchestration layers on top

But we need real data from Phase 1 to make informed decisions rather than speculating.

---

The TL;DR: We handle scale the same way weblab API does today - teams request keys via SIM, we provision them with appropriate limits. The infrastructure can handle it.
