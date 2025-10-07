# MCP Automation Case Studies

*A collection of real-world examples demonstrating the value and demand for MCP integration*

---

## AmazonInternalMCPServer Team: Weblab MCP Tools (Reverted)

**Team:** AmazonInternalMCPServer (Nick Eng)  
**Tool Automated:** Weblab experiment data access  
**Implementation:** MCP tools using internal UI endpoints  
**Date:** May 2025  
**Status:** SHIPPED then REVERTED  
**CR:** [CR-196833998](https://code.amazon.com/reviews/CR-196833998/revisions/1)

### The Problem
- Developers needed programmatic access to weblab experiment data
- No proper public API access available for MCP integration
- Manual navigation of Weblab UI was time-consuming
- Teams needed to search experiments, check allocations, view history

### The Solution
Nick Eng built 5 MCP tools for weblab access:
1. **weblab_search** - Search experiments by creator, status, resolver group
2. **weblab_details** - Get detailed experiment information
3. **weblab_allocations** - View current treatment allocations
4. **weblab_activation_history** - Track activation history with MCM info
5. **weblab_treatment_assignment** - Get treatment assignment for visitor ID

**Implementation Details:**
- Used internal UI endpoints: `/api`, `/v2/api`, `/s/_xhr/page`
- Bypassed public API requirements
- Added to amzn-mcp package for broad distribution

### Impact
- Successfully shipped and working
- Provided natural language access: "What experiments did my team modify yesterday?"
- Could answer complex queries: "What's the MCM for the last change to experiment XYZ?"
- **REVERTED** after Keith Norman (Weblab team) identified it was using internal APIs

### Why It Was Reverted
Keith Norman's feedback:
> "This needs to use the 'public' weblab API, you are essentially hacking the API backdoor used by the weblab UI, which lacks many of the safeguards the public API has in place to prevent clients from overloading and compromising the weblab service, which is a tier-1 service."

### Lessons Learned
- Teams are building "scrapers" even within MCP tools when APIs aren't available
- Using internal UI endpoints is essentially web scraping, just with different transport
- Tier-1 services are at risk when teams bypass public APIs
- Demonstrates urgent need for proper API access with rate limiting
- Even well-intentioned MCP implementations can become scrapers

### MCP Implications
This case demonstrates:
1. **Pattern of scraping** - Teams will scrape even through MCP if no API exists
2. **Service risk** - Internal endpoints lack proper safeguards
3. **Demand signal** - Teams investing significant effort to automate weblab access
4. **Architecture matters** - Proper APIs with rate limiting are essential
5. **Governance needed** - MCP tools need review to prevent internal scraping

---

## Finance Team: Jarvis Scraper for APT Tool

**Team:** Finance (Lev Agreda's team)  
**Tool Automated:** APT Tool weblab metrics extraction  
**Implementation:** Python + Playwright browser automation ("Jarvis")  
**Date:** September 2025  
**Source:** [Slack thread in #q-finance](https://amzn-wwc.slack.com/archives/C08GJKNC3KM/p1755214797979559)  
**Script:** [simple_browser_jarvis.py](https://files.slack.com/files-pri/T015GUGD2V6-F09AV8DR7DF/simple_browser_jarvis.py)

### The Problem
- Manual extraction of APT Tool weblab metrics took 5 hours
- Needed to extract 7 key metrics: OPS, GCCP, Ad Revenue, etc. from experiment results
- Complex filtering required: View + Market + Date + GCCP + Status
- Repetitive process across multiple weblabs
- Treatment-specific extraction needed for each experiment

### The Solution
Built "Jarvis" - a Python automation tool using Playwright that:
1. **Authenticates** to internal sites using Midway cookies
2. **Navigates** to `https://apttool.amazon.com/weblab/find/`
3. **Applies filters** (5 criteria: View + Market + Date + GCCP + Status)
4. **Extracts metrics** - Annualized values from APT regression analysis
5. **Consolidates data** for Finance reporting
6. **Batch processes** multiple weblabs with treatment-specific extraction

### Impact
- **96% time reduction** - From 5 hours to 10 minutes
- **7 metrics automated** - OPS, GCCP, Ad Revenue, and others
- **Batch processing** - Multiple weblabs in single run
- **Finance team efficiency** - Freed up ~4.5 hours per analysis cycle

### Technical Details
- **Language:** Python
- **Browser Automation:** Playwright
- **Authentication:** Midway cookies
- **Target:** APT Tool (`https://apttool.amazon.com/weblab/find/`)
- **Extraction:** Annualized metrics from regression analysis

### Lessons Learned
- Teams will build their own solutions when manual processes are painful enough
- Browser automation generates unnecessary load (full page loads vs API calls)
- Web scrapers are fragile - UI changes break automation
- Uncontrolled scraping can impact service availability
- Strong evidence for MCP value proposition: stable APIs vs brittle scrapers

### MCP Implications
This case demonstrates:
1. **Clear demand** - Teams are already investing in automation
2. **Quantifiable ROI** - 96% time savings is compelling
3. **Service impact** - Scrapers generate inefficient full page loads
4. **Architecture matters** - MCP provides proper solution with:
   - Cacheable, structured API responses
   - Proper rate limiting and throttling
   - No breaking when UI changes
   - Reduced backend load
5. **Pattern recognition** - If Finance is doing this, other teams likely are too

---

## [Future Case Study Placeholder]

*Add additional case studies as we discover them*

### Template for New Cases:

**Team:** [Team Name]  
**Tool Automated:** [Internal tool being accessed]  
**Implementation:** [How they're currently solving it]  
**Date:** [When discovered/implemented]

### The Problem
- [Describe manual process pain points]

### The Solution  
- [Current workaround/automation approach]

### Impact
- [Quantifiable metrics if available]

### Lessons Learned
- [Key insights for MCP]

---

## Common Patterns Observed

### Why Teams Build Scrapers
1. **Time savings** - Manual processes taking hours
2. **Repetitive tasks** - Same data extraction repeatedly
3. **No API available** - Web UI is only interface
4. **Immediate need** - Can't wait for proper solution

### Problems with Scraper Approach
1. **Fragility** - UI changes break scrapers
2. **Maintenance burden** - Constant updates needed
3. **Security concerns** - Credentials in scripts
4. **Performance** - Slower than API calls
5. **Rate limiting** - No proper throttling

### MCP as the Solution
1. **Stable interface** - APIs don't change like UIs
2. **Proper authentication** - Secure credential management
3. **Rate limiting** - Service protection built-in
4. **Performance** - Direct data access
5. **Community support** - Shared maintenance burden

---

## Metrics Summary

| Team    | Tool        | Manual Time | Automated Time | Reduction | Method   |
|---------|-------------|-------------|----------------|-----------|----------|
| Finance | APT Tool    | 5 hours     | 10 minutes     | 96%       | Scraper  |
| [TBD]   | [TBD]       | [TBD]       | [TBD]          | [TBD]     | [TBD]    |

---

## Using These Case Studies

### For Leadership
- Demonstrate quantifiable ROI
- Show organic demand from teams
- Justify investment in MCP infrastructure

### For Technical Audiences  
- Highlight architectural benefits
- Show migration path from scrapers to APIs
- Demonstrate scalability advantages

### For Team Onboarding
- Show peer teams already benefiting
- Provide concrete time savings examples
- Build confidence in solution value

---

*Last Updated: September 12, 2025*
