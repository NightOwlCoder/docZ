# Strands Agents SDK and MCP Integration in Enterprise AI Architecture

## 1. Strands as a Service Layer for MCP Tools in Production

*Architecture:* Running Strands Agents with isolated tool services via MCP. In this pattern, the agent (LLM + agent loop) runs as a service, and when it needs to use a tool, it calls an MCP server over a network API. This decoupling is exactly how Strands can act as a service layer between models and enterprise tools. Strands was designed with production deployment in mind – AWS’s internal teams use it in microservice architectures where the agent runs in one environment (e.g. a container) and its tools run as separate services. By leveraging the **Model Context Protocol (MCP)** for those tool calls, Strands can provide a standardized interface to a **“tool layer”** in production. In other words, Strands sits between the LLM and various enterprise systems, planning which tool to call and executing that call via MCP, then feeding results back to the model. This matches the vision described in Amazon’s internal MCP story: the Strands agent becomes the orchestration layer that mediates all tool usage in a consistent, secure way, rather than having the LLM call APIs directly. Importantly, this approach is **flexible and robust** – you can deploy Strands agents behind a REST API (for example, in AWS Lambda or Fargate) and have them call MCP-compliant tool services that run elsewhere (even on different AWS accounts or on-premises), all using the common MCP interface. This **microservice-like separation** of concerns (agent vs. tools) helps with scaling, security isolation, and maintainability in an enterprise environment. For instance, AWS notes that you can run an agent in a container while its tools run as isolated backend services (even serverless functions), with Strands invoking each tool via API calls. In summary, Strands can indeed serve as the *service layer* for MCP tools – it hosts the “brain” (agent loop with the LLM) as a service, and bridges that brain to a landscape of MCP-enabled tools in production.

## 2. Strands vs. LangChain: Orchestration, Tool Invocation, and Determinism

**Agent Orchestration:** Strands and LangChain take different approaches to agent orchestration. *LangChain* provides a variety of agent types and chains, but often requires developers to wire together prompts, parsers, and tool handlers explicitly. This can result in complex, hardcoded workflows or custom logic to manage agent decisions. *Strands*, by contrast, is **model-driven** – you simply supply the LLM with a prompt and a set of tools, and the agent loop uses the model’s reasoning to decide how to use those tools. One AWS engineer describes that instead of hardcoding complex task flows, Strands leverages the LLM to handle planning and tool use autonomously. This means less boilerplate logic; Strands “connects two core pieces of the agent together: the model and the tools… and uses the model’s advanced reasoning to decide the agent’s next steps and execute tools”. In practice, Strands sets up a ReAct-style loop under the hood – the model observes context, proposes an action (tool call or answer), Strands executes it, and the loop continues. LangChain’s agents follow a similar thought->act->observe pattern, but developers often need to manage output parsing and error cases themselves.

**Tool Invocation:** Both frameworks let agents invoke external tools, but Strands has **native MCP integration** (more on that in the next section) and a simpler interface for defining tools. In LangChain, you typically wrap a function in a `Tool` object with a description and rely on the agent’s prompt template to encourage the model to call it. The model’s output (e.g. an action string) is parsed by LangChain to trigger the tool. Strands streamlines this: any Python function can be a tool via a decorator (`@tool`), and the SDK handles presenting available tools to the LLM and executing them when the model chooses. Strands also provides an optional library of 20+ pre-built tools (file I/O, web requests, AWS SDK calls, etc.). When it comes to **MCP-based tools**, Strands makes it easy to plug them in (whereas LangChain has no built-in MCP concept and would require custom integration). In short, tool use is a first-class concept in Strands – the model is given a schema of tool capabilities, and Strands automatically executes the chosen tool and returns results, abstracting away the complexity. This design helps avoid some of the “messiness” developers have encountered with LangChain’s tool parsing. In fact, some practitioners note that LangChain’s abstractions can become *unstable* or hard to tweak in production, whereas Strands aims to be **lightweight and production-ready** out of the box.

**Determinism and Workflow Control:** One challenge with “agentic” frameworks is the probabilistic nature of LLM decisions. LangChain and Strands both ultimately rely on an LLM’s output, so *complete* determinism is not guaranteed (the LLM might choose different paths if randomness is introduced). However, Strands gives enterprise developers multiple ways to impose more structure when needed. The Strands agent loop is *customizable* – you can intercept steps or even implement a custom loop logic if your use case demands strict control. For example, you might constrain the model to call tools in a specific order by adjusting the prompt or by breaking a task into sub-agents that are orchestrated in code (Strands supports modeling sub-agents and multi-agent workflows as “tools” to the main agent). LangChain can similarly be made more deterministic by writing a fixed chain of calls (bypassing the agent paradigm), but that loses flexibility. In terms of built-in support, Strands is introducing features like a **Workflow tool and Graph tool** for multi-step plans that the model can invoke when a predefined sequence is required. This allows a hybrid approach: the model can autonomously decide *when* to execute a known workflow, but the workflow’s steps are deterministic and authored by the developer. LangChain doesn’t have an out-of-the-box equivalent of this pattern – developers would typically orchestrate such flows manually or use LangChain’s DAG (via LangChain or third-party extensions) for deterministic branching logic. Additionally, Strands emphasizes **observability and traceability** for production agents (integrating with OpenTelemetry), which aids in understanding and tightening the agent’s behavior. In summary, both frameworks let the model drive the process, but Strands is built to give enterprises confidence in deploying these agents by offering clearer patterns for injecting determinism or safeguards when needed. It’s telling that early evaluations found Strands better suited for complex use cases like multi-agent collaboration and workflow orchestration, especially when integrating with protocols like MCP, whereas LangChain was seen as less stable beyond prototyping.

**Enterprise Workflow Deployment:** When it comes to deploying complex workflows (especially involving many tools or data sources), Strands’ philosophy aligns with enterprise needs. It treats agents as portable units that can run locally or be deployed as services, and encourages using open protocols (MCP, forthcoming Agent-to-Agent/A2A) for interoperability. LangChain, while flexible and popular for rapid development, does not prescribe an architecture for scaling agents in production – developers must design their own API layers, state management, etc. AWS positions Strands as a more *opinionated* but reliable path to go from prototype to production: “Strands scales from simple to complex agent use cases, and from local development to deployment in production, offering developers a streamlined path from prototype to production-ready AI agents.”. In practice, an enterprise team using LangChain might start hitting questions like *How do we serve this agent behind an API? How to manage 100s of tools?* – Strands was built to answer those (with reference architectures, support for large tool catalogs via retrieval, etc.). Another consideration is **MCP workflow integration**: Strands has native hooks for MCP, meaning an agent can easily call out to an MCP workflow or tool server as part of its plan. LangChain would require custom code to call an MCP server (likely treating it as an HTTP endpoint or using an MCP client library separately). Given that AWS and others see MCP as key to *standardizing* enterprise AI tool access, Strands’ out-of-box support is a significant advantage for workflows that span many systems. To summarize, LangChain remains a solid general framework (especially for quick prototypes or academic exploration), but Strands offers a more cohesive and deterministic-friendly approach for **enterprise-grade, MCP-integrated agent orchestration**.

## 3. MCP Integration in Strands: Calling and Hosting MCP Tools

One of Strands’ standout features is its **first-class support for Model Context Protocol**. As the AWS Open Source blog notes, you can “choose from thousands of published MCP servers to use as tools for your agent” when using Strands. This is enabled by an adapter in the Strands SDK: the `MCPClient` tool wrapper. In Python, adding an MCP-based tool is straightforward. For example, suppose you want your agent to use a domain name checker tool (provided as an MCP server) – you can do the following:

```python
from strands.tools.mcp import MCPClient
from mcp import stdio_client, StdioServerParameters

# Connect to a local MCP server (fastdomaincheck) via STDIO:
domain_tools = MCPClient(lambda: stdio_client(StdioServerParameters(
    command="uvx", args=["fastdomaincheck-mcp-server"]
)))
with domain_tools:
    tool_list = domain_tools.list_tools_sync()
```

In this snippet (adapted from AWS’s example), `MCPClient` launches or connects to the **FastDomainCheck** MCP server and retrieves its list of tool functions. Calling `list_tools_sync()` returns the actual tool handles that the MCP server offers – in this case, probably a function like `check_domain_availability(domain)` provided by that server. We can then combine those tools with others when constructing a Strands agent. In the naming-assistant example, they did exactly this – merging the domain-check tools from the MCP server with another tool for GitHub API queries before instantiating the agent. Under the hood, `MCPClient` uses the official MCP Python SDK to communicate with the server (here we used a local process via STDIO, but it can also connect to remote MCP servers via HTTP/SSE). This means **any** MCP-compliant tool service – whether running locally, on-prem, or cloud – can be plugged into Strands with minimal code. It’s a powerful way to give your agent new skills: as one engineer noted, Strands “has native support for MCP… By connecting to an MCP server, an agent can tap into a large ecosystem of community-provided tools without custom code”.

Does Strands itself also *expose* tools via MCP? Yes, there are patterns for that as well. While the Strands SDK is primarily an **MCP client** (using tools), you can certainly deploy a Strands-powered agent as an MCP server for others to call. In fact, AWS has published a Strands MCP server that basically serves as a documentation assistant – it lets tools like Amazon Q (an AI coding assistant CLI) query Strands documentation via MCP. This server (available as the `strands-agents-mcp-server` package) registers documentation lookup functionalities as MCP tools, so any MCP-enabled client can use them. More generally, if you build a useful agent with Strands, you could wrap it as an MCP server by defining one or more tools that call your agent internally (similar to how one might wrap any function). The AWS **Spring AI** example (in Java) illustrates this idea: they created an “EmployeeInfo” agent, then exposed it as an MCP server by writing a tool function that calls that agent and decorating it as an MCP-exposed tool. The same concept can be applied with Strands in Python – using the MCP Python SDK, you’d register a tool that, say, calls `agent(prompt)` internally. This effectively turns your Strands agent into a microservice that other agents (or clients like Q CLI, etc.) can call through MCP. The benefit of using MCP here is that **any** system speaking the protocol can integrate, regardless of language or platform, without custom adapters for each tool. We see this architecture gaining traction: “Agents exposed as MCP servers provide a micro-service-like architecture that decouples agents from each other, leveraging MCP as the common protocol for communication”. Strands fits neatly into that paradigm, both as a consumer of MCP tools and as a potential provider of higher-level agent services.

In summary, Strands supports MCP in two ways: **direct integration as a client** (your agent can seamlessly call MCP-provided tools such as databases, web search, Slack, etc.) and **patterns to act as a server** (you can publish your Strands agent’s capabilities for use by other MCP-aware agents or applications). This dual support means you can gradually build up a *tool network* in your enterprise. For example, you might start by using public/community MCP servers (there are official ones for filesystems, web fetch, knowledge bases, etc.). Later, you can develop custom MCP servers for internal systems (CRM, proprietary databases), and have Strands agents call those. Eventually, you could even have Strands agents themselves serve specialized skills to other agents. The **Model Context Protocol** is the glue in this ecosystem, and Strands was built to utilize that glue out-of-the-box.

## 4. Language and Platform Support (Python, Rust, JavaScript, etc.)

Strands Agents SDK is currently available as an open-source **Python** library (pip installable as `strands-agents`) – the design emphasizes quick development with “just a few lines of Python code”. Python was a natural first choice due to its popularity in AI workflows and the rich ecosystem of Python ML libraries. Many of the examples (and the reference implementation code) are Python-based. That said, Strands’ architecture and the protocols it relies on are not limited to Python.

For one, the **Model Context Protocol** itself has multi-language support. There are MCP client/server SDKs in languages like *Java, C#, Kotlin, Ruby, Swift, TypeScript*, and more. This means that if your enterprise components are written in other languages, you can still integrate them in an agent workflow. For instance, you could write an MCP server in Rust or Node.js to expose a proprietary system, and your Strands (Python) agent can call it seamlessly. Conversely, if you have an application in, say, JavaScript that wants to invoke the agent, you could run the Strands agent behind a web service or behind an MCP server interface. Because MCP is language-agnostic, a JavaScript-based client (like a web app using an MCP TypeScript SDK) could call a Strands MCP server as a tool. In practice, many users will deploy Strands agents behind a REST API or WebSocket, which any language can consume with HTTP. The AWS deployment toolkit provides guidance for hosting Strands agents on AWS Lambda, Fargate, EC2, etc., exposing them via API Gateway or other endpoints. This effectively decouples the agent’s language runtime from the client’s: a front-end written in JavaScript or a backend in Rust can call the agent’s API just like any other service.

It’s also worth noting that AWS has parallel efforts for other languages. For example, the **Spring AI** library in Java (used in AWS’s MCP inter-agent demo) provides similar agentic abstractions for the JVM, and it integrates with MCP as well. While Spring AI isn’t “Strands in Java,” it aligns conceptually (and indeed, the underlying patterns like using MCP tool callbacks are shared). AWS has mentioned that Strands is provider-agnostic and can be part of different deployment targets, but so far official *language* bindings beyond Python haven’t been announced publicly. There is, however, nothing stopping a community or internal team from porting the core ideas to other languages, especially given the open standards involved. For now, Python remains the primary language for Strands SDK usage, and it’s typically the orchestrator in a multi-language system (with MCP bridging to other languages’ components).

In summary, **Python** is the focus (all examples and tools in the Strands repo are Python). But thanks to Strands’ **protocol-centric design**, you can achieve cross-language interoperability. A Rust service could be an MCP tool provider; a TypeScript app could be an MCP client or simply call a REST endpoint where the Strands agent lives. This cross-language flexibility is crucial for enterprise adoption: you don’t need to rewrite everything in Python – you can bring Strands into your architecture as a Python-based microservice that plays well with others. And as AWS’s own use cases show, the same Strands agent code you write in Python for local testing can be deployed to cloud environments and invoked from any language over the network. (In fact, AWS has already used Strands internally for features in non-Python services like **Amazon Q** CLI, AWS Glue, etc., by treating the agent as a service component.) Expect the ecosystem of integrations to grow, but even today, Python + open protocols = a solution that is “polyglot-friendly.”

## 5. Incorporating Strands into the MCP Journey (Phase 1→2→3)

**Phase 1 – Local Development with MCP:** In the initial phase, Sergio and Doug (our enterprise developers) should use Strands to accelerate local experimentation with MCP tools. This means running a Strands agent on their workstation (or a development VM) and hooking it up to various tools via MCP. Strands is very well suited for this because it runs locally with minimal setup – just install the SDK and you can execute an agent in a Python script. During this phase, they might use a smaller/local model (for example, Strands can work with **Ollama** to run a Llama model locally, or even with open-source models via LiteLLM) so that development doesn’t require cloud resources for each run. The key benefit of Strands here is that it can interface with **local MCP servers** easily. For example, if the team wants to test tool integration, they can spin up reference MCP servers on their machine (the MCP project provides many – filesystem access, web fetcher, memory store, etc. – which can run via a simple command). Using Strands, they would wrap those with `MCPClient` as shown earlier and include them as agent tools. This allows rapid iteration: they can tweak prompts and tool selections in code and immediately see how the agent behaves with real tool interactions. Because it’s all local, debugging is straightforward – they can log the agent’s thought process (Strands can output the chain-of-thought and tool uses) and adjust accordingly. Essentially, Phase 1 is about **vibe-checking the agent idea**: does the LLM pick the right tools? Do the tools return the needed info? Strands makes this interactive development easy, and MCP ensures they’re not writing one-off glue code for each tool – instead they use standardized MCP connectors. An example outcome of Phase 1 could be a prototype agent that, say, queries an internal database and an internal API (for which they might use an MCP server for database access, and a simple HTTP tool for the API). By the end of Phase 1, Sergio and Doug should have a working agent locally in Python that uses a handful of MCP tools and can accomplish the target task in a demo setting.

**Phase 2 – Deterministic Workflow Orchestration:** Once the concept is proven, Phase 2 is about **hardening the workflow** and adding determinism or structure where needed. This is a critical bridge between a free-form prototype and a reliable system. With Strands, there are a few ways to approach this phase. One approach is to use Strands’ support for multi-step workflows and sub-agents. For example, if the task naturally breaks into stages (e.g. *gather info → analyze → respond*), they might create separate agents or tools for each stage and have a top-level agent orchestrate them. Strands’ upcoming “workflow” and “graph” tools (multi-agent patterns) are specifically meant to let the model trigger a predefined sequence of steps when appropriate. Sergio and Doug could experiment with the preview of these features or implement a simple version: e.g., a **master agent** that can call a “WorkflowTool” which internally runs a fixed sequence of sub-tasks. This yields more deterministic flows because the exact series of actions in the workflow is coded, even though the trigger is model-driven. Another tactic in Phase 2 is to employ a **“human in the loop”** or at least a supervisory loop. Strands doesn’t lock you into full autonomy – the team could run the agent step-by-step, inspect its chosen action, and optionally override or approve it (this might be done in a dev UI or with flags that log the plan). The AWS blog calls this the “return-of-control pattern,” where the client (the calling code) gets control whenever a tool is needed and can decide to execute it or modify it. In practice, for determinism, they might set the LLM’s temperature to 0 for consistency and then use code checks: e.g., if the agent proposes an unexpected tool or step, the orchestrator can intervene (perhaps route to a different sub-agent or ask a clarifying question).

During Phase 2, they’ll also think about how to orchestrate this in a scalable way. This might involve preparing to deploy some components as services (a staging environment): for instance, they could host critical MCP tools on a dev server rather than locally, and have the Strands agent connect to them via a URL. They might introduce an orchestration layer (AWS Step Functions or simple Python workflow script) that calls the agent and other services in a controlled manner. Strands is flexible enough to be invoked synchronously as part of a larger script – you can call `result = agent(user_input)` in Python, which means you can embed that in any custom logic you want. If LangChain were being used, one might instead break out of the agent paradigm and use fixed chains here, but with Strands, Sergio and Doug can achieve similar determinism *without leaving the Strands ecosystem* by using the tools-as-subagents or client-control patterns described. Additionally, Phase 2 is a good time to incorporate **testing and verification**: Strands could be run with various test prompts to ensure it consistently follows the desired workflow. If any part of the process needs guaranteed handling (say logging an audit trail, sending an alert), they can implement that around the agent call. Essentially, Phase 2 uses Strands to codify the “happy path” discovered in Phase 1 into a more structured sequence, while still leveraging the LLM for what it’s best at (flexible reasoning). The outcome of Phase 2 should be a robust design for how the agent and tools interact, with known points of variability and control. For example, they might decide: *“Our agent will always call Tool A first to get data, then Tool B. We’ll enforce that via a workflow tool. Only after those will it formulate an answer.”* Or *“Our agent can choose among these tools freely, but we’ll always validate the final answer format with a regex.”* These kind of rules can be injected with Strands via system prompts or wrapper logic.

**Phase 3 – Customer-Facing Production Applications:** In the final phase, the goal is to deploy the MCP-powered agent to end-users at scale. Strands provides a clear path for this: the **deployment toolkit** and reference architectures cover how to expose the agent behind an API and integrate with AWS infrastructure. For Sergio and Doug, this means taking the agent (refined in Phase 2) and setting it up in a production environment. They might containerize the Python agent code and deploy it on AWS Fargate or ECS, or use AWS Lambda if the use case fits (short-lived requests). The agent would be offered as a service – for example, a REST endpoint or an event-driven function (Strands supports event-triggered or continuous agents as well, not just chatbots). At this stage, all the MCP tools the agent uses need to be **highly available** too. So any MCP servers that were running in dev now should be deployed in production (perhaps as microservices on AWS, each behind a load balancer or API Gateway). Fortunately, MCP servers are generally lightweight and can run statelessly, so it’s feasible to host them in a scalable way (for instance, an AWS official recommendation is to deploy MCP servers for AWS services or databases on AWS and call them remotely). The agent will need to know where to find them – in config you’d point `MCPClient` at the service URL instead of launching a local process.

Strands in production also means **monitoring and maintenance**. Sergio and Doug should take advantage of Strands’ built-in telemetry: enabling OpenTelemetry integration so that traces of each agent session (which tools were used, how long each step took, any errors) are sent to their monitoring system. This will be invaluable for a customer-facing app, as it provides visibility into the AI’s decision-making and performance. Another consideration is **security and permissions**: MCP helps here by providing a sandboxed interface to tools (for example, an MCP filesystem tool can enforce which directories are accessible). In production, they would ensure that the MCP servers for sensitive systems are locked down (perhaps requiring auth tokens that the agent provides). Strands doesn’t do auth by itself, but since tools can be any callable, they could integrate an authentication step into a tool call or wrap the MCP server client with credentials. They should also use the **model safeguards** appropriate for production – e.g., an AWS Bedrock model with toxicity filters or adding a final moderation step if the content goes to customers. These layers complement Strands; they aren’t specific to Strands, but the framework allows inserting such steps (you could have a “moderation” tool or simply post-process the agent’s final answer).

By Phase 3, the **architecture** might look like: a user interface (web or app) hits an API endpoint which triggers the Strands agent (running on AWS). The Strands agent, based on user input, might call an MCP server for data, maybe call another for an external API, etc., then return a result to the user. All of those interactions are traced. If needed, the team could run multiple instances of the agent service behind a load balancer to handle concurrent users. And because Strands is relatively lightweight (essentially just orchestrating an LLM and HTTP calls), scaling it is mostly about scaling the LLM inference endpoint and the tools. AWS’s internal adoption of Strands in services like Amazon Q and Glue indicates that it can be deployed to handle real workloads. They mention using Strands agents in AWS Glue and even in network analysis tools, which are customer-facing scenarios. This gives confidence that the framework is production-hardened.

In sum, for Phase 3, Sergio and Doug should **deploy Strands as the AI orchestration backend** of their app, with MCP linking it to all necessary enterprise data/tools. They’ll treat it like any other microservice – using AWS best practices (auto-scaling, monitoring, IaC deployment). Thanks to the groundwork in Phase 2, the agent’s behavior will be well-understood and as deterministic as it needs to be. They can focus on things like throughput, latency (maybe using streaming responses to send partial results to users – Strands supports streaming output from models for responsiveness), and reliability (retries on tool failures, etc.). Strands’ support for various deployment models (monolith vs. split tools vs. client-run tools) means they can choose what fits best. For example, if the customer app is itself an installable client (like a CLI tool), they might even embed a Strands agent there for offline use, with some tools running locally – or more likely, they’ll stick to a cloud service for easier maintenance. The end result is an enterprise-grade AI agent platform: Strands is the core orchestration engine, MCP provides the extensible tool/plugin layer, and the whole system is deployed in a way that meets the organization’s standards for security and scalability.

## 6. Examples and Architectural Patterns with Strands + MCP

To make this concrete, let’s walk through a practical example pattern that an enterprise could deploy using Strands and MCP. Consider a **customer support AI assistant** that needs to perform a variety of tasks: look up customer info in a database, pull knowledge base articles, create a ticket in a system like Jira, and answer the user’s question. Using Strands, one could implement this as follows:

* **Tools via MCP:** The developer identifies or creates MCP servers for each needed capability. For instance, an MCP server for the customer database (perhaps using the MCP PostgreSQL or SQLite reference server if it’s a read-only lookup), an MCP server for the knowledge base search, and another for Jira’s API (there might not be an out-of-the-box one for Jira, but it’s straightforward to implement a custom MCP server in Python or TypeScript that wraps Jira’s REST API). These servers run either on the same cloud network or locally. In code, the developer uses `MCPClient` to connect the Strands agent to each server, getting a list of tools like `find_customer(customer_id)`, `search_kb(query)`, `create_ticket(details)` etc. Now, the agent has a suite of actions it can perform.

* **Agent Prompt and Logic:** The developer writes a **system prompt** for the Strands agent that defines its role and rules – e.g., “You are a support assistant. You have tools to lookup customers, search articles, and create tickets. Always verify if the customer exists and retrieve relevant articles before answering. If issue is unresolved, open a ticket.” The developer then instantiates an `Agent` with this prompt and the combined tool list. Thanks to Strands’ model-driven loop, the LLM (say, Claude or GPT-4 via Bedrock) will read the prompt and tools and can decide a plan: e.g., first call `find_customer`, then `search_kb`, then formulate answer, and possibly call `create_ticket` if needed. This emerges from the model’s reasoning – no hardcoded chain needed.

* **Orchestration & Determinism:** If the enterprise requires that certain steps *always* happen (maybe for compliance, the agent must log the interaction or sanitize the answer), the team can incorporate that in a controlled way. For example, they might add a simple post-processing function as a tool (like a `@tool def sanitize(text)` that they always call on the final answer via a wrapper) or they might break the task: one Strands agent focuses on retrieval (customer and KB info) and returns a summary, which the second agent uses to generate the final answer. These are design choices – Strands is flexible to allow either approach. The key is that by Phase 3, they likely have these patterns decided, so the deployed agent will consistently do the right sequence (with the LLM’s autonomy bounded by good prompt instructions and the system design).

* **Deployment Architecture:** In production, they might deploy this as two services: (1) the **Strands agent service** (running the support agent), and (2) a cluster of **MCP tool services** (for DB, KB, Jira). A front-end (could be a web UI or a chatbot interface) sends user queries to the agent service via an API call. The agent service, on an incoming request, invokes the Strands agent. The agent might call e.g. the DB MCP server (over HTTP/SSE) – which is a separate service that queries the actual database – and get back results, then call the KB server, etc. Finally it produces an answer. If a ticket needs to be created, it calls the Jira MCP server which performs that action in the background system. This whole flow is tracked via logs and traces. Because it’s microservice-based, each component (agent or tool) can scale horizontally if needed under load. Also, if one tool service needs to be updated or swapped (say they move from one KB system to another), they can do so without touching the agent code – just point to a different MCP server or add a new one.

* **Sample Code and Configuration:** To illustrate with a bit of pseudo-code (simplified):

  ```python
  # Assume we have MCPClient wrappers for three servers:
  crm_tools = MCPClient(lambda: connect_to_mcp("crm_server_url"))
  kb_tools = MCPClient(lambda: connect_to_mcp("kb_search_url"))
  jira_tools = MCPClient(lambda: connect_to_mcp("jira_server_url"))
  with crm_tools, kb_tools, jira_tools:
      all_tools = crm_tools.list_tools_sync() + kb_tools.list_tools_sync() + jira_tools.list_tools_sync()
      support_agent = Agent(system_prompt=SUPPORT_PROMPT, tools=all_tools, model=BedrockClaude())
      response = support_agent(user_message)
      print(response)
  ```

  This snippet connects to three remote MCP servers (indicated by URLs) and combines their tools for the agent. The actual deployment would keep these connections alive or reconnect as needed for each request. The `BedrockClaude()` is a placeholder indicating using Amazon Bedrock’s Claude model (which Strands supports by default). The ability to just list and concatenate tools from various MCP sources highlights how **Strands abstracts the tool layer** – whether the tool is a local function or a remote MCP call, the agent uses it the same way.

This example demonstrates a **pattern**: use Strands to **integrate multiple MCP tools into a single coherent agent** that addresses a complex multi-step use case. The benefit for engineers is huge – they don’t have to manually orchestrate calls to the CRM, KB, Jira in code with a bunch of `if/then` logic for each scenario; instead they let the LLM decide when and how to call each service, within the guardrails they set. And if tomorrow they add a new tool (say an ERP system via MCP), they can just plug it in without redesigning the agent’s core logic.

On the flip side, if they need the agent’s capability to be accessible in another context (maybe integrated into a different product), they could expose it easily. For instance, they could wrap the whole support agent as an MCP server itself with a tool like `answer_support_question(user_query)` so that another AI agent (perhaps an overarching assistant) could call it. This kind of **composability** is a cornerstone of the MCP vision and is actively being explored by AWS and others (e.g., inter-agent communication standards). Strands is keeping pace, with plans to support the upcoming Agent-to-Agent protocol to make multi-agent systems even more seamless.

Finally, it’s worth noting any **roadmap or adoption notes**: Strands was only open-sourced in mid-2025, but it’s already used internally at Amazon in several services, which speaks to its maturity. The open-source community is quickly adopting it for enterprise AI scenarios, often comparing it with frameworks like LangChain, Google’s ADK, etc.. The general consensus so far is that Strands + MCP is a winning combo for building scalable, maintainable AI agents that integrate with company data. As AWS continues to contribute (the blogs and discussions hint at ongoing enhancements to MCP and agent capabilities), Sergio and Doug can be confident that by investing in this approach, they are aligning with an emerging standard in enterprise AI architecture. The journey from Phase 1 to 3 will be iterative, but with Strands as the agent layer and MCP as the tool interface, they have a clear path to follow – one that many others in the industry are also starting to tread, towards truly **context-aware, tool-using AI in production**.

**Sources:** The information and examples above draw from Amazon’s official announcements and technical blogs on Strands and MCP, including the AWS Open Source blog, AWS Machine Learning blog, InfoQ news, and a detailed technical deep-dive by an AWS engineer, as well as code snippets from the Strands documentation and community discussions. These sources illustrate how Strands Agents SDK and MCP together enable the enterprise journey from local prototyping to production AI agents.
Citations

\[

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

You can separate concerns between the Strands agentic loop and tool execution by running them in separate environments. The following diagram shows an agent architecture with Strands where the agent invokes its tools via API, and the tools run in an isolated backend environment separate from the agent’s environment. For example, you could run your agent’s tools in Lambda functions, while running the agent itself in a Fargate container.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.techtarget.com\&sz=32)

techtarget.com

AWS intros Strands Agents SDK | TechTarget

Strands Agents is a model-driven toolkit for building and running AI agents with a few lines of code, according to AWS. With Strands, developers can define a prompt and a list of tools in code to build an agent, test it and deploy it to the cloud, the vendor said.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

Agents exposed as MCP servers provide a micro-service-like architecture that decouples agents from each other, leveraging MCP as the common protocol for communication. You can get the complete working example here.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

Amazon’s Strands Agents SDK is an open-source framework for building AI agents that emphasizes a model-driven approach. Instead of hardcoding complex task flows, Strands leverages the reasoning abilities of modern large language models (LLMs) to handle planning and tool usage autonomously. Developers can create an agent with just a prompt (defining the agent’s role/behavior) and a list of tools, and the LLM-powered agent will figure out how to chain its “thoughts” and invoke tools as needed ￼. In other words, Strands “connects two core pieces of the agent together: the model and the tools,” much like two strands of DNA, and uses the model’s advanced reasoning to decide the agent’s next steps and execute tools. This dramatically simplifies agent development compared to traditional

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

agent with just a prompt (defining the agent’s role/behavior) and a list of tools, and the LLM-powered agent will figure out how to chain its “thoughts” and invoke tools as needed ￼. In other words, Strands “connects two core pieces of the agent together: the model and the tools,” much like two strands of DNA, and uses the model’s advanced reasoning to decide the agent’s next steps and execute tools. This dramatically simplifies agent development compared to traditional workflow-based frameworks.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

\* Lightweight, Flexible Agent Loop – Strands implements a simple yet extensible agent loop that drives the interaction. The LLM behind the agent iteratively reads the conversation (and context), plans an action, possibly calls a tool, and then incorporates the tool’s result before deciding the next step, until it reaches a final answer. This loop (often following a ReAct-style reasoning process ) is fully customizable when needed, but works out-of-the-box for most use cases.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

iteratively reads the conversation (and context), plans an action, possibly calls a tool, and then incorporates the tool’s result before deciding the next step, until it reaches a final answer. This loop (often following a ReAct-style reasoning process ) is fully customizable when needed, but works out-of-the-box for most use cases.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

Protocol (MCP) modelcontextprotocol.io servers to use as tools for your agent. Strands also provides 20+ pre-built example tools, including tools for manipulating files, making API requests, and interacting with AWS APIs. You can easily use any Python function as a tool, by simply using the Strands \`@tool\` decorator. 3. Prompt: You provide a natural language prompt that defines the task for your agent, such as answering a question from an end user. You can also provide a system prompt that provides general instructions and desired behavior for the agent.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

\* Tool Use and Integration – Tools are external functions or APIs the agent can call (for example: calculators, web search, database queries, etc.). Strands makes it easy to define tools in Python (with a simple @tool decorator) and supply them to agents. The SDK comes with an optional library of pre-built tools (strands-agents-tools) for common functionalities like arithmetic, web requests, and more. Notably, Strands has native support for the Model Context Protocol (MCP), an open standard that gives access to thousands of ready-made tools hosted on model servers. By connecting to an MCP server, an agent can tap into a large ecosystem of community-provided tools without custom code

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

define your own custom model provider with Strands. 2. Tools: You can choose from thousands of published Model Context Protocol (MCP) servers to use as tools for your agent. Strands also provides 20+ pre-built example tools, including tools for manipulating files, making API requests, and interacting with AWS APIs. You can easily use any Python function as a tool, by simply using the Strands \`@tool\` decorator. 3. Prompt: You provide a natural language prompt that defines the task for

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

\* Tool Use and Integration – Tools are external functions or APIs the agent can call (for example: calculators, web search, database queries, etc.). Strands makes it easy to define tools in Python (with a simple @tool decorator) and supply them to agents. The SDK comes with an optional library of pre-built tools (strands-agents-tools) for common functionalities like arithmetic, web requests, and more. Notably, Strands has native support for the Model Context Protocol (MCP), an open standard that gives access to thousands of ready-made tools hosted on model servers. By connecting to an MCP server, an agent can tap into a large ecosystem of community-provided tools without custom code

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.infoq.com\&sz=32)

infoq.com

Amazon Open Sources Strands Agents SDK for Building AI Agents - InfoQ

match at L283 use." Strands manages the technical complexity by handling tool execution: "When the LLM selects a tool, Strands takes care of executing the tool and providing the result back to the LLM." The process continues iteratively until "the LLM completes its task, Strands returns the agent's final result."

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.infoq.com\&sz=32)

infoq.com

Amazon Open Sources Strands Agents SDK for Building AI Agents - InfoQ

use." Strands manages the technical complexity by handling tool execution: "When the LLM selects a tool, Strands takes care of executing the tool and providing the result back to the LLM." The process continues iteratively until "the LLM completes its task, Strands returns the agent's final result."

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.reddit.com\&sz=32)

reddit.com

This sums up my experience with all LLM orchestration frameworks : r/LocalLLaMA

Yeah basically that. I know of at least two startups that died due to using Langchain and not taking the time to understand, appropriate and adapt the techniques that drive it at a low code level.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.reddit.com\&sz=32)

reddit.com

This sums up my experience with all LLM orchestration frameworks : r/LocalLLaMA

Langchain is great to learn how chain of thought works and that is it - it's too messy and unstable to use past that. In one of those startups, I did a workshop/consulting and their CTO quit the following week once it was apparent their entire tech stack was built on top of Langchain and they had zero agency over deviating from it.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.infoq.com\&sz=32)

infoq.com

Amazon Open Sources Strands Agents SDK for Building AI Agents - InfoQ

match at L288 Strands Agents positions itself as "lightweight and production-ready, supporting many model providers and deployment targets." The SDK offers flexibility across deployment scenarios, supporting "conversational, non-conversational, streaming, and non-streaming" agent types for different

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

\* Multi-agent tools like the workflow, graph, and swarm tools: For complex tasks, Strands can orchestrate across multiple agents in a variety of multi- agent collaboration patterns. By modeling sub-agents and multi-agent collaboration as tools, the model-driven approach enables the model to reason about if and when a task requires a defined workflow, graph, or swarm of sub- agents. Strands support for the Agent2Agent (A2A) protocol for multi-agent applications is coming soon.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

Regardless of your exact architecture, observability of your agents is important for understanding how your agents are performing in production. Strands provides instrumentation for collecting agent trajectories and metrics from production agents. Strands uses OpenTelemetry (OTEL) to emit telemetry data to any OTEL-compatible backend for visualization, troubleshooting, and evaluation. Strands’ support for distributed tracing enables you to track requests through different components in your architecture, in order to paint a complete picture of agent sessions.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://dev.to\&sz=32)

dev.to

What is AWS Strands Agent? AI App with AWS Strands, Bedrock, Nova, Fast API, Streamlit UI - DEV Community

I evaluated several AI agent frameworks (LangChain, CrewAI, AWS Strands, and Google ADK) across various use cases such as multi-agent collaboration, integration with MCP tools, support for multiple models, and workflow orchestration. Among them, I find AWS Strands and Google ADK particularly compelling. Both offer similar functionality and integrate well with other open- source solutions like LiteLLM (for handling various models) and MCP tools (e.g., StdioServerParameters).

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.infoq.com\&sz=32)

infoq.com

Amazon Open Sources Strands Agents SDK for Building AI Agents - InfoQ

match at L264 Ragas.io, and Tavily." Strands scales from simple to complex agent use cases, and from local development to deployment in production, offering developers a streamlined path from prototype to production-ready AI agents.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.infoq.com\&sz=32)

infoq.com

Amazon Open Sources Strands Agents SDK for Building AI Agents - InfoQ

Ragas.io, and Tavily." Strands scales from simple to complex agent use cases, and from local development to deployment in production, offering developers a streamlined path from prototype to production-ready AI agents.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

\* Retrieve tool: This tool implements semantic search using Amazon Bedrock Knowledge Bases. Beyond retrieving documents, the retrieve tool can also help the model plan and reason by retrieving other tools using semantic search. For example, one internal agent at AWS has over 6,000 tools to select from! Models today aren’t capable of accurately selecting from quite that many tools. Instead of describing all 6,000 tools to the model, the agent uses semantic search to find the most relevant tools for the current task and describes only those tools to the model. You can implement this pattern by

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

\# Load an MCP server that can determine if a domain name is available domain\_name\_tools = MCPClient(lambda: stdio\_client( StdioServerParameters(command="uvx", args=\["fastdomaincheck-mcp- server"]) ))

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

with domain\_name\_tools: # Define the naming agent with tools and a system prompt tools = domain\_name\_tools.list\_tools\_sync() + github\_tools naming\_agent = Agent( system\_prompt=NAMING\_SYSTEM\_PROMPT, tools=tools )

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

tools = domain\_name\_tools.list\_tools\_sync() + github\_tools naming\_agent = Agent( system\_prompt=NAMING\_SYSTEM\_PROMPT, tools=tools )

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

requests, and more. Notably, Strands has native support for the Model Context Protocol (MCP), an open standard that gives access to thousands of ready-made tools hosted on model servers. By connecting to an MCP server, an agent can tap into a large ecosystem of community-provided tools without custom code

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

your favorite AI-assisted development tool. To help you quickly get started, we published a Strands MCP server to use with any MCP-enabled development tool, such as the Q Developer CLI or Cline. For the Q Developer CLI, use the following example to add the Strands MCP server to the CLI’s MCP configuration. You can see more configuration examples on GitHub.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

"command": "uvx", "args": \["strands-agents-mcp-server"] } } }

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

To expose the Employee Info Agent to other agents, we only need to wrap it in an MCP server tool:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

Now that we have the Employee Info Agent exposed as an MCP Server, let’s see how we can integrate it with another agent, the HR agent. Suppose the HR agent is exposed as a REST endpoint. We can configure the HR agent to use the Employee Info Agent using MCP, the code is simply:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

Current reference servers

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

\* Filesystem - Secure file operations with configurable access controls \* Fetch - Web content fetching and conversion optimized for LLM usage \* Memory - Knowledge graph-based persistent memory system \* Sequential Thinking - Dynamic problem-solving through thought sequences

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

(strands-agents-tools) for common functionalities like arithmetic, web requests, and more. Notably, Strands has native support for the Model Context Protocol (MCP), an open standard that gives access to thousands of ready-made tools hosted on model servers. By connecting to an MCP server, an agent can tap into a large ecosystem of community-provided tools without custom code

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.facebook.com\&sz=32)

facebook.com

AWS just released an SDK to build AI Agents in just a few lines of ...

AWS just released an SDK to build AI Agents in just a few lines of ... AWS just released an SDK to build AI Agents in just a few lines of Python code. It defines an AI Agent as: AI Model + tools + instructions.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

Create a file named \`agent.py\` with this code:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

\* C# SDK \* Java SDK \* Kotlin SDK \* Python SDK \* Ruby SDK \* Swift SDK \* TypeScript SDK

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

The next diagram shows an architecture where the agent and its tools are deployed behind an API in production. We have provided reference implementations on GitHub for how to deploy agents built with the Strands Agents SDK behind an API on AWS, using AWS Lambda, AWS Fargate, or Amazon Elastic Compute Cloud (Amazon EC2).

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

Let’s see how we would build this architecture in Java using Spring AI. First, let’s say there is an MCP server that exposes data for an employee database. I can now build an agent (the Employee Info Agent) that uses the tools from the employee database MCP server:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

Info Agent using MCP, the code is simply:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

@Bean ChatClient chatClient( List mcpSyncClients, ChatClient.Builder builder ) { return builder .defaultToolCallbacks( new SyncMcpToolCallbackProvider(mcpSyncClients) ) .build();

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

/\* Configure the MCP Servers, e.g. in application.properties: spring.ai.mcp.client.sse.connections.employee\_root.url=\${mcp- service.url: \*/

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

\* Scalability from Prototypes to Production – The same Strands agent code can run locally for quick testing and then be deployed to AWS for production use. The SDK is already used internally at AWS for agent-based features in services like Amazon Q (developer assistant), AWS Glue, and VPC Reachability Analyzer. It supports running agents in various environments (EC2, AWS Lambda, Fargate, containers, etc.) and even isolating tool execution from the agent (for security

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

linkedin.com

Amazon Strands Agents SDK: A Technical Deep Dive into Agent Architectures and Observability

The SDK is already used internally at AWS for agent-based features in services like Amazon Q (developer assistant), AWS Glue, and VPC Reachability Analyzer. It supports running agents in various environments (EC2, AWS Lambda, Fargate, containers, etc.) and even isolating tool execution from the agent (for security

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

Now run your agent:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

pip install strands-agents strands-agents-tools python -u agent.py

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

1\. Model: Strands offers flexible model support. You can use any model in Amazon Bedrock that supports tool use and streaming, a model from Anthropic’s Claude model family through the Anthropic API, a model from the Llama model family via Llama API, Ollama for local development, and many other model providers such as OpenAI through LiteLLM. You can additionally define your own custom model provider with Strands. 2. Tools: You can choose from thousands of published Model Context Protocol (MCP) servers to use as tools for your agent. Strands also provides 20+ pre-built example tools,

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

TypeScript-based servers can be used directly with \`npx\`:

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

\# Using uvx uvx mcp-server-git

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

You can also implement a return-of-control pattern with Strands, where the client is responsible for running tools. This diagram shows an agent architecture where an agent built with the Strands Agents SDK can use a mix of tools that are hosted in a backend environment and tools that run locally

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

You can also implement a return-of-control pattern with Strands, where the client is responsible for running tools. This diagram shows an agent architecture where an agent built with the Strands Agents SDK can use a mix of tools that are hosted in a backend environment and tools that run locally through a client application that invokes the agent.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

production. Strands is flexible enough to support a variety of architectures in production. You can use Strands to build conversational agents as well as agents that are triggered by events, run on a schedule, or run continuously. You can deploy an agent built with the Strands Agents SDK as a monolith, where both the agentic loop and the tool execution run in the same environment, or as a set of microservices. I will describe four agent architectures that we use internally at AWS with Strands Agents.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Unlocking the power of Model Context Protocol (MCP) on AWS | AWS Machine Learning Blog

What makes MCP especially powerful is its ability to work across both local and remote implementations. You can run MCP servers directly on your development machine for testing or deploy them as distributed services across your AWS infrastructure for enterprise-scale applications.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Unlocking the power of Model Context Protocol (MCP) on AWS | AWS Machine Learning Blog

What makes MCP especially powerful is its ability to work across both local and remote implementations. You can run MCP servers directly on your development machine for testing or deploy them as distributed services across your AWS infrastructure for enterprise-scale applications.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

npx -y @modelcontextprotocol/server-memory

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

1\. Model: Strands offers flexible model support. You can use any model in Amazon Bedrock that supports tool use and streaming, a model from Anthropic’s Claude model family through the Anthropic API, a model from the Llama model family via Llama API, Ollama for local development, and many other model providers such as OpenAI through LiteLLM. You can additionally define your own custom model provider with Strands. 2. Tools: You can choose from thousands of published Model Context Protocol (MCP) servers to use as tools for your agent.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

An agent interacts with its model and tools in a loop until it completes the task provided by the prompt. This agentic loop is at the core of Strands’ capabilities. The Strands agentic loop takes full advantage of how powerful LLMs have become and how well they can natively reason, plan, and select tools. In each loop, Strands invokes the LLM with the prompt and agent context, along with a description of your agent’s tools. The LLM can choose to respond in natural language for the agent’s end user, plan out a series of steps, reflect on the agent’s previous steps, and/or select one or more tools to use. When the LLM selects a tool, Strands takes care of executing the tool and providing the

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

Running agents in production is a key tenet for the design of Strands. The Strands Agents project includes a deployment toolkit with a set of reference implementations to help you take your agents to production. Strands is flexible enough to support a variety of architectures in production. You can use Strands to build conversational agents as well as agents that are triggered by events, run on a schedule, or run continuously. You can deploy an agent built with the Strands Agents SDK as a monolith, where both the agentic loop and the tool execution run in the same environment, or as a set of microservices. I will describe four agent architectures that we use internally at AWS with Strands Agents.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://modelcontextprotocol.io\&sz=32)

modelcontextprotocol.io

Example Servers - Model Context Protocol

Data and file systems

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

ChatClient chatClient(List mcpSyncClients, ChatClient.Builder builder) { return builder .defaultToolCallbacks(new SyncMcpToolCallbackProvider(mcpSyncClients)) .build(); } }

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

You will need a GitHub personal access token to run the agent. Set the environment variable \`GITHUB\_TOKEN\` with the value of your GitHub token. You will also need Bedrock model access for Anthropic Claude 3.7 Sonnet in us-west-2, and AWS credentials configured locally.

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

Enhancing MCP for Inter-Agent Collaboration

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

\* Human In the Loop Interactions. Updates to the MCP specification and Python SDK to introduce “elicitation” to enable MCP servers to request more information from an end user. \[Specification PR] \[Implementation PR] \* Streaming Partial Results. An update to the MCP specification and Python SDK to enable providing partial results as a server is processing a long-running request. Note: intermediate results are already supported via SSE. \[Specification PR] \[Implementation PR] \* Enhanced Capability Discovery. Updates to the MCP specification and Python

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

\* Human In the Loop Interactions. Updates to the MCP specification and Python SDK to introduce “elicitation” to enable MCP servers to request more information from an end user. \[Specification PR] \[Implementation PR] \* Streaming Partial Results. An update to the MCP specification and Python SDK to enable providing partial results as a server is processing a long-running request. Note: intermediate results are already supported via SSE. \[Specification PR] \[Implementation PR] \* Enhanced Capability Discovery. Updates to the MCP specification and Python

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Open Protocols for Agent Interoperability Part 1: Inter-Agent Communication on MCP | AWS Open Source Blog

PR github.com ] \* Asynchronous Communication. Updates to the MCP specification to support simpler abstractions for asynchronous communication, shared state, and client- poller-driven status checks. \[Specification PR]

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Introducing Strands Agents, an Open Source AI Agents SDK | AWS Open Source Blog

define your own custom model provider with Strands. 2. Tools: You can choose from thousands of published Model Context Protocol (MCP) servers to use as tools for your agent. Strands also provides 20+ pre-built example tools, including tools for manipulating files, making API requests, and interacting with AWS APIs. You can easily use any Python function as a tool, by simply using the Strands \`@tool\` decorator. 3. Prompt: You provide a natural language prompt that defines the task for your agent, such as answering a question from an end user. You can also provide

]\(

![Favicon](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

aws.amazon.com

Unlocking the power of Model Context Protocol (MCP) on AWS | AWS Machine Learning Blog

The MCP is an open standard that creates a universal language for AI systems to communicate with external data sources, tools, and services. Conceptually, MCP functions as a universal translator, enabling seamless dialogue between language models and the diverse systems where your valuable information resides.

]\()

All Sources