# Weblab Treatment Override: Customer ID vs Directed ID

**Keywords:** #weblab, #treatment-override, #customer-id, #directed-id, #mobile-weblab, #QA-testing, #documentation, #allocation-tester

## Summary
Discussion about using obfuscated Customer IDs vs Directed IDs for weblab treatment assignment overrides in mobile applications. Key clarifications on backend handling and QA testing issues.

## Thread Participants
- **Thatcher Christeaan** - QA/Testing, asking technical questions
- **Nicholas Lu** - Weblab engineer, providing answers

## Key Technical Points

### Customer ID Override Behavior
- **Backend handling**: Weblab backend automatically converts obfuscated customer IDs to directed IDs
- **Override entry**: Can use obfuscated customer ID (A1WPQD91IJ****) for treatment overrides  
- **Allocation tester**: Must use directed ID in the UI allocation tester tool

### QA Issue Reported
- **Problem**: CID treatment overrides lapsing unexpectedly
- **Behavior**: Mobile weblab SDK reverts to C treatment despite previous T1 override
- **Workaround**: App reinstall restores T1 treatment
- **Investigation needed**: Root cause of override persistence failure

### Documentation Gaps
- Native mobile weblab manual needs clarification on this behavior
- Manual location: https://w.amazon.com/bin/view/Weblab/Manual/Mobile/
- Owner identification needed for updates

### Technical References
- **Audible docs**: Mobile override state inspection patterns
- **Reference**: https://w.amazon.com/bin/view/AudibleMobile/Marketplace_app/DesignDocs/General/NewWeblabSdk/#HTechnicaldetailsandtips

## Action Items
1. Update mobile weblab documentation with CID vs Directed ID clarification
2. Investigate override persistence issue in mobile SDK
3. Document mobile override state inspection methods

## Related Topics
- Mobile weblab SDK integration
- Treatment allocation testing  
- Customer identity management
- QA testing procedures
- Mobile app state persistence

---
*Thread analyzed: 8/19/2025*
