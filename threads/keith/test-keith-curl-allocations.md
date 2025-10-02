# Keith's Curl Examples for Weblab API Testing

## From Keith's Wiki Documentation

### Midway-authenticated call (what we should use):

```bash
curl \
-u : \
--location-trusted \
-b ~/.midway/cookie \
-c ~/.midway/cookie \
--anyauth \
-i \
-H "x-api-key: localDev-SIM-Weblab-38862" \
-H "Origin: http://localhost" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/experiment/v1?experimentId=TEST_183687
```

### For Allocations (adapting Keith's pattern):

```bash
curl \
-u : \
--location-trusted \
-b ~/.midway/cookie \
-c ~/.midway/cookie \
--anyauth \
-i \
-H "x-api-key: localDev-SIM-Weblab-38862" \
-H "Origin: http://localhost" \
https://api.us-east-1.beta.api.weblab.amazon.dev/sso/allocations?experimentId=TEST_EXPERIMENT_ID
```

## Key Points from Keith's Documentation:

1. **Authentication**: Uses Midway cookies (`mwinit --aea` required first)
2. **API Key**: `localDev-SIM-Weblab-38862` for testing in Beta
3. **Origin Header**: Must be `http://localhost` for local dev key
4. **Base URL**: `https://api.us-east-1.beta.api.weblab.amazon.dev`
5. **Path Pattern**: `/sso/{resource}` for Midway auth vs `/iam/{resource}` for SigV4

## Our Implementation Issues:

1. ✅ **API Key**: We're using the right key
2. ✅ **Origin Header**: We're setting it correctly  
3. ✅ **Base URL**: We're using the right endpoint
4. ❓ **Experiment ID**: We need a valid Beta experiment ID to test with
5. ❓ **Midway Auth**: Our MidwayHttpClient should handle this

## Next Steps:

1. Test Keith's exact curl command first
2. Find a valid Beta experiment ID
3. Compare our MCP tool output with curl output
4. Debug any differences