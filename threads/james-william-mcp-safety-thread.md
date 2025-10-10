# James McQueen & William Josephson - MCP Safety Discussion

**Date:** October 9, 2025  
**Participants:**
- William Josephson (wkj) - PE, providing strategic guidance
- James McQueen (jmcq) - Skip manager
- Sergio Ibagy (sibagy) - Weblab MCP implementation
- Vignesh Kannappan (kannappa) - Skip manager

**Context:** [CORAL-3013] MCP putting Weblab availability at risk

---

## Key Decision (William's Guidance)

> "I think we need to be clear, crisp, and repetitive in our messaging. I'd even put it on the Weblab wiki and link it to the ticket: **we're doing MCP but for 2025 it is read-only to protect the safety of the control plane.** Just to keep a lid on the inevitable churn. I would seek feedback from ASBX about whether to include Weblab in builder-mcp or expose separately; it is widely enough used that it could go either way. If separately it should be in the mcp registry."

**James's Response:** "I like the highlighted idea. Will do."

---

## Full Email Thread

### From: James McQueen
**Date:** Thursday, October 9, 2025 at 4:33 PM

> I like the highlighted idea. Will do.

---

### From: William Josephson  
**Date:** Thursday, October 9, 2025 at 4:32 PM

> (merge)
> 
> Great – sounds as though you are on top of it. There are strategies for selectively enabling/swapping tools, which seems like a better approach but I assume ASBX has more experience than I do on that front. Certainly token management is a consideration. Please do share the roadmap once you have it; I will follow with interest.
> 
> Previously:
> 
> Got it. I know I'm being a bit of a pedant here, but I think we need to be clear, crisp, and repetitive in our messaging. I'd even put it on the Weblab wiki and link it to the ticket: we're doing MCP but for 2025 it is read-only to protect the safety of the control plane. Just to keep a lid on the inevitable churn. I would seek feedback from ASBX about whether to include Weblab in builder-mcp or expose separately; it is widely enough used that it could go either way. If separately it should be in the mcp registry.

---

### From: Sergio Ibagy
**Date:** Thursday, October 9, 2025 at 7:10 PM

> Unfortunately our delivery vehicle, amzn-mcp changed their stance, and they are on KTLO mode now.
> They want teams to have their own MCP, just because that MCP itself already had over 150 tools, what was consuming most of the tokens on a session.
> 
> Now with the MCP everywhere mandate, we have a roadmap to implement this is a different way. Roadmap will be finalized by month's end, where I can share details.

---

### From: James McQueen
**Date:** Thursday, October 9, 2025 at 3:33 PM

> The last discussion we had was as Stewart points out in the SIM (1) they aligned that Weblab should NOT fall within the automated enablement and (2) read only access via MCP should suffice for any cross-cutting-initiative. We already have some progress on that front (read only access via MCP), although it sounds like they're moving away from the amazon-wide MCP model? Do you have any context on that? +Sergio Ibagy who has been working on this.

---

### From: William Josephson
**Date:** Thursday, October 9, 2025 at 3:00 PM

> Hey James and Vignesh,
> 
> The weblab MCP issue is rearing its head again. What did we decide for this year? I thought we had some mitigations in mind to implement. Weblab can't prevent browser-based automation, so I would think we'd want to encourage a path where we have visibility to what SDEs will do with or without our say-so.
> 
> -William

---

## Background: [CORAL-3013] SIM Ticket

### From: Stewart Winter (sjwinter)
**Date:** Thursday, October 9, 2025 at 2:43 PM

> @sinmadhj ... definitely not. Central Reliability and Response Engineering [https://w.amazon.com/bin/view/CRRE/] have determined that MCP servers such as the one listed on this SIM a significant risk to most of our tier-1 services across Amazon. The Weblab team has the creation of safe MCP server(s) on its 2026 roadmap.

**Original Issue (Created May 21, 2025):**
> An engineer (nicksde@) from sponsored products added an MCP registration for weblab functionality. Unfortunately, the implementation puts weblab's availability at risk and by extension potentially many tier-1 services across Amazon.
> 
> We need this rolled back. nicksde@ is on vacation and he asked me to file this ticket requesting that ASBX do the rollback.
> 
> Requesting that this rollback be done ASAP.
> 
> This is the CR: https://code.amazon.com/reviews/CR-196833998

**Status:** Resolved (CR was reverted)

---

## Key Takeaways

### Strategic Direction (2025-2026)

**2025 Scope (P0):**
- Read-only MCP tools only
- Protect control plane availability
- No write operations (create/modify experiments, dial up/down)

**2026 Roadmap (Future):**
- Safe MCP server implementation
- Write capabilities considered after safety measures proven
- Full MCP integration

### Technical Decisions

**1. Safety First:**
- Tier-1 service availability is non-negotiable
- Read-only access mitigates availability risk
- Write operations deferred to 2026

**2. Delivery Approach:**
- Cannot use amzn-mcp (150+ tools, token consumption issues)
- Team-owned MCP server required
- MCP Everywhere mandate drives remote-first architecture

**3. Registry Strategy:**
- Must be in MCP registry (confirmed)
- Decision needed: builder-mcp inclusion vs separate exposure
- Action: Seek ASBX feedback on integration approach

### Messaging Requirements (William's Directive)

**Must communicate clearly and repetitively:**
1. MCP for Weblab IS happening
2. 2025 scope is read-only only
3. Reason: Protect control plane safety
4. Full implementation on 2026 roadmap

**Where to message:**
- Weblab wiki
- Link from [CORAL-3013] ticket
- All MCP documentation
- Stakeholder communications

---

## Action Items for Sergio

### Immediate (This Week)

- [x] Archive this thread
- [ ] Update roadmap to clarify read-only 2025 scope
- [ ] Update all MCP docs with safety messaging
- [ ] Add clear statement to README

### Short-term (By End of October)

- [ ] Finalize 2025 roadmap with read-only focus
- [ ] Share roadmap with William (he requested to follow)
- [ ] Add messaging to Weblab wiki
- [ ] Link wiki to [CORAL-3013] ticket

### Strategic (Q4 2025)

- [ ] Seek ASBX feedback: builder-mcp vs separate
- [ ] Register in MCP registry
- [ ] Document safety measures for 2026 write operations

---

## References

- **SIM Ticket:** [CORAL-3013] MCP putting Weblab availability at risk
- **Blocked CR:** https://code.amazon.com/reviews/CR-196833998
- **CRRE Safety Guidance:** https://w.amazon.com/bin/view/CRRE/
- **Related:** docs/threads/chetan-amzn-mcp-thread.md (amzn-mcp deprecation context)

---

## Decision Authority

- William Josephson (PE) - Strategic guidance on safety approach
- James McQueen (skip manager) - Approved safety-first approach
- Stewart Winter - CRRE representative, blocked unsafe implementation
- Central Reliability and Response Engineering - Final authority on tier-1 service safety

---

**Key Quote to Remember:**

> "we're doing MCP but for 2025 it is read-only to protect the safety of the control plane"
> 
> — William Josephson, PE

This is now the official position and must be communicated clearly and repeatedly.
