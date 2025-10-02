# Weblab MCP - Project Restart Package
**Date/Updated:** October 2, 2025 – 10:00 AM PDT

---

## 1. Project Snapshot

**Mission:** Build MCP tools enabling LLM-powered weblab experiment management through natural language interfaces to Andes data.

**Current Strategy:**

* Modular building blocks (not monolithic solution)
* Fork `amzn-mcp` for standalone `WeblabMCPServer` package
* Use Andes tables for data queries (not web scraping)
* Hybrid metrics (accessible-metrics.ts + toolbox telemetry)

**Status:**

* **Branch:** AmazonInternalMCPServer package
* **Environment:** Development (preparing fork decision/strategy)
* **Milestone:** 6 tools built, metrics in-progress, awaiting deployment decision

**Key Constraints:**

* Dual authentication: Midway tokens + Weblab API keys
* Golden path template has **no** auth support (documented gap)
* MCP mandate: team-owned, focused servers (not centralized)
* Must use **public** WeblabAPIModel APIs only (no UI endpoints)
* Metrics must use **YOUR AWS account 975049930647** (central account inaccessible)
* Toolbox telemetry requires log groups in **us-east-1**

---

## 2. Progress

### ✅ Completed & Tested

* `weblab_details` → GetExperiment API
* `weblab_allocations` → ListAllocations API
* `weblab_activation_history` → ListAllocationPeriods API
* `weblab_user_experiments` → Andes SQL via HTTP bridge to andes-mcp
* `weblab_request_andes_access` → Auto-approved WEBLAB_DDL access
* Test suite: `test/tools/weblab/tools.test.ts` (PASSING)

### 🚧 In-Flight

* `accessible-metrics.ts` → Started, basic structure exists
* `weblab-health-check.ts` → Drafted, not tested
* TypeScript compilation status: **unverified**

### 🐛 Known Issues

* TypeScript errors mentioned in golden path doc (line 12, 104) – **not verified if real**
* `metrics.test.ts` may use wrong framework (vitest vs jest) – **not verified**
* `weblab_health_check` not tested end-to-end
* Andes access still manual (deferred)

---

## 3. Essential Artifacts

### Must-Read Docs

* `docs/weblab-mcp/restart-package-2025-10-02.md` (this file snapshot)
* `docs/weblab-mcp/standalone-server-analysis.md` – Fork vs merge decision analysis
* `docs/weblab-mcp/toolbox-vending-guide.md` – Deployment process & vending
* `docs/weblab-mcp/weblab-mcp-meetings/ryan-10-02.md` – Latest context/mandate
* `docs/weblab-mcp/weblab-data-platform-vision.md` – Long-term Andes vision
* `docs/weblab-mcp/authentication-clarification.md` – Auth requirements
* Golden path reference: [https://docs.hub.amazon.dev/gen-ai-dev/creating-mcp-servers/](https://docs.hub.amazon.dev/gen-ai-dev/creating-mcp-servers/)
* Toolbox telemetry: [https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-monitor.html](https://docs.hub.amazon.dev/docs/builder-toolbox/user-guide/vending-monitor.html)

### Code Locations

```
amazon-internal-mcp-server/src/AmazonInternalMCPServer/
├── src/tools/weblab/
│   ├── weblab-details.ts (✓ working)
│   ├── weblab-allocations.ts (✓ working)
│   ├── weblab-activation-history.ts (✓ working)
│   ├── weblab-user-experiments.ts (✓ working)
│   ├── weblab-request-andes-access.ts (✓ working)
│   ├── weblab-health-check.ts (drafted)
│   ├── accessible-metrics.ts (in-progress)
│   ├── index.ts (exports all tools)
│   └── client.ts (Weblab API client)
└── test/tools/weblab/
    ├── tools.test.ts (PASSING)
    └── metrics.test.ts (framework mismatch?)
```

### CLI / Build / Test Commands

```bash
# Navigate
cd amazon-internal-mcp-server/src/AmazonInternalMCPServer

# Install deps
npm install

# Build (verify actual TS errors)
npm run build

# Tests
npm test test/tools/weblab/tools.test.ts    # Passing
npm test test/tools/weblab/metrics.test.ts  # Status unknown

# Local MCP config
# Config: ~/.aws/amazonq/mcp.json or cline_mcp_settings.json
# Server: amzn-mcp-local (currently disabled)
```

### Critical Code Patterns

**Dual Authentication:**

```typescript
const client = new WeblabClient({
  environment: process.env.WEBLAB_ENVIRONMENT || 'PROD',
  apiKey: process.env.WEBLAB_API_KEY
  // Midway handled by amzn-mcp core/auth/
});
```

**Metrics File Writing (Toolbox):**

```typescript
const metricsDir = process.env.TOOLBOX_weblab_mcp_EMF_METRICS_DIRECTORY;
if (metricsDir) {
  fs.writeFileSync(
    path.join(metricsDir, `metric-${Date.now()}.log`),
    JSON.stringify(emfObject) + '\n'
  );
}
```

---

## 4. Next Steps

### Immediate (This Week)

1. Verify build: run `npm run build` and confirm TypeScript errors.
2. Complete metrics: finish `accessible-metrics.ts`, test with real usage.
3. Test `weblab_health_check`.
4. Verify CloudWatch integration (account 975049930647).
5. Confirm metrics appear in `~/.weblab-mcp/weblab-usage-metrics.json`.
6. Await Chetan (amzn-mcp maintainer) merge/fork decision.

### Fork Path (If Chetan Rejects) – Week 2–3

1. Create package via template: [https://create.hub.amazon.dev/package/mcp-local-server-typescript](https://create.hub.amazon.dev/package/mcp-local-server-typescript)
2. Copy: `/core/auth/`, `/core/logging/`, `mcp-wrapper.ts`, all `/tools/weblab/*`, and tests.
3. Set up vending: follow toolbox-vending-guide.md, vendor config, LPT pipeline, telemetry CDK (log groups/IAM in us-east-1).
4. Deploy:

   ```bash
   bb run toolbox:bundle
   bb run toolbox:publish-stable
   ```

   Test internally, then monitor metrics.

### Blockers

* ❌ Waiting on Chetan response (no timeline)
* ⚠️ TypeScript errors unverified
* ⚠️ Andes permissions deferred

---

## 5. Open Questions

1. Do TypeScript errors in `accessible-metrics.ts` actually exist? (verify)
2. Framework mismatch in `metrics.test.ts` (vitest vs jest)?
3. Timeline for Chetan response? Likely decision?
4. Does metrics completion align with Ryan’s “team priorities”?
5. Arpit presentation (10/03) relevance to Andes natural language querying?

---

## 6. Meeting Context (Ryan 10/02)

* MCP mandate triggered: 100+ WSS customers.
* Focus: modular building blocks (not monolithic).
* Priority: Andes table access via natural language.
* Use cases: TAA detection, allocation history, monitoring.
* Integration target: WLBR.AI (currently not Andes-based).
* Science team collaboration needed.
* ✅ Tools align with mandate (6 modular building blocks).
* ✅ Andes integration via `weblab_user_experiments`.

---

## 7. Key Files Summary

| Category     | File                            | Status      |
| ------------ | ------------------------------- | ----------- |
| **Analysis** | standalone-server-analysis.md   | Complete    |
| **Guide**    | toolbox-vending-guide.md        | Complete    |
| **Meeting**  | ryan-10-02.md                   | Context     |
| **Auth**     | authentication-clarification.md | Reference   |
| **Code**     | weblab-details.ts               | ✓           |
| **Code**     | weblab-allocations.ts           | ✓           |
| **Code**     | weblab-activation-history.ts    | ✓           |
| **Code**     | weblab-user-experiments.ts      | ✓           |
| **Code**     | weblab-request-andes-access.ts  | ✓           |
| **Code**     | weblab-health-check.ts          | Drafted     |
| **Code**     | accessible-metrics.ts           | In-progress |
| **Tests**    | tools.test.ts                   | PASSING     |
| **Tests**    | metrics.test.ts                 | Unknown     |

---

## 8. Decision Matrix

```
Current State: Waiting on Chetan

If Chetan Rejects Merge:
├─ Action: Fork amzn-mcp
├─ Timeline: 1–2 weeks
├─ Effort: 7–12 days
└─ Result: Team-owned WeblabMCPServer

If Chetan Approves Merge:
├─ Action: Merge 3 tools
├─ Timeline: 1 week
├─ Effort: 6–8 days
└─ Result: Tools in amzn-mcp temporarily

Either Way:
└─ Complete metrics implementation this week
```

---

## 9. Confidence Assessment

| Area                     | Confidence | Gaps               |
| ------------------------ | ---------- | ------------------ |
| Technical implementation | 85%        | Build unverified   |
| Fork strategy            | 95%        | Documented         |
| Vending process          | 90%        | Official docs      |
| Metrics approaches       | 80%        | Incomplete         |
| Strategic context        | 70%        | Meeting notes only |
| Team priorities          | 60%        | Not fully clear    |
| Timeline pressure        | 50%        | Unknown            |
