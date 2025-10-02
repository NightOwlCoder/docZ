**sibagy** (2025-06-03 10:42:07 PDT):
hey! I was just told that we probably can join forces?
Renato has asked me to think about our "MCP story", and lookk like you are also doing the same?

**dhains** (2025-06-03 10:47:25 PDT):
yeah!

**dhains** (2025-06-03 10:47:59 PDT):
this is awesome because honestly i have been focused on about 20 different things so having partner here would be great as i havne’t really been able to move it along as fast as I ouwld like

**dhains** (2025-06-03 10:48:59 PDT):
I think MCP is really important for us to start investing in, but we have alos been focused on rolluing out early user facing AI products and since we don’t yet have remote MCP servers at Amazon, it limits usage in what we build unless we have a requirement that our customers have local MCP server installed

**dhains** (2025-06-03 10:49:44 PDT):
So I still want to keep iterating on  MCP for our use cases cause it sems like thats the future, but also limited since I can’t leverage it yet in our user facing applications

**dhains** (2025-06-03 10:50:11 PDT):
so yay glad to see more people getting interesting in this space so we can move it forward.

**sibagy** (2025-06-03 10:50:49 PDT):
yes, that aligns with wht Renato has asked me

**dhains** (2025-06-03 10:50:50 PDT):
i dunno if you have looked at langchain either? it has MCP adapters to expose MCP tools, but you can also develop langchain tools that can be run server side

**sibagy** (2025-06-03 10:51:18 PDT):
I'll start the investigation this next sprint (starts Monday) so let's sit later and I'll show you what I have?

**dhains** (2025-06-03 10:51:21 PDT):
i’ve been playing with idea of like having our agents in langchain so we can use MCP tools for internal,local use

**dhains** (2025-06-03 10:51:48 PDT):
but then also have langchain tools that we could push server side if we want to productionize something for customers until Amazon has remote MCP servers

**dhains** (2025-06-03 10:52:03 PDT):
yeah lets set up a meeting and chat

**dhains** (2025-06-03 10:53:29 PDT):
MCP is awesome for dev atm but like a PM who wants to use them its harder, and especially if we want to integrate in the Weblab App, so have been thinking about how to enable MCP for us and other devs who are fine with installing everything locally, but also how to bridge the gap to production/server-side tooling

**sibagy** (2025-06-03 10:53:30 PDT):
talking to builder tools people I think the best idea right now is to add our code to àmzn-mcp` as a 1st step, to stop the "need weblab" requests and code craziness and later we move into the server land
builders are actually worjing on that too, on how to enable that for the whole amzn

**dhains** (2025-06-03 10:53:42 PDT):
yup

**dhains** (2025-06-03 10:53:53 PDT):
so maybe we just wait for the remote servers

**sibagy** (2025-06-03 10:54:16 PDT):
a PM will have to use AMZN Q
it's simple and soon will come with AMZN-MCP installed

**dhains** (2025-06-03 10:54:46 PDT):
Right on, so there’s those genreal use cases agree that Q can help

**dhains** (2025-06-03 10:55:28 PDT):
but then there’s like WLBR write-ups and things like the SIP integration where we want more control over the agent process

**dhains** (2025-06-03 10:55:49 PDT):
these can also leverage AMZN-MCP

**dhains** (2025-06-03 10:56:24 PDT):
but need a little more structure on top, and ability to run server-side, thats where something like langchain comes in I think. but anyway yeah lets focus on getting this stuff exposed in AMZN-MCP as first step totally agree!

**sibagy** (2025-06-03 11:01:22 PDT):
I will probably take 2-3 days organizing all the mess I have collected so far, as soon as I have something "readable", I'll schedule something with you

**dhains** (2025-06-03 11:01:51 PDT):
haha sounds awesome! I know my stuff is same way

**dhains** (2025-06-03 11:02:20 PDT):
its been kind of like 3rd order hack` project, after my 2nd and 1st prioritized hack projects that all come after my real work lol

**dhains** (2025-06-03 11:02:41 PDT):
so my stuff is pretty messy too totally get it

**sibagy** (2025-06-03 11:03:06 PDT):
same, but what will change for me is that now "the boss" asked me to do it. so I'll create the bandwidth for it

**dhains** (2025-06-03 11:03:18 PDT):
yes thats super exciting

**sibagy** (2025-06-03 16:13:02 PDT):
Hey, can you share with me a little bit of the reason behind you brought langchain to the table? Do we need this to be a python available tool?


> The LangChain MCP Adapters (introduced in early 2025) provide a lightweight wrapper to make Anthropic’s MCP tools compatible with LangChain’s tooling and agent ecosystem [github.com](http://github.com). In practical terms, this adapter converts any MCP-exposed tool into a LangChain Tool object, allowing LangChain agents to invoke MCP tools as if they were native LangChain tools [changelog.langchain.com](http://changelog.langchain.com). Under the hood, the adapter uses Anthropic’s MCP Python SDK and client-server architecture: it can connect to one or multiple MCP servers, query the list of available tools, and wrap each tool’s API (name, input parameters, and docstring) into a LangChain Tool with an appropriate callback.

**dhains** (2025-06-03 16:14:14 PDT):
its python,JS and they just released it for TS as well

**dhains** (2025-06-03 16:16:37 PDT):
it provides orchestration, so you don’t need to it use MCP, as long the foundational model supports MCP (which pretty they all do now) then teh agent cna orchestrate the MCP calls

**sibagy** (2025-06-03 16:17:49 PDT):
yeah, but why we need that? we want to expose commands via the MCP protocol no an LLM, that has its own set of "MCP capabilities" right?
if you look at the implementation of any new feature on amzn-mcp, I do not see langchain in it...

**dhains** (2025-06-03 16:18:06 PDT):
but lets say we want to make sure the agent follows a deterministic decision tree to make a launch decision, then use a specific tool to validate its decision.

**dhains** (2025-06-03 16:18:10 PDT):
yea hwe don’t need it for MCP

**dhains** (2025-06-03 16:18:33 PDT):
we need it or something like it to provide deterministic orchestration

**dhains** (2025-06-03 16:18:56 PDT):
if you just leave it up to the agent there is too much non-determinism

**dhains** (2025-06-03 16:19:06 PDT):
for *some* of our use cases, not all

**dhains** (2025-06-03 16:19:22 PDT):
but its on the client side, not the server side

**dhains** (2025-06-03 16:19:51 PDT):
so if you are just focused on enabling MCP on Amazon’es internal MCP server then i don’t think you need to worry about it

**dhains** (2025-06-03 16:20:03 PDT):
but for like SIP integration, we are making heavy use of AMZN_MCP

**dhains** (2025-06-03 16:20:36 PDT):
but, we alos need it to follow a deterministic process

**dhains** (2025-06-03 16:21:15 PDT):
even an agent script, like the ones thye have in the GenAI power user packages, the agent can sometimes ignore the constraint

**dhains** (2025-06-03 16:21:49 PDT):
but if we are trying to automate processes that have real consequences (eg launching something, making code changes etc)

**sibagy** (2025-06-03 16:22:35 PDT):
your "agent" uses MCP, MCP would not and can't not orchestrate its usage...
we are probably talking about different technolgies here?

Script based orchestration like you can see here:
<https://code.amazon.com/packages/AmazonBuilderGenAIPowerUsersQContext/blobs/mainline/--/scripts/weblab-reviewer.script.md>

or here:
<https://docs.cline.bot/features/slash-commands/workflows#real-world-example>

**dhains** (2025-06-03 16:22:37 PDT):
then we need something that can enforce some steps, so the agent still calls MCP and makes use of AMZN_MCP server, but it follows a series of processes defined in langchain

**sibagy** (2025-06-03 16:23:06 PDT):
yep, looks like script based orchestration

**dhains** (2025-06-03 16:23:17 PDT):
Yup that’s it

**sibagy** (2025-06-03 16:23:19 PDT):
read both linkes above

**dhains** (2025-06-03 16:23:31 PDT):
Right I mention the GenAI scripts above

**dhains** (2025-06-03 16:23:38 PDT):
those constriants aren’t always followed

**sibagy** (2025-06-03 16:23:51 PDT):
the PR one is amazing, it can follow rules, I tested that with my personal githib projects and it is interesting to see

**dhains** (2025-06-03 16:24:07 PDT):
for sure, the demos are amazing, and for certain tasks that’s all you need

**dhains** (2025-06-03 16:24:24 PDT):
but there is still non-determinism in those natural language agent scripts

**dhains** (2025-06-03 16:24:35 PDT):
it sometimes does not follow the constraints, or all the steps

**sibagy** (2025-06-03 16:24:40 PDT):
&gt; those constriants aren’t always followed
that is something we will need to solve, there is even a new amazon tech for that

**sibagy** (2025-06-03 16:25:02 PDT):
<https://w.amazon.com/bin/view/ARG/Socrates>

**dhains** (2025-06-03 16:25:14 PDT):
Right - you asked why I mentioned langchain, langchain is a solution for that

**sibagy** (2025-06-03 16:25:39 PDT):
it can't be.... I'm probaly lost :smile:

**dhains** (2025-06-03 16:25:44 PDT):
Yes Socrates i have requested access, but from my understanding its more about AR

**sibagy** (2025-06-03 16:25:53 PDT):
langchain is on the tool side...

**dhains** (2025-06-03 16:26:01 PDT):
right but it provides orchestration as well

**dhains** (2025-06-03 16:26:11 PDT):
let me find an example

**dhains** (2025-06-03 16:27:13 PDT):
langchain allows peopple to write tools too but it has MCP connectors so you can just have it use MCP

**sibagy** (2025-06-03 16:27:16 PDT):
LLM -&gt; MCP CALL -&gt; MCP WORKS AS LONGS AS IT NEEDS -&gt; RETURN INFO TO LLM
is the diagram above diff from what you have in mind??

**dhains** (2025-06-03 16:27:37 PDT):
for one call no different

**dhains** (2025-06-03 16:27:44 PDT):
but take a step back

**dhains** (2025-06-03 16:28:02 PDT):
when the task requires multiple MCP calls and steps

**dhains** (2025-06-03 16:28:33 PDT):
thats what I mean by orchestration

**dhains** (2025-06-03 16:28:51 PDT):
the natural language scripts in GenAIPowerUsers package are one way to do it

**dhains** (2025-06-03 16:28:57 PDT):
and for some use cases that works well enough

**dhains** (2025-06-03 16:30:06 PDT):
but if you have tasks where you need to guarantee agent always follows series of steps, use specific tools, etc - those scripts cannot enforce that

**dhains** (2025-06-03 16:30:33 PDT):
at least at the moment :slightly_smiling_face: like you said its a problem to solve

**sibagy** (2025-06-03 16:31:04 PDT):
yep, I got wht you say, but there are 2 totally diferent scenarios in my opinion:

1. a person using Q CLI (or any other LLM chat tool MCP capable) can query weblab for 1 single command, like `what is the current alocation for weblab XYZ`
2. we are developing a tool that will used orchestration and data (that can even come from MCP) to display additional reasoning information on our UI

**dhains** (2025-06-03 16:31:06 PDT):
langchain provides more control and determinism on the orchestration layer

**dhains** (2025-06-03 16:31:26 PDT):
right on yes , 2 is where i’m focused

**sibagy** (2025-06-03 16:31:37 PDT):
I'm focused on 1 :smile:

**dhains** (2025-06-03 16:31:47 PDT):
yup but we both need MCP :slightly_smiling_face:

**dhains** (2025-06-03 16:32:08 PDT):
so i think thats where we can collaborate is working on getting things exposed through MCP and that opens up use for both

**sibagy** (2025-06-03 16:32:20 PDT):
I do think 1 does, for 2 you could just orchestrate and get the data in python itself, like the prototype Yakub did

**sibagy** (2025-06-03 16:33:18 PDT):
and I still think we would need socrates to validate results and make them deterministic

**dhains** (2025-06-03 16:33:40 PDT):
Yeah Socrates and other AR provides validation

**dhains** (2025-06-03 16:33:54 PDT):
and yeah 2 can also be done deterministically yourself

**dhains** (2025-06-03 16:34:21 PDT):
like yo u could just manually write the code

**dhains** (2025-06-03 16:34:44 PDT):
but then every time you need to make change or do a new use case, its more code to write

**dhains** (2025-06-03 16:35:17 PDT):
libraries like langchain are kind of lke middle ground

**dhains** (2025-06-03 16:35:24 PDT):
provide some abstraction

**dhains** (2025-06-03 16:35:46 PDT):
but you aren’t just letting the LLM do all hte orchestration itself like in your 1 use case where you just ask Q cli something

**sibagy** (2025-06-03 16:36:06 PDT):
I feel like there are "blocks" of steps we could leverage, like `LLM-&gt;MCP-&gt;data manipulation somewhere-&gt;RETURN-&gt;LLM-&gt;AR` and then rinse and repeat

**dhains** (2025-06-03 16:36:12 PDT):
we don’t *need* it, its just one solution to a problem

**dhains** (2025-06-03 16:36:46 PDT):
for sure there are building blocks

**dhains** (2025-06-03 16:36:59 PDT):
but the idea is then how do you put the blocks together

**dhains** (2025-06-03 16:37:13 PDT):
you can let LLM put the blocks together itself

**dhains** (2025-06-03 16:37:23 PDT):
or you can manually put the blocks together(like write all the orchestration)

**sibagy** (2025-06-03 16:37:42 PDT):
today the only way I heard about is AR or even agents with validation prompts

**dhains** (2025-06-03 16:38:09 PDT):
sure but don’t confuse validation with orchestration

**dhains** (2025-06-03 16:38:25 PDT):
liek we are literally using langchain to orchestrate complex tasks now :slightly_smiling_face:

**sibagy** (2025-06-03 16:38:32 PDT):
I've been using frameworks like SPARC or BMAD to create agent personas and make them "fix each other"

**dhains** (2025-06-03 16:38:47 PDT):
oh thats cool :)

**sibagy** (2025-06-03 16:39:48 PDT):
the problem is that all my examples are "computer science", so deterministic... in your case, it can be way to subjective to "write in a prompt" so we can prime the LLM

**dhains** (2025-06-03 16:47:10 PDT):
yeah exactly

**dhains** (2025-06-03 16:47:42 PDT):
and even like the user scripts in PowerGenAI tools - it works really well for some use cases but you dont have guarantee of determinism

**dhains** (2025-06-03 16:48:03 PDT):
i don’t know if langchain or w/e is right long-term solution

**sibagy** (2025-06-03 16:49:10 PDT):
I still think you are trying to mix 2 diff technologies, or I've zero idea what langchain is :smile:

**sibagy** (2025-06-03 16:49:48 PDT):
for me we have the LLM using tools
langchain is a way, a framewok to build such tools
is this right?

**dhains** (2025-06-03 16:50:51 PDT):
its a way to build those tools, but also to orchestrate their use

**dhains** (2025-06-03 16:51:18 PDT):
i don’t care about using it to build tools we have MCP for that

**sibagy** (2025-06-03 16:51:22 PDT):
&gt; but also to orchestrate their use
by coding right? not LLM?

**dhains** (2025-06-03 16:51:31 PDT):
its like an abstraction layer

**dhains** (2025-06-03 16:51:42 PDT):
so by coding but not writing everything yourself

**dhains** (2025-06-03 16:51:56 PDT):
its like the agent scripts in the GenAI power use example you gave

**sibagy** (2025-06-03 16:52:07 PDT):
where is the LLM inference time for instance?

**dhains** (2025-06-03 16:52:18 PDT):
what do you mean?

**sibagy** (2025-06-03 16:52:45 PDT):
we only get alluciations during inference, so where is it? how it is being called ? or is it calling what?

**dhains** (2025-06-03 16:55:44 PDT):
I am not following :slightly_smiling_face: sorry - I think AR like Socrates can help detect hallucination and validate responses if htats what you mean

**dhains** (2025-06-03 16:56:23 PDT):
are you saying have AR also validate agents plan for following the agent script at each step in a complex task?

**dhains** (2025-06-03 16:57:16 PDT):
but like let me say I want agent to always follow a decision tree. It must evaluate some data and make call to go left or right on the tree

**dhains** (2025-06-03 16:57:31 PDT):
it says I think i must go left

**dhains** (2025-06-03 16:58:01 PDT):
so then we could have some validation step to say, ok here was the data and agent thinks to go left - lets validate

**dhains** (2025-06-03 16:58:50 PDT):
but there is orchestration if you take step back, like how do make sure that the agent uses the right tools to analyze the data, and then that validation step is called before it goes left

**sibagy** (2025-06-03 16:59:00 PDT):
i think that is the block I wrote above BUT with a higher langchain agent doing the calls/orchestratipns?

`LANGCHAIN AGENT`
:downvote:
x times [`LLM-&gt;MCP-&gt;data manipulation somewhere-&gt;RETURN-&gt;LLM-&gt;AR`]

**dhains** (2025-06-03 16:59:25 PDT):
yeah i mean langchain is one way to do it - like you said it also provides support for building tools, we don’t really need that since we have MCP

**sibagy** (2025-06-03 16:59:26 PDT):
proably `ar` is outside of th block

**dhains** (2025-06-03 16:59:40 PDT):
but it also proides way to orchestrate those steps

**dhains** (2025-06-03 17:00:16 PDT):
so we can guarantee that once agent reaches that node in the tree it always uses tool X to evaluate data, and then wecan force AR check after before it proceeds.

**sibagy** (2025-06-03 17:00:27 PDT):
good, I will read all I can about langchain tonight and ask you more questions tomorrow :smile:

**dhains** (2025-06-03 17:00:49 PDT):
yeah it might not be the best tool for it, but its what the SIP folks are using for their integration

**dhains** (2025-06-03 17:01:25 PDT):
and seems to provide more consistent results than just prompting the LLM to do the task

**sibagy** (2025-06-03 17:01:31 PDT):
SIP?

**dhains** (2025-06-03 17:01:33 PDT):
but totally agree with you we don’t need it for authoring tools

**dhains** (2025-06-03 17:01:56 PDT):
search intake process, they are trying to automate code rollout, evaluation and launching with LLM fully

**dhains** (2025-06-03 17:02:27 PDT):
so they want to guarantee that LLM agent *always* follow series of steps

**dhains** (2025-06-03 17:03:00 PDT):
and have been using langchain to do that ( though using MCP for AMZN_MCP access )

**dhains** (2025-06-03 17:03:21 PDT):
and i think they might build a fewtools themselves in langchain too but mostly using to provide an abstraction to orchestration

**sibagy** (2025-06-03 17:03:23 PDT):
are you around? going to the office? I'm here this week, I feel like we could jump start this if we get together...

**dhains** (2025-06-03 17:03:29 PDT):
im here now

**sibagy** (2025-06-03 17:04:02 PDT):
I'm going with Renato, so 6am 3pm :disappointed: already "home"

**dhains** (2025-06-03 17:04:08 PDT):
ah got it

**dhains** (2025-06-03 17:04:29 PDT):
ok Thursday we could meet in the office?

**sibagy** (2025-06-03 17:04:41 PDT):
yep

**dhains** (2025-06-03 17:04:47 PDT):
I have a busy schedule tomorow but Thursday pretty much free

**sibagy** (2025-06-03 17:05:02 PDT):
gives me tim eto read about langchain

**dhains** (2025-06-03 17:05:20 PDT):
cool yeah and I’m not saying we (weblab) should adopt langchain - we do have joint goal wtih SIP (search) team on this stuff so have been collaborating with them

**sibagy** (2025-06-03 17:05:25 PDT):
please schedule something that is good for you, I can do any time

**dhains** (2025-06-03 17:05:31 PDT):
I think mostly our focus should just be on enabling MCP

**dhains** (2025-06-03 17:05:49 PDT):
then how we use the tools in MCP we can decide on use case whatever makes most sense

**sibagy** (2025-06-03 17:05:58 PDT):
yep, me too...
i feel like this is a multipart work, but part 1 == MCP

**dhains** (2025-06-03 17:06:04 PDT):
totally agree

**dhains** (2025-06-03 17:06:20 PDT):
thats where we start and langchain oesn’t realy enter conversation there anyway

**dhains** (2025-06-03 17:07:31 PDT):
i just mention it as a way to automate more complex tasks on top of MCP (not using it for tool support) that is more control than just writing the natural language agent scripts

**dhains** (2025-06-03 17:07:45 PDT):
and Search has had some really nice results using it

**dhains** (2025-06-03 17:09:29 PDT):
I’m not using it in my work yet, doing more like Jakub where I’m just writing my own orchestration in typescript/python - but its much easier to iterate quickly using an abstraction layer.

**dhains** (2025-06-03 17:09:55 PDT):
anyway we can jumpstart mcp stuff on Thursday look forward to it :smile:

**sibagy** (2025-06-03 17:10:56 PDT):
schedule any time you see fit, free all day
