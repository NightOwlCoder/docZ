# Message for Keith Norman

Hi Keith,

Quick update on the weblab MCP integration. We have weblab_details working perfectly, but weblab_allocations hangs indefinitely. Both use identical authentication (Content Symphony key + beta harmony origin), but different endpoints.

**Working**: `/sso/experiment/v1?experimentId=...` → returns 200 OK with data
**Hanging**: `/sso/allocations?experimentId=...` → hangs, no response

I've created detailed curl examples in the attached file showing exactly what works vs what hangs.

**Quick questions:**
1. Is `/sso/allocations?experimentId=...` the correct path for ListAllocations?
2. Should we route directly to `allocation.weblab.amazon.dev` instead of through the main gateway?
3. Any known issues with allocations endpoint in BETA?

The experiment endpoint works flawlessly with your guidance, so we're close! Just need to figure out the allocations path.

Thanks!
Sergio

---

**Attachment**: curl-examples-for-keith.md (detailed examples with exact commands)