# Strands Agents Reference

## Overview

[Strands Agents](https://github.com/strands-agents/sdk-python) is a simple-to-use, code-first framework for building agents.

## Quick Start

First, install the Strands Agents SDK:

```bash
pip install strands-agents
```

Then create your first agent as a Python file, for this example we'll use `agent.py`:

```python
from strands import Agent

# Create an agent with default settings
agent = Agent()

# Ask the agent a question
agent("Tell me about agentic AI")
```

Now run the agent with:

```bash
python -u agent.py
```

## Features

Strands Agents is lightweight and production-ready, supporting many model providers and deployment targets.

Key features include:

* **Lightweight and gets out of your way**: A simple agent loop that just works and is fully customizable.
* **Production ready**: Full observability, tracing, and deployment options for running agents at scale.
* **Model, provider, and deployment agnostic**: Strands supports many different models from many different providers.
* **Powerful built-in tools**: Get started quickly with tools for a broad set of capabilities.
* **Multi-agent and autonomous agents**: Apply advanced techniques to your AI systems like agent teams and agents that improve themselves over time.
* **Conversational, non-conversational, streaming, and non-streaming**: Supports all types of agents for various workloads.
* **Safety and security as a priority**: Run agents responsibly while protecting data.

## Installation & Setup

### Install the SDK

First, ensure that you have Python 3.10+ installed.

We'll create a virtual environment to install the Strands Agents SDK and its dependencies in to.

```bash
python -m venv .venv
```

And activate the virtual environment:

* macOS / Linux: `source .venv/bin/activate`
* Windows (CMD): `.venv\Scripts\activate.bat`
* Windows (PowerShell): `.venv\Scripts\Activate.ps1`

Next we'll install the `strands-agents` SDK package:

```bash
pip install strands-agents
```

The Strands Agents SDK additionally offers the [`strands-agents-tools`](https://pypi.org/project/strands-agents-tools/) ([GitHub](https://github.com/strands-agents/tools)) and [`strands-agents-builder`](https://pypi.org/project/strands-agents-builder/) ([GitHub](https://github.com/strands-agents/agent-builder)) packages for development. The [`strands-agents-tools`](https://pypi.org/project/strands-agents-tools/) package provides many example tools that give your agents powerful abilities. The [`strands-agents-builder`](https://pypi.org/project/strands-agents-builder/) package provides an agent that helps you to build your own Strands agents and tools.

Let's install those development packages too:

```bash
pip install strands-agents-tools strands-agents-builder
```

### Configuring Credentials

Strands supports many different model providers. By default, agents use the Amazon Bedrock model provider with the Claude 3.7 model.

To use the examples in this guide, you'll need to configure your environment with AWS credentials that have permissions to invoke the Claude 3.7 model. You can set up your credentials in several ways:

1. **Environment variables**: Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and optionally `AWS_SESSION_TOKEN`
2. **AWS credentials file**: Configure credentials using `aws configure` CLI command
3. **IAM roles**: If running on AWS services like EC2, ECS, or Lambda, use IAM roles

Make sure your AWS credentials have the necessary permissions to access Amazon Bedrock and invoke the Claude 3.7 model. You'll need to enable model access in the Amazon Bedrock console following the [AWS documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access-modify.html).

## Project Setup

Now we'll create our Python project where our agent will reside. We'll use this directory structure:

```
my_agent/
├── __init__.py
├── agent.py
└── requirements.txt
```

Create the directory: `mkdir my_agent`

Now create `my_agent/requirements.txt` to include the `strands-agents` and `strands-agents-tools` packages as dependencies:

```
strands-agents>=0.1.0
strands-agents-tools>=0.1.0
```

Create the `my_agent/__init__.py` file:

```python
from . import agent
```

And finally our `agent.py` file where the goodies are:

```python
from strands import Agent, tool
from strands_tools import calculator, current_time, python_repl

# Define a custom tool as a Python function using the @tool decorator
@tool
def letter_counter(word: str, letter: str) -> int:
    """
    Count occurrences of a specific letter in a word.

    Args:
        word (str): The input word to search in
        letter (str): The specific letter to count

    Returns:
        int: The number of occurrences of the letter in the word
    """
    if not isinstance(word, str) or not isinstance(letter, str):
        return 0

    if len(letter) != 1:
        raise ValueError("The 'letter' parameter must be a single character")

    return word.lower().count(letter.lower())

# Create an agent with tools from the strands-tools example tools package
# as well as our custom letter_counter tool
agent = Agent(tools=[calculator, current_time, python_repl, letter_counter])

# Ask the agent a question that uses the available tools
message = """
I have 4 requests:

1. What is the time right now?
2. Calculate 3111696 / 74088
3. Tell me how many letter R's are in the word "strawberry" 🍓
4. Output a script that does what we just spoke about!
   Use your python tools to confirm that the script works before outputting it
"""
agent(message)
```

This basic quickstart agent can perform mathematical calculations, get the current time, run Python code, and count letters in words. The agent automatically determines when to use tools based on the input query and context.

## Examples Overview

The examples directory provides a collection of sample implementations to help you get started with building intelligent agents using Strands Agents. This directory contains two main subdirectories: `/examples/python` for Python-based agent examples and `/examples/cdk` for Cloud Development Kit integration examples.

### Purpose

These examples demonstrate how to leverage Strands Agents to build intelligent agents for various use cases. From simple file operations to complex multi-agent systems, each example illustrates key concepts, patterns, and best practices in agent development.

By exploring these reference implementations, you'll gain practical insights into Strands Agents' capabilities and learn how to apply them to your own projects. The examples emphasize real-world applications that you can adapt and extend for your specific needs.

### Available Python Examples

* [Agents Workflows](python/agents_workflows/) - Example of a sequential agent workflow pattern
* [CLI Reference Agent](python/cli-reference-agent/) - Example of Command-line reference agent implementation
* [File Operations](python/file_operations/) - Example of agent with file manipulation capabilities
* [MCP Calculator](python/mcp_calculator/) - Example of agent with Model Context Protocol capabilities
* [Meta Tooling](python/meta_tooling/) - Example of Agent with Meta tooling capabilities
* [Multi-Agent Example](python/multi_agent_example/multi_agent_example/) - Example of a multi-agent system
* [Weather Forecaster](python/weather_forecaster/) - Example of a weather forecasting agent with http_request capabilities

### Available CDK Examples

* [Deploy to EC2](cdk/deploy_to_ec2/) - Guide for deploying agents to Amazon EC2 instances
* [Deploy to Fargate](cdk/deploy_to_fargate/) - Guide for deploying agents to AWS Fargate
* [Deploy to Lambda](cdk/deploy_to_lambda/) - Guide for deploying agents to AWS Lambda

### Amazon EKS Example

The `/examples/deploy_to_eks` directory contains examples for using Amazon EKS with agents.   
The [Deploy to Amazon EKS](deploy_to_eks/) includes its own documentation with instruction for setup and deployment.

## Example Structure

Each example typically follows this structure:

* Python implementation file(s) (`.py`)
* Documentation file (`.md`) explaining the example's purpose, architecture, and usage
* Any additional resources needed for the example

To run any specific example, refer to its associated documentation for detailed instructions and requirements.

## Preview

Strands Agents is currently available in public preview. During this preview period, we welcome your feedback and contributions to help improve the SDK. APIs may change as we refine the SDK based on user experiences.

[Learn how to contribute](https://github.com/strands-agents/sdk-python/blob/main/CONTRIBUTING.md) or join our community discussions to shape the future of Strands Agents ❤️.