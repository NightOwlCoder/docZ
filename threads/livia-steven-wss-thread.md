Sergio Ibagy
  15:07
Hey @liviast and @gyuzhan
as you may know, I've been working on the Weblab MCP Integration - bringing Weblab capabilities to AI assistants like Amazon Q and Cline through the Model Context Protocol.
Keith has been incredibly helpful getting me started with the existing APIs!
We've successfully implemented tools for:
weblab_details - Get experiment metadata
weblab_allocations - Check treatment allocations
weblab_activation_history - Track allocation changes
But we're missing a Search API to enable natural language queries like:
What are my active weblabs?
Show me all experiments owned by my team
Find experiments modified this week
List experiments in PILOT realm
Without search, users need to know exact experiment IDs, which limits the MCP's usefulness for discovery workflows.
The ask:
Is there an existing Search API endpoint we could leverage? (similar to /sso/experiments/{id} but for search)
If not, would it be feasible to expose one?
Alternatively, could you guide me on how to implement this myself?
Technical details:
We're using the Weblab API Gateway (api.us-east-1.prod.api.weblab.amazon.dev)
Authentication via Midway + API keys
TypeScript implementation in amzn-mcp server
Following the same patterns as existing endpoints
We built our tools based on the WeblabAPIModel package (code.amazon.com/packages/WeblabAPIModel) and WeblabAPI docs that Keith pointed us to - would love to add Search to complement the existing endpoints.
The key references Keith provided:
WeblabAPIModel: code.amazon.com/packages/WeblabAPIModel/blobs/mainline/--/model/main.xml
WeblabAPI: code.amazon.com/packages/WeblabAPI
Wiki: w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI
Happy to discuss requirements, contribute to implementation, or work with whatever constraints you have. Let me know how I can help move this forward!
Thanks!
Link to Working Backwards doc
https://quip-amazon.com/maowAvtplLmZ/Working-Backwards-Weblab-MCP-Integration


Steven Guo
  15:55
Hi Sergio, I know there is a WeblabSearchService. I am not very familiar with this package, but I would recommend you reach out to AMPL who owns the service. As far as I know, this service is in MAWS and is not onboarded to Weblab API Gateway, and only way to access it is CloudAuth (edited) 


Sergio Ibagy
  16:33
Yeah, Keith told me abou that... the question here is what would it take to do something similar in the weblab api?


Steven Guo
  16:44
I am not sure if we can onboard a MAWS service to Weblab API Gateway. If it’s not possible, you might want to consider creating a wrapper around WeblabSearchService with a fargate or lambda service?


Livia Stanley
  17:04
hey! Yeah I also don't know much about WeblabSearchService. Maybe we could create a new API micro service (such as WeblabExperimentAPI/WeblabAllocationAPI/etc), which would be available behind the Weblab API Gateway, and then it could query the WSS? I'm not sure how much overlap there is between WSS and WSTLake. Maybe it would be easier to just query WSTLake instead of WSS, but I'm not sure. As long as we could create a link between NAWS (the api microservice) and MAWS (WSS/WSTLake), then I think we'd be good to go.


Sergio Ibagy
  17:14
humm, that is good info Livia, so the data to answer these questions are on WSTLake? that is where the WeblabSearchService gets it from?


Livia Stanley
  17:17
Yes I think a lot of those questions can be answered be answered from WSTLake tables. (I can’t remember if it has domain info, it probably does.) I don’t know if WSS queries WSTLake or not, but I’ve always thought of those as having similar data, so it might. But AmpL owns both so they should be able to help with any specific questions about them.


Sergio Ibagy
  17:40
who is Ampl? Arpit?


Livia Stanley
  17:41
Yes! Arpit and everyone under YJ.


Steven Guo
  17:41
https://code.amazon.com/packages/WeblabSearchService/permissions