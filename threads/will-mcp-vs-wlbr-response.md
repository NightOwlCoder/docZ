# Response to Will: MCP vs wlbr.ai

## Ask
This is the very beginning of your direct message history with @aarongpm, @jmcq, and @willpoff

Sergio Ibagy  16:13
I'm taking a shot at writing the launch announcement, I will need you guys help with it though

Sergio Ibagy  18:56
Here is a draft for the announcement:
https://quip-amazon.com/yORvAmA1qnLA/Weblab-MCP-Launch-Announcement

Will Poff  12:10
Thanks Sergio for sending! Can we get more specific on the exact things people could do? In reading this I am finding myself wondering why we wouldn't use the wlbr.ai backend that Doug/Brent/etc have put together so that we could just enable a general chatbot on weblab app to do these things listed. Is there something I am missing i.e. ability to combine with other MCP's for queries like 'get me the data on weblab X from weblab and from xyz tool?' i.e. right now the customer benefit is not coming through to me outside of what we have technically enabled

## Answer

Hey Will,
great question! The key difference is *interoperability vs specialization*:

*wlbr.ai (Specialized Agent)*
- *Single-purpose*: A trained model specifically for Weblab queries
- *Lives in one place*: Only available in the Weblab app
- *Isolated knowledge*: Can't combine with other data sources

*MCP Tools (Protocol for Any AI)*
- *Universal access*: ANY AI agent can use these tools - Amazon Q, Cline, Claude, Roo, etc.
- *Lives everywhere*: In developers' existing AI workflows (their IDE, terminal, etc)
- *Composable*: Combine Weblab data with other tools in a single query

*Real Examples of Why This Matters*

Cross-Domain Queries (not possible with wlbr.ai alone):
```
"Check if experiment WEBLAB_X has any SIM tickets filed, then create a 
summary Quip doc with the experiment details and SIM status"
```
- Uses: weblab_details + SIM search + Quip creation

```
"Get the activation history for my experiment and check if any of the 
operators are currently oncall"
```
- Uses: weblab_activation_history + oncall lookup

```
"Compare my experiment's allocations with the Pipeline deployment status 
and alert me if they're out of sync"
```
- Uses: weblab_allocations + Pipeline tools


*Developer Workflow Integration:*
- *In their IDE*: "Generate unit tests for this code based on experiment WEBLAB_Y's configuration"
- *During debugging*: "Check if this bug correlates with any weblab activations today"
- *Code review*: "Verify this CR's changes match the weblab treatment descriptions"



*The Bottom Line*

*wlbr.ai*: Excellent for Weblab-specific questions in the Weblab UI
*MCP tools*: Enables Weblab data to be part of ANY AI workflow

They're complementary, not competing. `wlbr.ai` gives you a specialized expert in the Weblab app. MCP makes Weblab data available to every AI tool developers already use.

Think of it like this:
- `wlbr.ai` = A Weblab expert sitting in the Weblab office
- MCP = Weblab data available via API to any system that needs it

The real power comes when developers can ask their AI assistant to correlate Weblab data with logs, metrics, code changes, tickets, and deployments - all in one conversation.