# Weblab Assignment Override API Investigation

## Current Status (Sep 11, 2025)
Investigating if Keith's Weblab API exposes assignment override functionality.

## What Are Assignment Overrides?
From the Weblab UI, Assignment Overrides allow:
- Forcing individual visitors (by session ID or customer ID) into specific treatments
- Adding visitor IDs (e.g., session IDs: 000-0000000-0009000, 000-0000000-0009002, 000-0000000-0009001)  
- Assigning them to specific treatments (T7, T8, T9)
- Tracking who modified and when (e.g., sibagy on Aug 25, 2025)
- Note: Only work when allocations are 50/50 and exposure is 0%

## Available API Operations (Confirmed)
From WeblabAPIModel:
- `GetExperiment` - Get experiment details ✅
- `ListAllocations` - Get current allocations ✅  
- `ListAllocationPeriods` - Get activation history ✅

From WeblabAPIExternalModel:
- `allocation-operation.xml` - Get treatment allocations (Keith's link: line 116)
  - This appears to be for getting current allocation percentages
  - NOT for managing individual visitor overrides

## Missing Operations (Not Found)
No documented operations for:
- **Creating/adding assignment overrides**
- **Listing existing overrides**  
- **Removing overrides**
- **Mobile overrides**

## Search Results
- No "override" operations found in WeblabAPIModel documentation
- The allocation-operation.xml Keith referenced is for allocation percentages, not overrides
- No override-related endpoints discovered in available documentation

## Questions for Keith
1. Are assignment overrides exposed through the WeblabAPI?
2. Is there a separate endpoint/operation for managing overrides?
3. Would override operations need to be added to the API proxy (like search)?
4. Does the UI use internal-only APIs for override management?

## Potential API Operations Needed
If we were to add override support, we'd likely need:
```
CreateAssignmentOverride(experimentId, visitorId, idType, treatment)
ListAssignmentOverrides(experimentId, domain?, marketplaceId?)
DeleteAssignmentOverride(experimentId, visitorId)
```

## Next Steps
- Await Keith's response on override API availability
- If not available, determine if it's worth requesting addition to API proxy
- Consider if override functionality is critical for Phase 1 or can be deferred
