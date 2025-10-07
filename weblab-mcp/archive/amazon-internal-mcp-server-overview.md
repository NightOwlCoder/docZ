# Amazon Internal MCP Server Overview

## What is Amazon Internal MCP Server?

The Amazon Internal MCP Server is a community-driven project that implements the Model Context Protocol (MCP), a standardized specification for enabling AI systems to interact with external tools and data sources. This server specifically focuses on providing LLM applications with secure, authenticated access to Amazon's vast internal knowledge ecosystem.

## Core Capabilities

- **Internal Website Access:** Read and search content from internal Amazon websites and wikis
- **Document Management:** Interact with Quip documents, COE documents, and ORR documents
- **Issue Tracking:** Search and manipulate SIM issues
- **Code Search:** Access Amazon's internal code repositories
- **People Directory:** Search for Amazon employees with advanced filtering
- **Diagramming:** Create and decode PlantUML diagrams
- **Design Systems:** Interact with Pippin design projects and Katal component library
- **Policy Engine:** Access Amazon Policy Engine risk and compliance information

## Integration Ecosystem

This MCP server seamlessly integrates with Amazon's AI technology stack:

- **Aki:** Pre-installed and configured for immediate use with Aki
- **Cline:** Visual Studio Code extension with built-in MCP support
- **Q CLI:** Command-line interface for programmatic server access
- **Strands Agents:** Simple-to-use, code-first framework for building agents
- **Custom LLM Applications:** Compatible with any application implementing the MCP client specification

## Installation & Setup

### Toolbox Installation (Recommended)
Available on Mac (ARM CPU), Amazon Linux 2, and Ubuntu via Amazon's toolbox.

1. **Install toolbox:** [Toolbox Getting Started Guide](https://docs.hub.amazon.dev/builder-toolbox/user-guide/getting-started/)
2. **Install amzn-mcp:**
   ```bash
   toolbox registry add s3://amzn-mcp-prod-registry-bucket-us-west-2/tools.json
   toolbox install amzn-mcp
   ```

### Docker Installation
Docker container for platform-independent deployment.

1. **Install Harmony CLI:** [Harmony Getting Started](https://console.harmony.a2z.com/docs/getting-started.html#Installing%20the%20CLI)
2. **Configure npm for Amazon registry:**
   ```bash
   harmony npm
   ```
3. **Install Docker:** [Docker Installation](https://docs.docker.com/get-started/get-docker/)
4. **Install and login to Amazon Container Registry:**
   ```bash
   toolbox install acr && docker-credential-acr-login --setup
   ```
5. **Pull the Docker image:**
   ```bash
   docker pull --platform=linux/arm64 dkr.acr.builder-tools.aws.dev/mcp/amazon-internal-mcp:arm64
   ```

## Getting Started

To start developing with the Amazon Internal MCP Server:

### 1. Clone and Build
```bash
# Create your workspace
cd ${HOME} && mkdir ${HOME}/mcp
cd ${HOME}/mcp && brazil ws create -n amazon-internal-mcp-server
cd ${HOME}/mcp/amazon-internal-mcp-server && brazil ws use -vs Aki/development && brazil ws use -p AmazonInternalMCPServer

# Build the server
cd ${HOME}/mcp/amazon-internal-mcp-server/src/AmazonInternalMCPServer && brazil-build
```

### 2. Start the Server
```bash
npm start --verbose
```

### 3. Test Your Setup
```bash
# Test with MCP Inspector (recommended)
npx @modelcontextprotocol/inspector npm start

# Or test with direct JSON-RPC
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "read_internal_website", "arguments": {"url": "/bin/view/ModelContextProtocol"}}, "id": 1}' | npm start
```

## Available Tools

The server provides a comprehensive set of tools organized by functionality:

### Read Tools (Content Retrieval)
- **read_internal_website:** Read content from internal Amazon websites
- **read_quip:** Read Quip document HTML with section IDs
- **read_coe:** Read Correction of Error (COE) documents
- **read_kingpin_goal:** Read Kingpin goals by ID
- **read_orr:** Read Operational Readiness Review (ORR) documents
- **sim_get_issue:** Get detailed information about a specific SIM issue
- **sim_get_folders:** Get a list of available SIM folders

### Search Tools (Content Discovery)
- **search_internal_websites:** Search using Amazon's internal search engine
- **search_quip:** Search for Quip threads using keywords
- **search_internal_code:** Search across files in Amazon's internal code repositories
- **search_internal_issues:** Search internal issues from i.amazon.com
- **search_datapath:** Search Datapath views
- **search_people:** Search for Amazon employees with filtering
- **search_products:** Search for products on Amazon website
- **sim_search_issues:** Search for SIM issues using structured query syntax

### Create/Edit Tools (Content Modification)
- **edit_quip:** Edit Quip documents with targeted section modifications
- **create_quip:** Create new Quip documents or spreadsheets
- **sim_create_issue:** Create a new SIM issue
- **sim_update_issue:** Update an existing SIM issue
- **sim_add_comment:** Add a comment to an existing SIM issue

### Diagram Tools
- **plantuml:** Create and decode PlantUML diagrams using Amazon's internal PlantUML server

### Design Tools
- **Pippin Tools:** Design service tools for projects and artifacts
- **Katal Tools:** Component library tools for UI components
- **Policy Engine Tools:** Access Amazon Policy Engine risk and compliance information

## Build & Development Commands

| Task | Command | Description |
|------|---------|-------------|
| Build | `npm run build` or `brazil-build` | Builds the project and runs tests |
| Test all | `npm test` or `vitest run --reporter=tap-flat` | Runs all tests with tap-flat reporter |
| Single test | `vitest run path/to/file.test.ts` | Runs a specific test file |
| Watch tests | `npm run test:watch` or `vitest` | Runs tests in watch mode |
| Lint (CDK) | `npm run lint` | Runs eslint and prettier |
| Format (CDK) | `npm run format` | Runs eslint --fix and prettier |
| Start server | `npm start [options]` | Starts the MCP server with optional flags |
| Run CLI | `npm run cli [tool_name] [arguments]` | Executes a specific tool via CLI |
| Generate tool list | `npm run generate-tool-list` | Generates tool_names.txt with all available tools |
| Integration tests | `bash scripts/run-simple-tests.sh` | Runs simple integration tests |

## Client Configuration

### Generic MCP Client Configuration
```json
{
  "mcpServers": {
   "amzn-mcp": {
      "command": "amzn-mcp",
      "args": [
        "--include-tags=read",  // Optional: Include only tools with all these tags
        "--exclude-tags=write"  // Optional: Exclude tools with any of these tags
      ],
      "disabled": false,
      "env": {},
      "autoApprove": []
   }
  }
}
```

### Quip API Token Configuration
Configure Quip API token to use Quip-related tools:

1. Through `QUIP_API_TOKEN` environment variable, or
2. Through an env file with `QUIP_API_TOKEN=<token>` by:
   - Creating an env file at `~/.amazon-internal-mcp-server/.env` or
   - Providing a custom env file location via `AMAZON_MCP_SERVER_CONFIG_PATH` environment variable

To get Quip API token visit: https://quip-amazon.com/dev/token

## Community

Connect with other developers and users through these channels:
- **#modelcontextprotocol-interest** (formerly known as #mcp-interest) - MCP server development
- **#aki-interest** - A cool MCP client with UI