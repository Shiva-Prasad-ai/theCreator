const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('CREATOROS AI — H9 COMPREHENSIVE VERIFICATION SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: Inspect Files in high-fidelity/
// -------------------------------------------------------------
console.log('--- TEST SUITE 1: FILE INVENTORY & INTEGRITY ---');
const baseDir = path.join(__dirname);
const requiredFiles = [
  'index.html',
  'app.js',
  'styles/base.css',
  'styles/layout.css',
  'styles/components.css',
  'styles/screens.css',
  'README.md',
  'components/ui/Button.tsx',
  'components/ui/Badge.tsx',
  'components/ui/Card.tsx',
  'components/ui/Input.tsx',
  'components/onboarding/OnboardingFlow.tsx',
  'components/content-bucket/ContentBucketGrid.tsx',
  'components/content-bucket/ScriptEditor.tsx',
  'components/content-bucket/TruthfulPublishModal.tsx'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(baseDir, file);
  assert(fs.existsSync(fullPath), `File exists: high-fidelity/${file}`);
});

// -------------------------------------------------------------
// TEST 2: HTML Structural & Tag Balance
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 2: HTML STRUCTURE & SCREEN IDS ---');
const htmlContent = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');

// Check all 12 screens exist in HTML
const expectedScreens = [
  'screen-onboarding-1', 'screen-onboarding-2', 'screen-onboarding-3',
  'screen-onboarding-4', 'screen-onboarding-5', 'screen-onboarding-6',
  'screen-content-bucket-1', 'screen-content-bucket-2', 'screen-content-bucket-3',
  'screen-content-bucket-4', 'screen-content-bucket-5', 'screen-content-bucket-6'
];

expectedScreens.forEach(id => {
  assert(htmlContent.includes(`id="${id}"`), `Screen container present in index.html: #${id}`);
});

// Check tag balance for critical elements
const tagsToTest = ['div', 'section', 'span', 'button', 'p', 'h1', 'h2'];
tagsToTest.forEach(tag => {
  const openRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
  const closeRegex = new RegExp(`</${tag}>`, 'gi');
  const opens = (htmlContent.match(openRegex) || []).length;
  const closes = (htmlContent.match(closeRegex) || []).length;
  assert(opens === closes, `Tag <${tag}> balanced in index.html: ${opens} opens === ${closes} closes`);
});

// -------------------------------------------------------------
// TEST 3: CSS Token Integrity
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 3: CSS DESIGN TOKENS & ACCESSIBILITY ---');
const baseCss = fs.readFileSync(path.join(baseDir, 'styles/base.css'), 'utf8');
assert(baseCss.includes('--bg-canvas: #0B1020;'), 'CSS Token: Deep navy background defined (--bg-canvas)');
assert(baseCss.includes('--accent-cyan: #22D3EE;'), 'CSS Token: Cyan accent defined (--accent-cyan)');
assert(baseCss.includes('--primary-violet: #7C3AED;'), 'CSS Token: Violet primary defined (--primary-violet)');
assert(baseCss.includes(':focus-visible'), 'Accessibility: focus-visible keyboard styling included');
assert(baseCss.includes('@media (prefers-reduced-motion: reduce)'), 'Accessibility: prefers-reduced-motion media query included');

// -------------------------------------------------------------
// TEST 4: Behavior & State Controller Execution in VM
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 4: BEHAVIORAL LOGIC & GATE ENFORCEMENT ---');

const domElements = {};
function createMockElement(id = '', tagName = 'div') {
  const children = [];
  return {
    id,
    tagName: tagName.toUpperCase(),
    value: '',
    checked: false,
    disabled: false,
    textContent: '',
    innerHTML: '',
    style: {},
    children,
    classList: {
      classes: new Set(),
      add: function(c) { this.classes.add(c); },
      remove: function(c) { this.classes.delete(c); },
      contains: function(c) { return this.classes.has(c); },
      toggle: function(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) this.classes.delete(c);
          else this.classes.add(c);
        } else if (force) {
          this.classes.add(c);
        } else {
          this.classes.delete(c);
        }
      }
    },
    appendChild: function(child) {
      children.push(child);
      return child;
    },
    removeChild: function(child) {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      return child;
    },
    replaceChildren: function(...newChildren) {
      children.length = 0;
      children.push(...newChildren);
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    focus: () => {},
    scrollIntoView: () => {},
    querySelector: () => createMockElement('', 'span'),
    querySelectorAll: () => []
  };
}

let lastAlertMessage = null;
const docListeners = {};

const mockDocument = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  querySelectorAll: (selector) => {
    return [createMockElement('', 'div')];
  },
  querySelector: (selector) => {
    return createMockElement('', 'div');
  },
  createElement: (tag) => createMockElement('', tag),
  addEventListener: (event, handler) => {
    if (!docListeners[event]) docListeners[event] = [];
    docListeners[event].push(handler);
  },
  removeEventListener: () => {},
  body: createMockElement('body')
};

const mockWindow = {
  document: mockDocument,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  alert: (msg) => { lastAlertMessage = msg; },
  confirm: () => true,
  setTimeout: (cb) => { cb(); },
  clearTimeout: () => {},
  localStorage: {
    data: {},
    getItem: function(k) { return this.data[k] || null; },
    setItem: function(k, v) { this.data[k] = v; },
    removeItem: function(k) { delete this.data[k]; }
  }
};

const sandboxContext = vm.createContext({
  window: mockWindow,
  document: mockDocument,
  console: console,
  alert: (msg) => { lastAlertMessage = msg; },
  confirm: () => true,
  localStorage: mockWindow.localStorage,
  setTimeout: (cb) => { cb(); },
  clearTimeout: () => {}
});

const appJsCode = fs.readFileSync(path.join(baseDir, 'app.js'), 'utf8');
vm.runInContext(appJsCode, sandboxContext);

// Dispatch DOMContentLoaded to trigger initStorage() and initial setup
if (docListeners['DOMContentLoaded']) {
  docListeners['DOMContentLoaded'].forEach(cb => cb());
}

const app = sandboxContext.window;
assert(typeof app.navigateToStep === 'function', 'app.js: navigateToStep function exported');
assert(typeof app.setCurrentStep === 'function', 'app.js: safe setCurrentStep alias exported');
assert(typeof app.simulateRetryWithOutcome === 'function', 'app.js: simulateRetryWithOutcome exported');

// Check initial state
const state = app.wireframeState;
assert(state !== undefined, 'app.js: wireframeState initialized');
assert(state.bucketSlots && state.bucketSlots.length === 12, '12-slot visual grid initialized in state (12 slots total)');
const filledSlots = state.bucketSlots.filter(s => s.status !== 'empty');
assert(filledSlots.length === 7, `Initial partial bucket is valid with 7 filled slots (actual: ${filledSlots.length})`);

// -------------------------------------------------------------
// Test Onboarding Flow (ONB-1 through ONB-6)
// -------------------------------------------------------------
console.log('\n--- Testing Onboarding Flow (ONB-1 through ONB-6) ---');
state.activeFlow = 'onboarding';
state.onboardingStep = 1;

app.navigateToStep(1);
assert(state.onboardingStep === 1, 'Can navigate to ONB-1 (Welcome)');
app.navigateToStep(3);
assert(state.onboardingStep === 3, 'Can navigate to ONB-3 (Profile Setup)');

// Test Profile Validation: Empty display name should block advancing to step 4
state.onboardingData.displayName = '';
lastAlertMessage = null;
app.navigateToStep(4);
assert(state.onboardingStep === 3, 'Profile validation: Empty displayName blocks advancing to Step 4');
assert(lastAlertMessage && lastAlertMessage.includes('Display Name'), `Alert message triggered: "${lastAlertMessage}"`);

// Restore display name and proceed
state.onboardingData.displayName = 'Jeevan Tech';
state.onboardingData.handle = '@jeevantech';
app.navigateToStep(4);
assert(state.onboardingStep === 4, 'Profile validation passed: Can now proceed to Step 4');
app.navigateToStep(6);
assert(state.onboardingStep === 6, 'Can reach ONB-6 (Review & Confirmation)');

// -------------------------------------------------------------
// Test Content Bucket Navigation (BKT-1 through BKT-6) & Mandatory Gates
// -------------------------------------------------------------
console.log('\n--- Testing Content Bucket Flow & Mandatory Gates ---');
state.activeFlow = 'content-bucket';
state.contentBucketStep = 1;

// Slot 3 has NO script (status: 'needs-script', scriptText: '')
state.selectedSlotIndex = 2; // Slot 3 (0-indexed: index 2)
const slot3 = app.getActiveSlot();
assert(slot3.id === 3, 'Selected Slot 3 for testing');
assert(slot3.scriptText === '', 'Slot 3 has empty script');

// Go to Step 3 (Mandatory Script Input screen in Content Bucket)
state.contentBucketStep = 3;

// Test Mandatory Script Gate:
// With empty script, advancing to Step 4 (Captions), Step 5 (Review), or Step 6 (Scheduling) MUST BE BLOCKED
lastAlertMessage = null;
app.navigateToStep(4);
assert(state.contentBucketStep === 3, 'Mandatory Script Gate: Cannot advance to Step 4 (Captions) without script');
assert(lastAlertMessage && lastAlertMessage.includes('requires a script'), `Alert blocked progression: "${lastAlertMessage}"`);

lastAlertMessage = null;
app.navigateToStep(6);
assert(state.contentBucketStep === 3, 'Mandatory Script Gate: Cannot advance to Step 6 (Scheduling) without script');

// Backward navigation should still be allowed to edit or inspect earlier screens
app.navigateToStep(1);
assert(state.contentBucketStep === 1, 'Backward navigation to Step 1 (12-Slot Grid) allowed to revise content');

// Now switch to Slot 1 (which has a valid script and humanApproved = true)
state.selectedSlotIndex = 0; // Slot 1
const slot1 = app.getActiveSlot();
assert(slot1.id === 1 && app.isSlotScriptValid(slot1), 'Slot 1 has valid script');

state.contentBucketStep = 3;
app.navigateToStep(4);
assert(state.contentBucketStep === 4, 'Mandatory Script Gate passed: Can advance to Step 4 with valid script');

app.navigateToStep(5);
assert(state.contentBucketStep === 5, 'Can advance to Step 5 (Review & Human Approval)');

// Test Human Approval Gate:
console.log('\n--- Testing Human Approval Gate ---');
slot1.humanApproved = false;
lastAlertMessage = null;
app.navigateToStep(6);
assert(state.contentBucketStep === 5, 'Human Approval Gate: Advancement to Step 6 blocked when human approval is false');
assert(lastAlertMessage && lastAlertMessage.includes('explicit human approval'), `Gate alert triggered: "${lastAlertMessage}"`);

// Grant explicit human approval
slot1.humanApproved = true;
app.navigateToStep(6);
assert(state.contentBucketStep === 6, 'Human Approval Gate passed: Advancement to Step 6 allowed with explicit approval');

// -------------------------------------------------------------
// Test Truthful Retry Simulation & History Preservation
// -------------------------------------------------------------
console.log('\n--- Testing Dual-Outcome Simulated Retry & History ---');
// Select Slot 5 (The demonstration slot with previous failed status)
state.selectedSlotIndex = 4; // Slot 5
const slot5 = app.getActiveSlot();
assert(slot5.id === 5, 'Selected Slot 5 for retry demonstration');
assert(slot5.retryHistory.length === 1, 'Slot 5 has initial retryHistory with prior failure preserved');

const initialHistoryCount = slot5.retryHistory.length;
app.simulateRetryWithOutcome('failure');
assert(slot5.retryHistory.length === initialHistoryCount + 1, 'Retry failure outcome preserved in retryHistory');
assert(slot5.retryHistory[slot5.retryHistory.length - 1].outcome === 'Failed (Sample)', 'History records simulated failure outcome');
assert(slot5.publishStatus === 'Failed (Sample)', 'publishStatus accurately reflects Failed (Sample)');

app.simulateRetryWithOutcome('success');
assert(slot5.retryHistory.length === initialHistoryCount + 2, 'Retry success outcome preserved in retryHistory');
assert(slot5.publishStatus === 'Posted (Sample)', 'publishStatus reflects Posted (Sample) — never unverified Live');

// -------------------------------------------------------------
// Test Memory Attribution Truthfulness
// -------------------------------------------------------------
console.log('\n--- Testing Brain Memory Attribution ---');
const slot2 = state.bucketSlots.find(s => s.id === 2);
assert(slot2.captionSource === 'memory', 'Slot 2 explicitly configured with captionSource: "memory"');
assert(slot1.captionSource !== 'memory', 'Slot 1 does NOT claim memory attribution falsely');

// -------------------------------------------------------------
// TEST 5: TSX Blueprint Syntax & Balance
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 5: TSX BLUEPRINTS INTEGRITY ---');
const tsxFiles = [
  'components/ui/Button.tsx',
  'components/ui/Badge.tsx',
  'components/ui/Card.tsx',
  'components/ui/Input.tsx',
  'components/onboarding/OnboardingFlow.tsx',
  'components/content-bucket/ContentBucketGrid.tsx',
  'components/content-bucket/ScriptEditor.tsx',
  'components/content-bucket/TruthfulPublishModal.tsx'
];

tsxFiles.forEach(file => {
  const code = fs.readFileSync(path.join(baseDir, file), 'utf8');
  // Check brace balance
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  assert(openBraces === closeBraces, `TSX Braces balanced in ${file}: { ${openBraces} === } ${closeBraces}`);
  
  // Check export
  assert(code.includes('export '), `TSX exports component: ${file}`);
});

console.log('\n====================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
