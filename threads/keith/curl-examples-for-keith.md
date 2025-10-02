# Keith - Weblab API Issue RESOLVED ✅

## ✅ SOLUTION FOUND
Keith identified the issues:
1. **Missing `/v1`** in allocationperiods endpoint
2. **Missing permissions** for `/allocations` on WeblabMCPServer-Weblab-58093 key

## ✅ CORRECT WORKING COMMAND (Keith's fix)
```bash
# PROD allocationperiods with /v1 - ✅ NOW WORKS
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
  -H "x-api-key: WeblabMCPServer-Weblab-58093" -H "Origin: WeblabMCPServer" \
  "https://api.us-east-1.prod.api.weblab.amazon.dev/sso/allocationperiods/v1?experimentId=WEBLAB_MOBILE_TESTAPP_SESSION_1299744"
```

## Working Commands (Already Confirmed)
```bash
# BETA experiment - ✅ WORKS
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
  -H "x-api-key: WeblabMCPServer-Weblab-58093" -H "Origin: WeblabMCPServer" \
  "https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"

# PROD experiment - ✅ WORKS  
curl -u : --location-trusted -b ~/.midway/cookie -c ~/.midway/cookie --anyauth -i \
  -H "x-api-key: WeblabMCPServer-Weblab-58093" -H "Origin: WeblabMCPServer" \
  "https://api.us-east-1.prod.api.weblab.amazon.dev/sso/experiment/v1?experimentId=WEBLAB_MOBILE_TESTAPP_SESSION_1299744"
```

## 🔧 FIXES NEEDED IN MCP CLIENT
1. **Add `/v1`** to allocationperiods endpoint URL
2. **Wait for Keith** to add `/allocations` permissions to API key
3. **Update Origin header** to `WeblabMCPServer` (already correct)

## Previous Issues (RESOLVED)
~~❌ allocations/allocationperiods fail with 403~~
~~❌ Missing /v1 in endpoint URLs~~
~~❌ Wrong Origin header~~

**Root Cause**: API endpoint versioning and missing permissions