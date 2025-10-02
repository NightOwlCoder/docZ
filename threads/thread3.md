From: Jiang, YJ <yimingj@amazon.com>
Date: Thursday, June 26, 2025 at 12:14 PM
To: Ibagy, Sergio <sibagy@amazon.com>, Kaplan, Jakub <jkkaplan@amazon.com>, Hains, Doug <dhains@amazon.com>, Hong, Peter <peterhg@amazon.com>, Yung, Tifany <tiyung@amazon.com>, Cruse, Kevin <crusekev@amazon.com>, Carlson, Adam <acarlson@imdb.com>
Cc: Poff, Will <willpoff@amazon.com>, Wilkinson, Ryan <rcwilkin@amazon.com>, Martins, Renato <renatopm@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data

@Hong, Peter will be the poc from my side. Feel free to loop me in for any discussions or updates.
 
Our goal is to expose any WSTLake structured data over MCP by end of July.
I’m interested to learn more about Weblab’s overall approach to MCP and our technical decisions and scopes.   
 
Best,
YJ
 
From: "Ibagy, Sergio" <sibagy@amazon.com>
Date: Thursday, June 26, 2025 at 11:34 AM
To: "Jiang, YJ" <yimingj@amazon.com>, "Kaplan, Jakub" <jkkaplan@amazon.com>, "Hains, Doug" <dhains@amazon.com>, "Hong, Peter" <peterhg@amazon.com>, "Yung, Tifany" <tiyung@amazon.com>, "Cruse, Kevin" <crusekev@amazon.com>, "Carlson, Adam" <acarlson@imdb.com>
Cc: "Poff, Will" <willpoff@amazon.com>, "Wilkinson, Ryan" <rcwilkin@amazon.com>, "Martins, Renato" <renatopm@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data
 
Hey Jakub,
will slowly start to work on this now...
 
As for understanding other team's use cases, that is my first goal.
This is the one I have so far:
https://issues.amazon.com/issues/CORAL-3013
 
Can everyone share with me POCs that are requesting anything in this area?
It will help prioritize Andes-backed vs online services approach.
 
.Sergio
From: Jiang, YJ <yimingj@amazon.com>
Date: Thursday, June 19, 2025 at 2:27 PM
To: Kaplan, Jakub <jkkaplan@amazon.com>, Hains, Doug <dhains@amazon.com>, Ibagy, Sergio <sibagy@amazon.com>, Hong, Peter <peterhg@amazon.com>, Yung, Tifany <tiyung@amazon.com>, Cruse, Kevin <crusekev@amazon.com>, Carlson, Adam <acarlson@imdb.com>
Cc: Poff, Will <willpoff@amazon.com>, Wilkinson, Ryan <rcwilkin@amazon.com>, Martins, Renato <renatopm@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data

+ @Carlson, Adam
 
From: "Kaplan, Jakub" <jkkaplan@amazon.com>
Date: Wednesday, June 18, 2025 at 6:16 PM
To: "Jiang, YJ" <yimingj@amazon.com>, "Hains, Doug" <dhains@amazon.com>, "Ibagy, Sergio" <sibagy@amazon.com>, "Hong, Peter" <peterhg@amazon.com>, "Yung, Tifany" <tiyung@amazon.com>, "Cruse, Kevin" <crusekev@amazon.com>
Cc: "Poff, Will" <willpoff@amazon.com>, "Wilkinson, Ryan" <rcwilkin@amazon.com>, "Martins, Renato" <renatopm@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data
 
@Sergio Ibagy
 
Have we discussed with all the MCP requestors what the use cases they have are so that we can determine whether or not we can better serve them with the Andes-backed MCP vs the one backed by online services?
 
The use case Ed Banti had is not suitable for online services, it is much rather a candidate for Andes tables. That might not be the case for other use cases but before we go building one or the other we should understand that for the use case folks are asking for this.
 
Jakub
 
 
From: "Jiang, YJ" <yimingj@amazon.com>
Date: Wednesday, June 18, 2025 at 12:26
To: "Hains, Doug" <dhains@amazon.com>, "Ibagy, Sergio" <sibagy@amazon.com>, "Hong, Peter" <peterhg@amazon.com>, "Kaplan, Jakub" <jkkaplan@amazon.com>, "Yung, Tifany" <tiyung@amazon.com>, "Cruse, Kevin" <crusekev@amazon.com>
Cc: "Poff, Will" <willpoff@amazon.com>, "Wilkinson, Ryan" <rcwilkin@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data
 
Do we envision all portfolio customers installing MCP Servers and writing their own scripts (even with natural language tools)?
Definitely not – it should be as easy as it can get, but we have teams in BDT asking for this kind of access now. They can setup MCP servers and scripts. We can also offer to create an example script (not P0).
 
Or do we see value in providing maintained workflows, LLM agents with curated tool access, or orchestration layers that guide users through common tasks (while maintaining trust and validation boundaries)?
This is the end picture to me personally. We should start mapping each Weblab feature as skillsets that AI can invoke. To me it means two things – 1) mapping data primitives. 2) defining any features offered by Weblab in a common API language & repository. @Ibagy, Sergio what is the closest WEX has to a default set of Weblab APIs that define all our functionalities? This may help outline the infrastructure investments we need for 2026.
 
Best,
YJ
 
From: "Hains, Doug" <dhains@amazon.com>
Date: Wednesday, June 18, 2025 at 11:29 AM
To: "Ibagy, Sergio" <sibagy@amazon.com>, "Jiang, YJ" <yimingj@amazon.com>, "Hong, Peter" <peterhg@amazon.com>, "Kaplan, Jakub" <jkkaplan@amazon.com>, "Yung, Tifany" <tiyung@amazon.com>, "Cruse, Kevin" <crusekev@amazon.com>
Cc: "Poff, Will" <willpoff@amazon.com>, "Wilkinson, Ryan" <rcwilkin@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data
 
Hi all,

Thanks for looping me in, I love seeing the momentum here! YJ, your diagram looks great, and I agree with Sergio that composable MCP Servers are a smart foundation. I’m very supportive of this direction and happy to contribute wherever helpful, especially around defining interfaces and data access patterns.
 
That said, just to echo something I’ve been raising in adjacent threads: MCP integration is a crucial piece of the puzzle, but it’s not the full picture. As we move toward enabling natural language queries and richer agentic interactions, we should also be thinking about orchestration, validation, and the user experience layer. For instance:
 
Do we envision all portfolio customers installing MCP Servers and writing their own scripts (even with natural language tools)?
 
Or do we see value in providing maintained workflows, LLM agents with curated tool access, or orchestration layers that guide users through common tasks (while maintaining trust and validation boundaries)?
 
These questions don’t block our P0 path, getting MCP working is clearly the right first step. But I want to make sure we’re designing with the end-to-end user experience in mind, and not assuming MCP exposure alone will get us to scalable, repeatable impact.
 
Thanks,
Doug
 
 
From: "Ibagy, Sergio" <sibagy@amazon.com>
Date: Wednesday, June 18, 2025 at 8:43 AM
To: "Jiang, YJ" <yimingj@amazon.com>, "Hong, Peter" <peterhg@amazon.com>, "Kaplan, Jakub" <jkkaplan@amazon.com>, "Yung, Tifany" <tiyung@amazon.com>, "Cruse, Kevin" <crusekev@amazon.com>
Cc: "Hains, Doug" <dhains@amazon.com>, "Poff, Will" <willpoff@amazon.com>, "Wilkinson, Ryan" <rcwilkin@amazon.com>
Subject: Re: Multi-modal LLMs with MCP over Weblab Data
 
Yes YJ, your diagram seems really doable.
 
Right now the plan I was discussing with Doug is to work on one of those green MCP Server xboxes, in such a way that  by using building blocks, we make them composable.
 
The critical path items we need to address:
Defining the interface contract between MCP Servers and Services
Establishing data access patterns that maintain appropriate security boundaries
Setting expectations around data freshness/staleness (should we cache data?)
 
Let me know if you would like more details,
.Sergio
 
From: Jiang, YJ <yimingj@amazon.com>
Date: Monday, June 2, 2025 at 11:21 PM
To: Hong, Peter <peterhg@amazon.com>, Kaplan, Jakub <jkkaplan@amazon.com>, Yung, Tifany <tiyung@amazon.com>, Cruse, Kevin <crusekev@amazon.com>
Cc: Hains, Doug <dhains@amazon.com>, Poff, Will <willpoff@amazon.com>, Ibagy, Sergio <sibagy@amazon.com>, Wilkinson, Ryan <rcwilkin@amazon.com>
Subject: Multi-modal LLMs with MCP over Weblab Data

Hello all,
 
The existing mental model to deliver TK impact analysis reports to Portfolio customers by H2 2025 revolve around us manually compile queries and tweak joins to generate derived view.
With Jakub’s POC, we can adopt an additional mechanism on report creation by empowering any user to query using natural language and create customized reports our data sources over MCP.
This will satisfy a segment of users that need a variation of our standard P0 reports with higher tolerance on data staleness, which we may not be able to prioritize due to limited bandwidth.
 
I drew a quick diagram based off my limited knowledge of MCP framework and want to know the realistic end picture we can achieve this year if we invest into this protocol.
@Hong, Peter, can you lead from AmpL to discuss with Jakub on how to iterate further on this topic?
Doug/Sergio, I’ve included you two for feedback on this idea, since we’ve had separate discussions over MCP and I believe exposing WSTLake structured & unstructured data is more valuable than to vend our internal wiki repositories or other use cases.
 
 

 
Best,
YJ