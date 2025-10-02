
# Docs
https://w.amazon.com/bin/view/ModelContextProtocol

**amzn-mcp:**
https://code.amazon.com/packages/AmazonInternalMCPServer/trees/mainline#

**Enhancing Agentic AI with Serverless MCP Servers**
[[llm-enhancing-agentic-ai-with-serverless-mcp-servers]]

**Agent SDKs Learning Hub**
https://w.amazon.com/bin/view/AWS/Teams/StartupSA/EMEA/SelfLearning/Agent-SDKs-Learning-Hub/

Nice video with #diff between AWS Agents and Strand:
https://www.youtube.com/watch?v=dT89C2MuYj4

# SIM to track requests
other SIMs or even slack:
https://sim.amazon.com/issues/Weblab-58126

# Presentations
[[weblab-mcp-presentation]]

# Debug
Setup debugger:
https://broadcast.amazon.com/videos/1490300
```bash
npx @modelcontextprotocol/inspector
```


# User stories
## Amazon music demo on S&T 
their slide deck is basically a PRD for our product:
![[image-20250523141434005.png|1000]]
![[image-20250523141445219.png|1000]]

## The Problem
- **Experiment visibility** – How many experiments are we running at Amazon Music? What’s our velocity and win rate?  
- **Historical insight** – What were some of our biggest experiment wins last year?  
- **Quality assurance** – What’s the current quality of experimentation? Are we following the guidance and running experiments the right way?  
- **Discoverability** – Can I find all experiments run by my team at once—and see their results?  

## Features

### 1. Senior Leadership Overview
- **Velocity** (# of experiments)  
- **Win / Launch rate**  
- **Top experiments**  

### 2. Quality Assurance
- **Breached guardrail rate**  
- **WLBR not assigned**  
- **Treatment allocation alarm triggered**  
- **Pending post-experiment clean-up**  
- **Not running covariate-adjusted results**  

### 3. Breaking Down Silos
- **All experiments by a team**  
- **Experiment metadata**  
- **All APT results at once**  
- **Hyperlinks to Weblab UI and APT results**  


# Architecture Research
**Keith Norman**
sweet dude! yeah i assume you saw that MCP thing that caused a big kerfuffle for us?They were mostly doing everything right, just not using their own API key and using the API front door, but I think auth and stuff was fine. They were just using midway, which you can use to call the 'public' API. You just need to create an API user which will get its own key and have its own permissions and rate limit settings. But, as an internal user I think it will be much easier for you to get access than someone outside
here's the existing APIs, I'd assume you can access the internal ones too, but if you want to be more conservative could just stick to the ones above the 'internal' line 
weblab API
https://code.amazon.com/packages/WeblabAPIModel/blobs/mainline/--/model/main.xml

**Sergio Ibagy**
As an MCP that will be loaded by some tool into someone else's browser/Q CLI/Cline/etc, this API key business can be a step back...\
Is there a way for us to throttle based on just user?\
In the end, that is what it is, someone typing something against an LLM, not some crazy API Python app thingy....\
I can also implement some throttle on the MCP code itself, to avoid idiotic question like give me all amazon running weblabs ![:smile:](https://a.slack-edge.com/production-standard-emoji-assets/14.0/apple-medium/1f604.png)

**Keith Norman**
yeah i see what you mean, i don't think the api gateway current supports that, but maybe dig into how it's setup in aws to see, it's all in this account  think the rate limit stuff is under api gateway -> usage plans
https://iad.merlon.amazon.dev/account/aws/400858406294/sdo#attributes

## Strands Agents
https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/
![[image-20250604120944499.png|600]]
How does strand integrates with our MCP strategy?
[[llm-mcp-strands-investigation]]


## LangChain?
[[llm-langchain-investigation]]

## Current weblab API

**Functions available**
https://code.amazon.com/packages/WeblabAPIModel/blobs/mainline/--/model/main.xml

**Calling the WeblabAPI**
https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI#HCallingtheWeblabAPI

**WeblabAPI consumer keys (auth)**
https://code.amazon.com/packages/WeblabAPI/blobs/647560e303bda4728780ae7e92367a2e183d174a/--/src/api-consumers.ts#L463




## Cloud Based Service?
**Frank Liao**
From what I've seen so far in the channel, `amzn-mcp` is not hosted, nor does it make sense for it to be hosted because we rely on local credentials to search internal sites. Is it not feasible then, for an agent running on the cloud (e.g. bedrock agent) to connect to an MCP Server which is able to access the wiki, code, past tickets, etc.?

**Michael Feeser**
Correct, at least with the current state of Auth at Amazon

## Remote MCP Server using midway
https://code.amazon.com/packages/MidwayMCPProxy/trees/mainline
video demo: https://amzn-wwc.slack.com/archives/C08BHHZN5NW/p1748640159087339


## Threads on the Topic

- [[llm-agent-doug-discussions]]

### Weblab Support for amzn-mcp Integration - Slack Thread Summary
https://amzn-wwc.slack.com/archives/C08GJKNC3KM/p1747862233302589
#### Background
Nick Eng implemented weblab support for amzn-mcp but received a post-merge comment requesting reversion as weblab currently cannot support amzn-mcp as a client.
#### Technical Details
- Current weblab "public" API lacks critical functionality (bindle info, activation comments for mcm linking, treatment assignment info)
- Nick's implementation used weblabUI APIs (similar to the CRUX tool) to access these features
- A revert CR has been created: CR-197453101
#### Next Steps & Advocacy
- Ed Banti forwarded the request to weblab leadership
- Issue tracking available at CORAL-3013
- Jakub Kaplan requested specific use cases to build a POC using Andes tables
- Primary use case identified by Ed: capturing weblab dial-up dates and analysis information for dashboard impact tracking
#### Question Raised
Nick asked whether there's a mechanism to prioritize GenAI development for company-wide tools like weblab, suggesting services might need to scale up for potential traffic changes before building GenAI-specific APIs.

### Weblab Andes Tables MCP Integration - Email Thread Summary
This email thread relates to [[weblab-mcp-server#Weblab Support for amzn-mcp Integration - Slack Thread Summary]] and discusses efforts to enable Weblab data access through MCP.
![[image-20250602111827407.png|1000]]
#### Key Developments
##### POC Results
- Jakub Kaplan completed a 1-hour POC demonstrating Weblab Andes Tables integration via MCP
- Created two dashboards within the timeboxed experiment:
  1. Top 5 most positive/negative experiments by GCCP for Search
  2. Experiments with greatest conflict between GCCP and OPS
- Documentation: https://quip-amazon.com/Pn34ASAcGjjq/Proof-of-Concept-for-using-Weblab-Andes-Tables-via-MCP-in-LLM-applications
##### Technical Approach
- POC used CSV export of weblab_metrics table loaded into Cline's context
- Could simulate what would be possible with direct Andes table access
- Demonstrates how Cline + Claude can produce appropriate scripts for dashboards rather than direct inference
- Benefits from batch access to full result sets rather than single results
##### Implementation Insights
- William Josephson noted two frequently missed patterns in MCP adoption:
  1. Assuming interactions must use live service vs. periodically updated views
  2. Assuming heavy lifting must be done using GenAI vs. providing context for LLMs
- James McQueen highlighted opportunity to use causal models to create information and structured access paths, then use LLMs to catalog, review, and explain in human language
#### Next Steps
- William has been working with PPMT for dataset lineage to define a joint POC
- Potential to include MCP integration to support on-call and impact analysis
- Discussion about pursuing API or WSTLAKE integration in 2025
- Dominic Corona from BDT is looking at what MCP integrations BDT should offer
- The topic may be raised at upcoming joint CBA/MBR meeting
#### Strategic Question
The thread concludes with a reflection on why conventional dashboard creation takes months while the POC produced meaningful results in just an hour, questioning if there are lessons to apply to portfolio dashboard approaches.


## Previous attempt
https://issues.amazon.com/issues/CORAL-3013
https://code.amazon.com/reviews/CR-196833998
### MCP Putting Weblab Availability at Risk - TT Summary

#### Issue Details
• **Ticket ID**: CORAL-3013 (P242343248)
• **Title**: MCP putting Weblab availability at risk
• **Status**: Resolved
• **Created by**: Stewart Winter (sjwinter)

#### Summary
An engineer (nicksde@) from Sponsored Products added an MCP (Model Context Protocol) registration for Weblab functionality. The Weblab team raised
concerns that this implementation could put Weblab's availability at risk, potentially affecting many tier-1 services across Amazon that depend on
Weblab.

#### Timeline of Events
1. The engineer from Sponsored Products created an MCP integration for Weblab (CR-196833998)
2. The Weblab team requested an immediate rollback of this change
3. A revert CR was raised (CR-197453101) to remove the tool from the MCP server
4. The revert was merged and the issue was resolved

#### Key Discussion Points

##### Weblab Team's Concerns
• The MCP plugin was created without Weblab team's involvement
• They had no control over what it does or ability to track changes
• They were concerned about potential availability risks to Weblab
• The team is already working on availability-related improvements (removing dependency on netscalers, deprecating unsupportable app client library)

##### MCP Team's Perspective
• The MCP implementation is essentially equivalent to a collection of local scripts
• It uses midway credentials on behalf of the user to browse experiments (read-only)
• Even if removed from amzn-mcp, users could create their own scripts or use browser MCP
• The impact on TPS would likely be modest due to AI chatbot latencies

#### Resolution
1. William Josephson (PE for Weblab) confirmed that protecting Weblab's availability is critical
2. The team agreed to revert the CR and work on understanding how to address this need properly
3. It was noted that hardened APIs have been on the Weblab roadmap as a known area of investment
4. The CR was reverted and merged, resolving the immediate concern

#### Next Steps
• The Weblab team has an API roadmap available at: https://quip-amazon.com/5Wb4AxaMTqnG/GA-Weblab-API-Requirements
• There was a suggestion to have a meeting or email thread to discuss this further
• The Weblab team is open to discussions with teams that have business imperatives that would justify accelerating their API roadmap

#### Key Takeaways
1. The immediate issue was resolved by removing the MCP integration
2. There's recognition that MCP is growing quickly and teams should plan for this type of integration
3. The Weblab team needs to prioritize hardened APIs and availability protection controls
4. This highlights the tension between innovation (MCP integration) and service stability (Weblab availability)

# Delivery Vehicle
We will use the [amzn-mcp](https://code.amazon.com/packages/AmazonInternalMCPServer/trees/mainline#) to deliver our new MCP features.

# Updating the MCP
```sh
❯ toolbox update
toolbox:                    1.1.1889.0 is already the latest version
amzn-mcp:                   0.1.3 is already the latest version
```


