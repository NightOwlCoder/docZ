# Keith - Debug New API Key Issue

## Problem
Your new unified API key `Weblab-58093` from CR-220258045 is returning 401 errors, but the old key still works.

## Test Results

### ✅ OLD KEY WORKS (localDev-SIM-Weblab-38862)
```bash
# BETA experiment details - SUCCESS (200 OK)
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: localDev-SIM-Weblab-38862" \
-H "Origin: http://localhost" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516

# Result: HTTP/2 200 + full experiment data
```

### ❌ NEW KEY FAILS (Weblab-58093)
```bash
# Same request with new key - FAILS (401 Unauthorized)
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: Weblab-58093" \
-H "Origin: WeblabMCPServer" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516

# Result: HTTP/2 401 {"message":"Unauthorized"}
```

### ❌ NEW KEY WITH OLD ORIGIN - STILL FAILS
```bash
# New key with localhost origin - STILL FAILS (401 Unauthorized)
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: Weblab-58093" \
-H "Origin: http://localhost" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516

# Result: HTTP/2 401 {"message":"Unauthorized"}
```

## Questions for Keith

1. **Is the new key `Weblab-58093` active yet?** The CR is merged but maybe the key needs activation?

2. **What's the correct Origin header for the new key?** We tried:
   - `WeblabMCPServer` (from your origins config)
   - `http://localhost` (old pattern)
   - Both fail with 401

3. **Are there additional headers needed?** Our current headers:
   ```
   x-api-key: Weblab-58093
   Origin: WeblabMCPServer
   Content-Type: application/json
   User-Agent: AmazonInternalMCPServer/0.2.7
   weblab-api-authorizing-actor: {"actorType":"principal","actorId":"sibagy"}
   ```

4. **Should we test PROD endpoints instead?** Maybe the new key only works in PROD?

## Test Commands for Keith

```bash
# Test 1: New key in BETA
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: Weblab-58093" \
-H "Origin: WeblabMCPServer" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516

# Test 2: New key in PROD  
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: Weblab-58093" \
-H "Origin: WeblabMCPServer" \
https://api.us-east-1.prod.api.weblab.amazon.dev/sso/experiment/v1?experimentId=WEBLAB_MOBILE_TESTAPP_SESSION_1299744

# Test 3: New key with allocationperiods (the key feature from your CR)
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
-H "x-api-key: Weblab-58093" \
-H "Origin: WeblabMCPServer" \
https://api.us-east-1.prod.api.weblab.amazon.dev/sso/allocationperiods/v1?includesTimestamp=2025-09-10T00:00:00Z;experimentId=WEBLAB_MOBILE_TESTAPP_SESSION_1299744;marketplaceId=1;domain=PROD
```

## Current Status
- **Old key works perfectly** in BETA
- **New key fails with 401** in both BETA and PROD
- **MCP tools are blocked** until new key works
- **Can't test allocationperiods in PROD** (the main goal of your CR)

Let us know what we're missing!