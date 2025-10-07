#!/usr/bin/env node

// Weblab MCP Test Runner - validates weblab MCP tools work with Amazon Q

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load test cases from JSON file
const testSuiteFile = path.join(__dirname, 'weblab-test-cases.json');
const testSuite = JSON.parse(fs.readFileSync(testSuiteFile, 'utf8'));

// Extract key test cases for validation
const tests = [
    // Natural language discovery tests
    {
        name: "Natural discovery - details",
        prompt: "What can you tell me about the weblab experiment 'OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516'?",
        expectedTools: ["weblab_details"]
    },
    {
        name: "Natural discovery - allocations",
        prompt: "How is traffic currently split for experiment 'OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516' in BETA?",
        expectedTools: ["weblab_allocations"]
    },
    {
        name: "Natural discovery - history",
        prompt: "I'm having issues with weblab experiment 'OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516'. Can you help me figure out what might be wrong?",
        expectedTools: ["weblab_details", "weblab_allocations"]
    },
    {
        name: "Multi-tool orchestration",
        prompt: "I need to do a health check on experiment 'OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516'. Is it running properly and are there any issues I should be aware of?",
        expectedTools: ["weblab_details", "weblab_allocations"]
    },
    // NEW: PROD environment tests (enabled by CR-220258045)
    {
        name: "PROD environment - activation history",
        prompt: "Get the activation history for experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' in PROD environment using weblab_activation_history.",
        expectedTools: ["weblab_activation_history"]
    },
    {
        name: "PROD environment - comprehensive analysis",
        prompt: "Analyze experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' in PROD environment. Get details, allocations, and activation history.",
        expectedTools: ["weblab_details", "weblab_allocations", "weblab_activation_history"]
    }
];

console.log('🧪 Weblab MCP Test Runner');
console.log('=========================\n');

// Test both environments if no specific environment is set
const testEnvironments = process.env.WEBLAB_ENVIRONMENT ? 
  [process.env.WEBLAB_ENVIRONMENT] : 
  ['BETA', 'PROD'];

let totalPassed = 0;
let totalTests = 0;

for (const env of testEnvironments) {
  console.log(`\n🌍 Testing ${env} Environment`);
  console.log('================================\n');
  
  // Filter tests based on environment
  const envTests = env === 'PROD' ? 
    tests.filter(t => t.name.includes('PROD') || !t.name.includes('BETA')) :
    tests.filter(t => !t.name.includes('PROD'));
  
  let passed = 0;
  let total = envTests.length;
  totalTests += total;

  for (const test of envTests) {
    console.log(`🔍 ${test.name}`);
    console.log(`Prompt: ${test.prompt}`);
    
    try {
        // Set environment for this test
        const testEnv = { ...process.env, WEBLAB_ENVIRONMENT: env };
        const result = execSync(`q chat -a --no-interactive "${test.prompt}"`, {
            encoding: 'utf8',
            timeout: 60000,
            env: testEnv
        });
        
        // Check if expected tools were used
        const toolsUsed = test.expectedTools.filter(tool => 
            result.includes(`Using tool: ${tool}`)
        );
        
        if (toolsUsed.length === test.expectedTools.length) {
            console.log(`✅ PASS - Used ${toolsUsed.join(', ')}`);
            passed++;
        } else {
            console.log(`❌ FAIL - Expected ${test.expectedTools.join(', ')}, got ${toolsUsed.join(', ') || 'none'}`);
            console.log(`Response: ${result.substring(0, 200)}...`);
        }
        
    } catch (error) {
        console.log(`❌ ERROR - ${error.message}`);
    }
    
    console.log('');
  }

  console.log(`${env} Results: ${passed}/${total} tests passed`);
  totalPassed += passed;
  
  if (passed === total) {
    console.log(`✅ ${env} environment working correctly!`);
  } else {
    console.log(`⚠️  ${env} environment needs attention`);
  }
}

console.log(`\n🏆 Overall Results: ${totalPassed}/${totalTests} tests passed`);

// Show appropriate message based on what was tested
if (testEnvironments.length === 1) {
    // Single environment tested
    const env = testEnvironments[0];
    if (totalPassed === totalTests) {
        console.log(`🎉 ${env} environment working correctly!`);
    } else {
        console.log(`⚠️  ${env} environment needs attention`);
    }
} else {
    // Multiple environments tested
    if (totalPassed === totalTests) {
        console.log('🎉 All environments working correctly!');
    } else {
        console.log('⚠️  Some environments need attention');
    }
}
