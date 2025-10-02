Sergio Ibagy
  10:42
hey! I was just told that we probably can join forces?
Renato has asked me to think about our "MCP story", and lookk like you are also doing the same?


Doug Hains
  10:47
yeah!
10:47
this is awesome because honestly i have been focused on about 20 different things so having partner here would be great as i havne’t really been able to move it along as fast as I ouwld like
10:48
I think MCP is really important for us to start investing in, but we have alos been focused on rolluing out early user facing AI products and since we don’t yet have remote MCP servers at Amazon, it limits usage in what we build unless we have a requirement that our customers have local MCP server installed (edited) 
10:49
So I still want to keep iterating on  MCP for our use cases cause it sems like thats the future, but also limited since I can’t leverage it yet in our user facing applications (edited) 
10:50
so yay glad to see more people getting interesting in this space so we can move it forward.


Sergio Ibagy
  10:50
yes, that aligns with wht Renato has asked me


Doug Hains
  10:50
i dunno if you have looked at langchain either? it has MCP adapters to expose MCP tools, but you can also develop langchain tools that can be run server side


Sergio Ibagy
  10:51
I'll start the investigation this next sprint (starts Monday) so let's sit later and I'll show you what I have?


Doug Hains
  10:51
i’ve been playing with idea of like having our agents in langchain so we can use MCP tools for internal,local use
10:51
but then also have langchain tools that we could push server side if we want to productionize something for customers until Amazon has remote MCP servers
10:52
yeah lets set up a meeting and chat
10:53
MCP is awesome for dev atm but like a PM who wants to use them its harder, and especially if we want to integrate in the Weblab App, so have been thinking about how to enable MCP for us and other devs who are fine with installing everything locally, but also how to bridge the gap to production/server-side tooling


Sergio Ibagy
  10:53
talking to builder tools people I think the best idea right now is to add our code to àmzn-mcp` as a 1st step, to stop the "need weblab" requests and code craziness and later we move into the server land
builders are actually worjing on that too, on how to enable that for the whole amzn


Doug Hains
  10:53
yup
10:53
so maybe we just wait for the remote servers


Sergio Ibagy
  10:54
a PM will have to use AMZN Q
it's simple and soon will come with AMZN-MCP installed


Doug Hains
  10:54
Right on, so there’s those genreal use cases agree that Q can help
10:55
but then there’s like WLBR write-ups and things like the SIP integration where we want more control over the agent process
10:55
these can also leverage AMZN-MCP
10:56
but need a little more structure on top, and ability to run server-side, thats where something like langchain comes in I think. but anyway yeah lets focus on getting this stuff exposed in AMZN-MCP as first step totally agree!
:+1:
1



Sergio Ibagy
  11:01
I will probably take 2-3 days organizing all the mess I have collected so far, as soon as I have something "readable", I'll schedule something with you
New


Doug Hains
  11:01
haha sounds awesome! I know my stuff is same way
11:02
its been kind of like 3rd order hack project, after my 2nd and 1st prioritized hack projects that all come after my real work lol
11:02
so my stuff is pretty messy too totally get it


Sergio Ibagy
  11:03
same, but what will change for me is that now "the boss" asked me to do it. so I'll create the bandwidth for it
:raised_hands:
1



Doug Hains
  11:03
yes thats super exciting