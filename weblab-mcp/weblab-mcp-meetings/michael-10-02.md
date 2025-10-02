# Michael Bower (bowemi)
# Thu, October 2 | 02:00 PM - 02:30 PM PDT
The team discussed two main technical areas: ongoing Android latency issues and planning for a mandatory MCP (Model Context Protocol) server implementation. The Android latency problems continue to be challenging to diagnose, with discrepancies between device farm testing and real-world performance metrics. The team identified potential issues with CPU sharing and background processing that may be contributing to the 50-millisecond delays observed. 

## MCP Server Implementation Planning 
The primary focus was planning the MCP server implementation to meet Amazon's mandate for services with over 100 customers. The WebLab service qualifies with 125 customers and must implement a remote-first MCP approach. The architecture decision shifted from local to remote implementation, which will run as an agent in the cloud rather than on user devices. 

## Data Access and Use Cases 
The team discussed data access strategies, with Westlake providing the primary data source for WebLab information. The remote architecture will solve previous data access challenges since the server will have proper IAM roles and permissions. Key use cases identified include WebLab querying, organizational WebLab discovery, and troubleshooting TAA issues. The team agreed to focus on read-only capabilities initially, with later tools being able to create/change weblab states, but avoiding code modification features that would cross team ownership boundaries. 

## Infrastructure and Security 
Decisions were made regarding infrastructure setup, including creating dedicated AWS accounts and bindle access for the virtual team. The security review process was discussed as manageable, with staged completion allowing development to begin before full approval. The team emphasized the importance of proper access controls and avoiding the pitfalls of shared dumping-ground accounts.

## Decisions
-   MCP server will use remote-first architecture instead of local implementation
-   New AWS account and bindle will be created specifically for the MCP project
-   Focus on read-only capabilities initially, later we will have write access on some tools, but avoiding code modification features
-   Use Athena for querying data lake instead of direct Westlake access

## Next Steps
-   Complete security review process for new AWS account setup
-   Receive metrics CR from AmazonInternalMCPServer team within one week
-   Explore Athena integration for data querying capabilities
-   Gather additional use cases from team members and stakeholders