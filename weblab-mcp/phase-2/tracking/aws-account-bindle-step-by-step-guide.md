# AWS Account & Bindle Creation - Step-by-Step Guide

**Project:** Weblab MCP Phase 2  
**Owner:** Sergio Ibagy  
**Date:** October 13, 2025  
**Status:** Ready to Execute

---

## Prerequisites

Before starting, gather:
- [ ] Your team's POSIX group name (example: `weblab-mcp-team`)
- [ ] Manager's approval for new AWS account
- [ ] CTI information (or create new CTI)
- [ ] Purpose/justification for the account

**Estimated Time:**
- AWS Account Creation: ~15 min (+ 30 min approval wait)
- Bindle Creation: ~10 min
- Security Review Submission: ~15 min
- **Total: ~70 minutes**

---

## Part 1: Create CTI (Category, Type, Item)

CTI is required for both AWS account and bindle creation.

### Option A: Use Existing CTI

Check if your team already has a suitable CTI at https://cti.amazon.com

### Option B: Create New CTI

1. Go to https://cti.amazon.com
2. Click **Create New CTI**
3. Fill in:
   - **Category:** `Software`
   - **Type:** `Bindle` or `MCP` or `WeblabMCP`
   - **Item:** `Development` or specific use case
   - **Resolver Group:** Your team's resolver group (or create new)

**Recommended CTI for Weblab MCP:**
- Category: `Software`
- Type: `WeblabMCP`
- Item: `Phase2Development`

**Save this CTI** - you'll need it for Steps 2 and 3.

---

## Part 2: Create Software Application Bindle

**Why First?** The AWS account will reference this bindle.

### Step 2.1: Create the Bindle

1. Go to https://bindles.amazon.com
2. Click **Create new Bindle** (left navigation)
3. Fill in the form:

   **Name:** `WeblabMCPServer`  
   ⚠️ **CRITICAL:** Cannot be changed later. Choose wisely.

   **Description:**
   ```
   Weblab MCP Server - Remote Strands agent providing MCP tools for weblab 
   experiment data access. Phase 2 implementation for MCP Everywhere CCI mandate.
   READ-ONLY for 2025.
   ```

   **Owning Team:** Select your team  
   - Find your teams at: https://permissions.amazon.com/a/user/
   - Or create new team at: https://permissions.amazon.com/a/team/new

   **CTI:** Select the CTI created in Part 1

4. Click **Submit**

### Step 2.2: Configure Bindle Permissions

**IMPORTANT:** Do this before creating AWS account to avoid permission gaps.

1. Navigate to your new bindle:  
   `https://bindles.amazon.com/software_app/WeblabMCPServer`

2. Verify it's a **SoftwareApp** bindle (not PersonalSoftwareBindle)

3. Under **Permissions**, click **+ Add** → **Custom Permissions**

4. Grant permissions to your team:
   - **Type:** Team
   - **Team Name:** Your team's POSIX group
   - Click **Next Step** → **Grant {} new permissions** → **Other Permissions**

5. Search for and grant these resource types:
   - `AWS Account` (you'll need this when creating the account)
   - `Datanet DB User` (if using Andes)
   - Any other resources you'll manage

6. For your team, grant:
   - **Can administer AWS account**
   - **Can read** (all resource types)
   - **Can write** (as needed)

**Save the bindle name:** `WeblabMCPServer`

---

## Part 3: Create AWS Account via Conduit

### Step 3.1: Request Account

1. Go to https://conduit.security.a2z.com/create-account

2. Fill in the form:

   **Account Email:**
   ```
   weblab-mcp+phase2-dev@amazon.com
   ```
   Convention: `service-name+purpose@amazon.com`

   **Account Name:**
   ```
   WeblabMCPServer-Phase2-Dev
   ```
   Descriptive name for the account purpose.

   **Bindle:** Select `WeblabMCPServer` (created in Part 2)

   **Fleet:** Choose your team's fleet  
   Or create new: https://fleet-management-console.amazon.com/fleets

   **Financial Owner:** Your manager or team lead

   **Description:**
   ```
   Development AWS account for Weblab MCP Phase 2 implementation. 
   Hosts remote Strands agent (Lambda/Fargate) with MCP protocol 
   interface. Used for WeblabStrandsAgent deployment, testing, 
   and development. READ-ONLY operations for 2025.
   ```

   **Account Type:** Service (CTI required)

   **CTI:** Select the CTI from Part 1

   **Account Classification:**
   - [ ] **Production?** NO (select non-production for dev)
   - [ ] **Has Customer Data?** NO
   - [ ] **Has Customer Metadata?** TBD (depends on weblab data classification)
   - [ ] **Has AWS Business Data?** NO

   ⚠️ **Data Classification Note:**  
   Based on Michael's meeting: Need to determine if weblab experiment 
   data contains customer metadata. If YES, mark accordingly.

   **S3 Public Access:** Leave as default (secure by default)

   **Opt-In Regions:** Leave blank unless specific region needed

3. Click **Submit**

### Step 3.2: Wait for Approvals

- Account should be ready in **<10 minutes**
- May require Fleet Owner approvals (varies by org)
- You'll receive notification when ready
- **Account ID** will be provided - save this!

### Step 3.3: Verify Account Access

1. Go to https://isengard.amazon.com
2. Find your new account: `WeblabMCPServer-Phase2-Dev`
3. Click **Manage** → **Console Roles**
4. Verify these roles exist:
   - **Admin** - Full access (use carefully)
   - **ReadOnly** - Safe read-only access

If roles are missing, create them:

**Admin Role:**
- Name: `Admin`
- Description: `Admin role with full AWS permissions`
- POSIX Groups: Your team's group
- Attached Policies: `AdministratorAccess`

**ReadOnly Role:**
- Name: `ReadOnly`
- Description: `Read-only role for safe operations`
- POSIX Groups: Your team's group
- Attached Policies: `ReadOnlyAccess`

---

## Part 4: Security Review Submission

### Step 4.1: Determine Data Classification

Based on your roadmap, weblab data may include:
- Experiment configurations (non-customer)
- Allocation history (non-customer)
- **WSTLake data** - May include customer metadata

**Decision needed:**
- [ ] **Orange** - Non-customer data only
- [ ] **Highly Confidential** - Contains customer metadata

**Action:** Consult with Michael Bower (bowemi) to confirm classification.

### Step 4.2: Submit Security Review

1. **Good News:** Review is **staged** - you can start dev before full approval

2. Documentation location: TBD (search for "AWS security review process")

3. Typical requirements:
   - Account purpose and data classification
   - Data flow diagrams
   - Authentication mechanisms (CloudAuth)
   - Encryption strategy
   - Access controls

4. **For Now:** Proceed with development in account `348835374786` (Jakub's temp account)

---

## Part 5: Configure Account for MCP Development

### Step 5.1: Set Up IAM Roles for Lambda

You'll need IAM roles for:
- Lambda execution (basic permissions)
- CloudAuth service identity
- Transitive Auth support

**Reference:** Doug's CDK patterns in `WeblabLearningAppBackendCDK`

### Step 5.2: Create S3 Bucket for Sessions

```bash
# Name: weblab-mcp-sessions-dev
# Region: us-west-2 (or your preferred region)
# Encryption: AES-256 (default)
# Versioning: Enabled
# Lifecycle: 7-day retention for old sessions
```

### Step 5.3: Set Up CloudWatch Log Groups

```bash
# Log group: /aws/lambda/weblab-strands-agent
# Region: us-east-1 (required for toolbox telemetry)
# Retention: 7 days (dev), 30 days (prod)
```

### Step 5.4: Configure Secrets Manager

Store Weblab API keys:
```bash
# Secret name: weblab-mcp/api-keys
# Secret value:
{
  "BETA_API_KEY": "YourDev-Weblab-12345",
  "PROD_API_KEY": "TBD"
}
```

---

## Part 6: Verification Checklist

Before proceeding to Week 1 PoC:

- [ ] Bindle created and named `WeblabMCPServer`
- [ ] Bindle permissions configured for your team
- [ ] AWS account created: `WeblabMCPServer-Phase2-Dev`
- [ ] AWS account linked to bindle
- [ ] Account ID saved: `____________`
- [ ] Admin and ReadOnly roles exist
- [ ] Can access account via Isengard
- [ ] CTI configured and linked to both
- [ ] Security review initiated (or staged approach confirmed)
- [ ] Team members can access account
- [ ] Ready to deploy Lambda functions

---

## Troubleshooting

### Issue: "Bindle not found in Conduit dropdown"

**Solution:** Wait 4 hours after bindle creation for propagation.

### Issue: "POSIX group doesn't exist"

**Solution:**
1. Verify group exists: https://permissions.amazon.com
2. If new group, wait 4 hours for sync
3. Check spelling (case-sensitive)

### Issue: "Fleet owner approval pending"

**Solution:**
1. Check notification for approver names
2. Reach out directly via Slack/email
3. Approval speed varies by org

### Issue: "Data classification unclear"

**Solution:**
1. Consult Michael Bower (bowemi)
2. Review weblab data types in WSTLake
3. Default to more restrictive classification if unsure

---

## Next Steps After Completion

1. Update Phase 2 implementation tracker
2. Document account ID and credentials
3. Share access with team members (via bindle permissions)
4. Begin Week 1 PoC with AndesClientPython
5. Set up local development environment

---

## Key Resources

**Official Documentation:**
- AWS Account Creation: https://w.amazon.com/bin/view/ACMF/AMCP/Isengard/Account_Creation
- Bindle Creation: https://w.amazon.com/bin/view/Bindles/Bindles_Onboarding_Guidance/UsingBindles
- Conduit: https://conduit.security.a2z.com
- Isengard: https://isengard.amazon.com
- CTI Management: https://cti.amazon.com

**Support:**
- Michael Bower (bowemi) - Infrastructure guidance
- Your team's resolver group - For CTI issues
- #aws-help - For AWS account issues
- #bindles - For bindle questions

---

## Estimated Timeline

| Task | Duration | Blocker |
|------|----------|---------|
| Create CTI | 10 min | None |
| Create Bindle | 10 min | CTI ready |
| Configure Bindle Permissions | 10 min | Bindle created |
| Request AWS Account | 15 min | Bindle ready |
| Wait for Approvals | 30 min | Fleet owner |
| Verify Access | 5 min | Account ready |
| Security Review | 15 min | Account created |
| Configure Account | 30 min | Account ready |
| **Total** | **~2 hours** | Various |

**Can Start Development While:**
- Security review pending (staged approach)
- Using temporary account (348835374786)
- Awaiting final approvals

---

**Document Status:** Ready for execution  
**Last Updated:** October 13, 2025  
**Owner:** Sergio Ibagy  
**Next Review:** After account creation
