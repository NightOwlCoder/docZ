# QUESTIONS TO KEITH
---

Hi Keith!
thanks for the earlier info on the Weblab API approach.
I've been diving deeper into the implementation details and have some technical questions to clarify my design.

# Context
We will build the first weblab MCP tools that will be added to the Amazon Internal MCP Server (amzn-mcp).
The integration flow will be:
**Strands Agents (Python) → MCP Protocol → amzn-mcp (TypeScript) → Weblab API**

# API Analysis
I've analyze danalyzed the WeblabAPIModel (https://code.amazon.com/packages/WeblabAPIModel/blobs/mainline/--/model/main.xml) and found these public operations that map to our initial tools:

- `GetExperiment` → weblab_details tool
- `ListAllocations` → weblab_allocations tool  
- `ListAllocationPeriods` → weblab_activation_history tool

But I notiecd we are missing:
- No search operation → weblab_search tool
- Treatment assignment unclear → weblab_treatment_assignment tool


## Technical Questions

1. API Implementation Details
- what are the full API URLs? How can I access this? Can you give me some sample code?
- How do we call these from TypeScript/Node.js?
- Authentication Path: I'm stil unclear on how to use `/sso/` for Midway auth as you recommended
- Required Headers?

2. Search Implementation 
since there's no search operation in WeblabAPIModel:
- What's the recommended approach dor search?
- Is there an internal search API we could leverage?

3. Treatment Assignment
how can I have access to the current dialed up vcalues?
is there a separate Weblab Allocation Provider API?

### 4. Example API Calls
Cab you point to to exxamples requests/responses for:
- `GetExperiment`
- `ListAllocations`
- `ListAllocationPeriods`

## Our Implementation Approach
I'll be following the amzn-mcp development pattern:
- using MidwayHttpClient for HTTP requests
- follow the existing tool structure (tool.ts, index.ts, tests)
- will try Implementing hybrid authentication (individual keys + shared community key)
- adding proper rate limiting and error handling - still unclear if on the client or your side ?!?!?!


---
# converted to Sergio's style

Hey Keith!
Quick follow-up on the weblab MCP stuff we discussed...

I dug into the WeblabAPIModel you shared and found some gaps that need clarification before we start coding:

Good news: 3 of our 4 tools map perfectly to existing operations:

GetExperiment → weblab_details
ListAllocations → weblab_allocations
ListAllocationPeriods → weblab_activation_history


The problems:

1. No search operation in WeblabAPIModel - confirms what you said about search limitations. How should we handle weblab_search? 


2. Treatment assignment unclear
how can I have access to the current dialed up vcalues?
is there a separate Weblab Allocation Provider API?



Technical implementation questions:

What are the exact API base URLs? (prod/beta environments)
Authentication: use /sso/ path with Midway? What headers needed?
Request format: REST calls with JSON? Any specific payload structure?
Any TypeScript SDK or just direct HTTP calls?
Could you share example requests/responses for GetExperiment, ListAllocations, ListAllocationPeriods? Would help us understand the data formats.

if yuo can point me to any sampe code, that would help imensely!

Thanks! 👍

---
# KEITH REPLY
---
Keith Norman
hey dude sorry i missed this message
so, the API is just a proxy basically, and the only limitations are about which of our existing services have been configured on that proxy.
so, if we wanted to add search service to the proxy i don't see any reason why we couldn't or shouldn't. There's some minimal work to configure it. The main work tends to be in convincing people it's ok to move a service to the api even if the service doesn't perfectly adhere to our existing api standards. Ampl owns search service so you could engage Arpit on the topic of moving search service to the api

https://code.amazon.com/packages/WeblabAPIExternalModel/blobs/87d876e88ce8d3c99516d2a45a558df39cbad571/--/model/allocation-operation.xml#L116 that will get your current allocations

some code packages that might be helpful
https://code.amazon.com/packages/WeblabAPITypescriptClient/trees/mainline - this is what UI app uses, but it just generates types from coral models, it doesn't actually generate a client
https://code.amazon.com/packages/HarmonyWeblabClient-JS/trees/mainline - this is the client that content symphony uses and was created by the dude that wrote the API intially (which was done by an away team)

urls and auth options should be all explained here https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/ .. i think you'll want to use midway. All you need is valid midway and an API key (there's an example of calling via midway halfway down that page that should work for you in terminal)

