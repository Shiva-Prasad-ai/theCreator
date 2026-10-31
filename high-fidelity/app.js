/**
 * CreatorOS AI — High-Fidelity UI Interaction & State Controller
 * Milestone: H9 — High-Fidelity Interactive Prototype
 * Pure client-side simulation with localStorage persistence. No backend calls.
 */

// Initial Default 12 Slots (Demonstrates 7/12 Partial Bucket state)
const DEFAULT_12_SLOTS = [
  {
    id: 1,
    title: 'Stop Hand-Crafting Hooks in 2026',
    type: 'video',
    status: 'scheduled',
    scriptText: 'Stop wasting 10 hours writing and recording video hooks by hand in 2026...\n\nHere is how CreatorOS AI autonomously plans, hooks, and drafts your multi-platform content calendar in under 60 seconds with verified audience retention signals.\n\nComment BUCKET below to get our autonomous creator playbook for free.',
    scriptHook: 'Stop wasting 10 hours writing and recording video hooks by hand in 2026...',
    scriptBody: 'Here is how CreatorOS AI autonomously plans, hooks, and drafts your multi-platform content calendar in under 60 seconds with verified audience retention signals.',
    scriptCta: 'Comment BUCKET below to get our autonomous creator playbook for free.',
    caption: 'Tired of the creator burnout cycle? Here is how autonomous AI pipelines 10x your content output without sacrificing creative control. 🚀',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: ['#CreatorEconomy', '#AItools', '#CodeMeet2026', '#BuildInPublic'],
    musicIdea: 'Atmospheric Synthwave (120 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['LinkedIn', 'YouTube'],
    proposedDate: '2026-11-04',
    proposedTime: '17:30',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: true,
    publishStatus: 'Scheduled',
    sampleNote: 'Sample demonstration: Approved by creator; queued for dispatch.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 2,
    title: 'Next.js 15 Agent Architecture',
    type: 'reel',
    status: 'captions-ready',
    scriptText: 'Why Next.js 15 plus autonomous AI agents completely dominate SaaS in 2026...\n\nFull architectural breakdown of how server actions, edge streaming, and multi-agent coordination enable instantaneous creator tools.\n\nSave this reel for your next architectural sprint.',
    scriptHook: 'Why Next.js 15 plus autonomous AI agents completely dominate SaaS in 2026...',
    scriptBody: 'Full architectural breakdown of how server actions, edge streaming, and multi-agent coordination enable instantaneous creator tools.',
    scriptCta: 'Save this reel for your next architectural sprint.',
    caption: 'Next.js 15 is not just another minor update — paired with agentic memory, it changes how creator software is architected. ⚡',
    captionAiModified: false,
    captionSource: 'memory', // Explicitly indicates source from creator profile memory
    memoryContext: 'Creator Technical Profile & SaaS Persona Memory',
    hashtags: ['#Nextjs15', '#WebDev', '#SoftwareArchitecture'],
    musicIdea: 'Energetic Cyberpunk Beat (130 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['Instagram Reels'],
    proposedDate: '2026-11-05',
    proposedTime: '18:00',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Captions served from creator memory profile; pending human approval.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 3,
    title: 'Multi-Agent Repurposing Breakdown',
    type: 'video',
    status: 'needs-script',
    scriptText: '', // Intentionally empty to test mandatory script validation
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: 'Low-fi Instrumental Chill (85 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['YouTube'],
    proposedDate: '2026-11-06',
    proposedTime: '14:00',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Video asset ingested; script is strictly required before advancing.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 4,
    title: 'Viral Hook Optimization Framework',
    type: 'idea',
    status: 'script-done',
    scriptText: 'Most creator hooks fail in the first 1.8 seconds. Here is the 3-step psychological fix...\n\nPattern interrupt, identity resonance, and open loop creation. We analyzed 10,000 viral videos to extract this exact 3-step formula.\n\nShare this with a creator friend who needs better hook retention.',
    scriptHook: 'Most creator hooks fail in the first 1.8 seconds. Here is the 3-step psychological fix...',
    scriptBody: 'Pattern interrupt, identity resonance, and open loop creation. We analyzed 10,000 viral videos to extract this exact 3-step formula.',
    scriptCta: 'Share this with a creator friend who needs better hook retention.',
    caption: 'Stop losing 70% of viewers in the first 3 seconds. Here is the framework that fixes viewer retention instantly.',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: ['#ContentStrategy', '#ViralHooks', '#CreatorTips'],
    musicIdea: 'Minimalist Tech Groove (110 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['LinkedIn'],
    proposedDate: '2026-11-07',
    proposedTime: '11:00',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Script complete; ready for AI caption synthesis.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 5,
    title: 'Creator Telemetry & Sponsorships',
    type: 'video',
    status: 'failed',
    scriptText: 'How top 1% creators negotiate $25,000 brand sponsorships using automated telemetry...\n\nDo not send static PDF media kits in 2026. Send verified audience engagement dashboards with programmatic conversion tracking.\n\nLink in bio to view our telemetry media kit template.',
    scriptHook: 'How top 1% creators negotiate $25,000 brand sponsorships using automated telemetry...',
    scriptBody: 'Do not send static PDF media kits in 2026. Send verified audience engagement dashboards with programmatic conversion tracking.',
    scriptCta: 'Link in bio to view our telemetry media kit template.',
    caption: 'Static PDF media kits are dead. Here is how modern creators close $25k brand partnerships with live telemetry.',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: ['#CreatorBusiness', '#Sponsorships', '#Monetization'],
    musicIdea: 'Cinematic Modern Ambient (90 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['LinkedIn'],
    proposedDate: '2026-11-02',
    proposedTime: '19:00',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: true,
    publishStatus: 'Failed (Sample)',
    sampleNote: 'Sample failure demonstration: OAuth token expired during simulated dispatch.',
    errorMessage: 'Sample Dispatch Error (Code 401): Simulated OAuth access token expired.',
    retryHistory: [
      {
        attempt: 1,
        timestamp: '2026-11-02 19:00 IST (Provisional)',
        outcome: 'Failed (Sample)',
        detail: 'Sample Dispatch Error (Code 401): Simulated OAuth access token expired.'
      }
    ]
  },
  {
    id: 6,
    title: 'AI Scripting Masterclass Teaser',
    type: 'reel',
    status: 'posted',
    scriptText: 'We tested 5 leading AI scriptwriters on the same prompt. The winner was not even close...\n\nDetailed benchmark comparing token depth, audience retention pacing, and robotic cadence elimination across synthetic scripting engines.\n\nFull breakdown dropped on YouTube.',
    scriptHook: 'We tested 5 leading AI scriptwriters on the same prompt. The winner was not even close...',
    scriptBody: 'Detailed benchmark comparing token depth, audience retention pacing, and robotic cadence elimination across synthetic scripting engines.',
    scriptCta: 'Full breakdown dropped on YouTube.',
    caption: '5 AI scriptwriters, 1 prompt. Watch what happened when we ran them through retention modeling.',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: ['#AItools', '#CreatorReview', '#TechReview'],
    musicIdea: 'Deep Tech House (124 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['YouTube'],
    proposedDate: '2026-11-01',
    proposedTime: '10:00',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: true,
    publishStatus: 'Posted (Sample)',
    sampleNote: 'Sample status demonstration: Uploaded as "Private, pending audit" (YouTube policy).',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 7,
    title: '90-Day Audience Velocity Model',
    type: 'idea',
    status: 'approved',
    scriptText: 'You do not have an audience problem. You have a content pipeline distribution bottleneck...\n\nWhy posting manually to 4 platforms every day burns creators out. How an autonomous 12-slot Content Bucket gives you leverage.\n\nComment VELOCITY to receive our 90-day operating model.',
    scriptHook: 'You do not have an audience problem. You have a content pipeline distribution bottleneck...',
    scriptBody: 'Why posting manually to 4 platforms every day burns creators out. How an autonomous 12-slot Content Bucket gives you leverage.',
    scriptCta: 'Comment VELOCITY to receive our 90-day operating model.',
    caption: 'Burnout is a systems failure, not an effort failure. Build an autonomous content bucket once, leverage it everywhere.',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: ['#CreatorSystems', '#AudienceVelocity', '#Productivity'],
    musicIdea: 'Warm Acoustic Lo-Fi (80 BPM) [AI-suggested - Unverified Trend Data]',
    platforms: ['LinkedIn'],
    proposedDate: '2026-11-08',
    proposedTime: '16:30',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: true,
    publishStatus: 'Draft',
    sampleNote: 'Human approved; ready to queue in scheduling interface.',
    errorMessage: '',
    retryHistory: []
  },
  // Empty Slots (8 through 12)
  {
    id: 8,
    title: 'Empty Slot',
    type: 'empty',
    status: 'empty',
    scriptText: '',
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: '',
    platforms: [],
    proposedDate: '',
    proposedTime: '',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Available slot (Max 12). Add a video, reel, or idea note.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 9,
    title: 'Empty Slot',
    type: 'empty',
    status: 'empty',
    scriptText: '',
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: '',
    platforms: [],
    proposedDate: '',
    proposedTime: '',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Available slot (Max 12). Add a video, reel, or idea note.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 10,
    title: 'Empty Slot',
    type: 'empty',
    status: 'empty',
    scriptText: '',
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: '',
    platforms: [],
    proposedDate: '',
    proposedTime: '',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Available slot (Max 12). Add a video, reel, or idea note.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 11,
    title: 'Empty Slot',
    type: 'empty',
    status: 'empty',
    scriptText: '',
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: '',
    platforms: [],
    proposedDate: '',
    proposedTime: '',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Available slot (Max 12). Add a video, reel, or idea note.',
    errorMessage: '',
    retryHistory: []
  },
  {
    id: 12,
    title: 'Empty Slot',
    type: 'empty',
    status: 'empty',
    scriptText: '',
    scriptHook: '',
    scriptBody: '',
    scriptCta: '',
    caption: '',
    captionAiModified: false,
    captionSource: 'ai-suggested',
    hashtags: [],
    musicIdea: '',
    platforms: [],
    proposedDate: '',
    proposedTime: '',
    timezone: 'Provisional: IST (UTC+05:30) [Pending Team Confirmation]',
    humanApproved: false,
    publishStatus: 'Draft',
    sampleNote: 'Available slot (Max 12). Add a video, reel, or idea note.',
    errorMessage: '',
    retryHistory: []
  }
];

// Application State
const wireframeState = {
  activeFlow: 'onboarding', // 'onboarding' | 'content-bucket'
  onboardingStep: 1,        // 1 to 6
  contentBucketStep: 1,     // 1 to 6
  selectedSlotIndex: 0,     // 0-indexed (Slot 1 by default)

  // Onboarding Mock Data
  onboardingData: {
    persona: 'solo-creator',
    displayName: 'Alex Rivera',
    handle: '@alexrivera_ai',
    primaryPlatform: 'YouTube',
    niche: 'Tech & AI Software',
    audienceLevel: 'Intermediate to Advanced',
    subtopics: ['AI Coding', 'SaaS Growth', 'Prompt Engineering'],
    goals: ['Monetization Velocity', 'AI Script Drafting', 'Cross-Platform Repurposing'],
  },

  // 12 Bucket Slots (Loaded from localStorage or default)
  bucketSlots: []
};

// Flow definitions
const FLOW_CONFIG = {
  onboarding: {
    title: 'Onboarding Flow',
    totalSteps: 6,
    stepNames: [
      'Welcome Screen',
      'Creator Persona Selection',
      'Creator Profile Setup',
      'Niche & Target Audience',
      'Creator Goals',
      'Setup Confirmation'
    ]
  },
  'content-bucket': {
    title: 'Content Bucket Pipeline',
    totalSteps: 6,
    stepNames: [
      'BKT-1: 12-Slot Overview & Progress',
      'BKT-2: Add Video / Reel / Idea',
      'BKT-3: Mandatory Script Input',
      'BKT-4: Caption Editing & AI Correction',
      'BKT-5: Human Review, Store & Approval',
      'BKT-6: Scheduling & Truthful Publishing'
    ]
  }
};

const LOCAL_STORAGE_KEY = 'creatoros_h9_high_fidelity_v1';

// Initialize High-Fidelity Prototype
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  renderCurrentScreen();
  bindGlobalEvents();
});

function initStorage() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      wireframeState.bucketSlots = JSON.parse(saved);
    } else {
      wireframeState.bucketSlots = JSON.parse(JSON.stringify(DEFAULT_12_SLOTS));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wireframeState.bucketSlots));
    }
  } catch (e) {
    console.warn('localStorage unavailable; fallback to memory state.', e);
    wireframeState.bucketSlots = JSON.parse(JSON.stringify(DEFAULT_12_SLOTS));
  }
}

function saveSlotsToStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wireframeState.bucketSlots));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function resetPrototypeStorage() {
  if (confirm('Reset prototype state to default 7/12 filled slots? (Demonstration only)')) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    wireframeState.bucketSlots = JSON.parse(JSON.stringify(DEFAULT_12_SLOTS));
    wireframeState.selectedSlotIndex = 0;
    saveSlotsToStorage();
    renderCurrentScreen();
    alert('Prototype state reset to default 7/12 filled slots demonstration.');
  }
}

function getActiveSlot() {
  if (!wireframeState.bucketSlots[wireframeState.selectedSlotIndex]) {
    wireframeState.selectedSlotIndex = 0;
  }
  return wireframeState.bucketSlots[wireframeState.selectedSlotIndex];
}

// Script Validation Rule (Confirmed: A script is required before advancing)
function isSlotScriptValid(slot) {
  if (!slot) return false;
  const fullText = (slot.scriptText || `${slot.scriptHook || ''} ${slot.scriptBody || ''} ${slot.scriptCta || ''}`).trim();
  return fullText.length >= 10;
}

function bindGlobalEvents() {
  // Flow switcher tabs
  const tabButtons = document.querySelectorAll('.hf-flow-pill');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const flow = btn.getAttribute('data-flow');
      switchFlow(flow);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      nextStep();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevStep();
    }
  });

  // Bind live form sync for onboarding inputs
  const inputDisplayName = document.getElementById('inputDisplayName');
  if (inputDisplayName) {
    inputDisplayName.addEventListener('input', (e) => {
      wireframeState.onboardingData.displayName = e.target.value.trim();
    });
  }

  const inputHandle = document.getElementById('inputHandle');
  if (inputHandle) {
    inputHandle.addEventListener('input', (e) => {
      wireframeState.onboardingData.handle = e.target.value.trim();
    });
  }

  const inputNiche = document.getElementById('inputNiche');
  if (inputNiche) {
    inputNiche.addEventListener('change', (e) => {
      wireframeState.onboardingData.niche = e.target.value;
    });
  }

  // Bind primary unified script input
  const scriptInput = document.getElementById('scriptInput');
  if (scriptInput) {
    scriptInput.addEventListener('input', (e) => {
      const slot = getActiveSlot();
      slot.scriptText = e.target.value;
      if (isSlotScriptValid(slot) && (slot.status === 'empty' || slot.status === 'needs-script')) {
        slot.status = 'script-done';
      }
      updateScriptTelemetry();
      saveSlotsToStorage();
      const banner = document.getElementById('scriptValidationBanner');
      if (banner && isSlotScriptValid(slot)) {
        banner.classList.remove('active');
      }
    });
  }

  // Bind optional helper section inputs (Pending team confirmation on breakdown)
  const scriptHookInput = document.getElementById('scriptHookInput');
  if (scriptHookInput) {
    scriptHookInput.addEventListener('input', (e) => {
      const slot = getActiveSlot();
      slot.scriptHook = e.target.value;
      syncCombinedScriptFromSections();
      updateScriptTelemetry();
      saveSlotsToStorage();
    });
  }

  const scriptBodyInput = document.getElementById('scriptBodyInput');
  if (scriptBodyInput) {
    scriptBodyInput.addEventListener('input', (e) => {
      const slot = getActiveSlot();
      slot.scriptBody = e.target.value;
      syncCombinedScriptFromSections();
      updateScriptTelemetry();
      saveSlotsToStorage();
    });
  }

  const scriptCtaInput = document.getElementById('scriptCtaInput');
  if (scriptCtaInput) {
    scriptCtaInput.addEventListener('input', (e) => {
      const slot = getActiveSlot();
      slot.scriptCta = e.target.value;
      syncCombinedScriptFromSections();
      updateScriptTelemetry();
      saveSlotsToStorage();
    });
  }

  // Bind caption textarea for active slot
  const captionInput = document.getElementById('captionInput');
  if (captionInput) {
    captionInput.addEventListener('input', (e) => {
      const slot = getActiveSlot();
      slot.caption = e.target.value;
      saveSlotsToStorage();
    });
  }
}

function syncCombinedScriptFromSections() {
  const slot = getActiveSlot();
  const scriptInput = document.getElementById('scriptInput');
  if (scriptInput && !slot.scriptText) {
    const combined = [slot.scriptHook, slot.scriptBody, slot.scriptCta].filter(Boolean).join('\n\n');
    slot.scriptText = combined;
    scriptInput.value = combined;
  }
}

function switchFlow(flowName) {
  if (!FLOW_CONFIG[flowName]) return;
  wireframeState.activeFlow = flowName;

  document.querySelectorAll('.hf-flow-pill').forEach(btn => {
    if (btn.getAttribute('data-flow') === flowName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderCurrentScreen();
}

function getCurrentStep() {
  return wireframeState.activeFlow === 'onboarding'
    ? wireframeState.onboardingStep
    : wireframeState.contentBucketStep;
}

function setScreenDirectly(stepNumber) {
  const max = FLOW_CONFIG[wireframeState.activeFlow].totalSteps;
  const clamped = Math.max(1, Math.min(stepNumber, max));
  
  if (wireframeState.activeFlow === 'onboarding') {
    wireframeState.onboardingStep = clamped;
  } else {
    wireframeState.contentBucketStep = clamped;
  }
  renderCurrentScreen();
}

// Universal alias ensuring any call to setCurrentStep enforces gate validation
function setCurrentStep(stepNumber) {
  navigateToStep(stepNumber);
}

/**
 * Universal Navigation and Gate Controller
 * Enforces:
 * 1. Returning to earlier screens is ALWAYS allowed without blocking.
 * 2. Mandatory script cannot be bypassed via Next, progress segments, direct calls, or actions.
 * 3. Human approval gate cannot be bypassed when advancing to scheduling.
 */
function navigateToStep(targetStep) {
  const flow = wireframeState.activeFlow;
  const current = getCurrentStep();

  // Allow creators to return to earlier screens to edit content at all times
  if (targetStep < current) {
    setScreenDirectly(targetStep);
    return;
  }

  // Onboarding forward validation
  if (flow === 'onboarding') {
    if (current === 3 && targetStep > 3) {
      const name = wireframeState.onboardingData.displayName;
      const handle = wireframeState.onboardingData.handle;
      if (!name || name.length < 2) {
        alert('Validation Error: Please provide a valid Display Name (minimum 2 characters).');
        document.getElementById('inputDisplayName')?.focus();
        return;
      }
      if (!handle || handle.length < 2) {
        alert('Validation Error: Please provide a valid Creator Handle (e.g. @yourname).');
        document.getElementById('inputHandle')?.focus();
        return;
      }
    }
    setScreenDirectly(targetStep);
    return;
  }

  // Content Bucket forward validation
  if (flow === 'content-bucket') {
    const slot = getActiveSlot();

    // Advancing past Step 3 (to Step 4 Captions, Step 5 Review, or Step 6 Scheduling) requires a valid script
    if (targetStep >= 4) {
      if (!isSlotScriptValid(slot)) {
        const errorBanner = document.getElementById('scriptValidationBanner');
        if (errorBanner) {
          errorBanner.classList.add('active');
          errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        alert('Validation Error: Every post requires a script. A post cannot advance to captions, review, or scheduling without a script.');
        setScreenDirectly(3);
        document.getElementById('scriptInput')?.focus();
        return;
      }
    }

    // Advancing to Scheduling (Step 6) requires explicit Human Approval in Step 5
    if (targetStep === 6) {
      if (!slot.humanApproved) {
        alert('Action Blocked: No content leaves the platform without explicit human approval. Please verify and approve the post in Step 5 before scheduling.');
        setScreenDirectly(5);
        return;
      }
    }

    setScreenDirectly(targetStep);
  }
}

function nextStep() {
  navigateToStep(getCurrentStep() + 1);
}

function prevStep() {
  const current = getCurrentStep();
  if (current > 1) {
    navigateToStep(current - 1);
  }
}

function renderCurrentScreen() {
  const flow = wireframeState.activeFlow;
  const step = getCurrentStep();
  const config = FLOW_CONFIG[flow];

  // 1. Update Step Header Text
  const flowEyebrowEl = document.getElementById('flowEyebrow');
  const screenHeadingEl = document.getElementById('screenHeading');
  const stepCounterEl = document.getElementById('stepCounter');
  if (flowEyebrowEl) flowEyebrowEl.textContent = `${config.title}`;
  if (screenHeadingEl) screenHeadingEl.textContent = `${config.stepNames[step - 1]}`;
  if (stepCounterEl) stepCounterEl.textContent = `Screen ${step} of ${config.totalSteps}`;

  // 2. Render Progress Segments (Safe Gate Enforcement)
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.innerHTML = '';
    for (let i = 1; i <= config.totalSteps; i++) {
      const seg = document.createElement('div');
      seg.className = 'hf-progress-seg';
      if (i < step) seg.classList.add('completed');
      if (i === step) seg.classList.add('active');
      seg.title = `Screen ${i}: ${config.stepNames[i - 1]}`;
      seg.addEventListener('click', () => {
        navigateToStep(i);
      });
      progressBar.appendChild(seg);
    }
  }

  // 3. Show active screen container, hide others
  const allScreens = document.querySelectorAll('.hf-screen-view');
  allScreens.forEach(scr => {
    scr.style.display = 'none';
  });

  const activeScreenId = `screen-${flow}-${step}`;
  const activeScreenEl = document.getElementById(activeScreenId);
  if (activeScreenEl) {
    activeScreenEl.style.display = 'block';
  }

  // 4. Update Navigation Buttons
  const backButtons = document.querySelectorAll('.action-back');
  const nextButtons = document.querySelectorAll('.action-next');

  backButtons.forEach(btn => {
    btn.disabled = step === 1;
  });

  nextButtons.forEach(btn => {
    if (step === config.totalSteps) {
      btn.textContent = flow === 'onboarding' ? 'Launch Creator Workspace 🚀' : 'Confirm Proposed Schedule (Approved) 🚀';
      btn.classList.add('hf-btn-accent');
      btn.classList.remove('hf-btn-primary');
    } else {
      btn.textContent = 'Next Screen →';
      btn.classList.add('hf-btn-primary');
      btn.classList.remove('hf-btn-accent');
    }
  });

  // 5. Populate Dynamic Views based on Flow & Step
  if (flow === 'onboarding' && step === 6) {
    populateOnboardingSummary();
  }
  if (flow === 'content-bucket') {
    populateContentBucketViews(step);
  }
}

// Content Bucket Specific Rendering (Bhavya's Confirmed Workflow)
function populateContentBucketViews(step) {
  const slot = getActiveSlot();

  // BKT-1: Render 12-Slot Visual Grid & Progress Meter
  if (step === 1) {
    render12SlotGrid();
  }

  // BKT-2: Populate Slot Selection & Asset Format
  if (step === 2) {
    const slotBadge = document.getElementById('bkt2ActiveSlotBadge');
    if (slotBadge) slotBadge.textContent = `Editing Slot ${slot.id} of 12`;
    const slotTitleInput = document.getElementById('bkt2SlotTitle');
    if (slotTitleInput) slotTitleInput.value = slot.title;
    
    // Format selector
    document.querySelectorAll('.bkt2-format-card').forEach(card => {
      if (card.getAttribute('data-type') === slot.type) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  // BKT-3: Mandatory Script Input (Unified primary script field)
  if (step === 3) {
    const slotBadge = document.getElementById('bkt3ActiveSlotBadge');
    if (slotBadge) slotBadge.textContent = `Slot ${slot.id}: ${slot.title}`;
    
    const scriptInput = document.getElementById('scriptInput');
    const hookEl = document.getElementById('scriptHookInput');
    const bodyEl = document.getElementById('scriptBodyInput');
    const ctaEl = document.getElementById('scriptCtaInput');
    
    const fullText = slot.scriptText || [slot.scriptHook, slot.scriptBody, slot.scriptCta].filter(Boolean).join('\n\n');
    if (scriptInput) scriptInput.value = fullText;
    if (hookEl) hookEl.value = slot.scriptHook || '';
    if (bodyEl) bodyEl.value = slot.scriptBody || '';
    if (ctaEl) ctaEl.value = slot.scriptCta || '';
    
    updateScriptTelemetry();

    const banner = document.getElementById('scriptValidationBanner');
    if (banner) {
      if (isSlotScriptValid(slot)) {
        banner.classList.remove('active');
      }
    }
  }

  // BKT-4: Caption Editing & AI Correction
  if (step === 4) {
    const slotBadge = document.getElementById('bkt4ActiveSlotBadge');
    if (slotBadge) slotBadge.textContent = `Slot ${slot.id}: ${slot.title}`;
    const capEl = document.getElementById('captionInput');
    if (capEl) capEl.value = slot.caption || '';
    
    // Transparent Caption Source Labeling
    // Shows "Served from memory" strictly when mock data explicitly indicates a memory source
    const modBadge = document.getElementById('captionStyleBadge');
    if (modBadge) {
      if (slot.captionSource === 'memory') {
        modBadge.textContent = 'Served from memory';
        modBadge.className = 'hf-badge hf-badge-memory';
        modBadge.title = slot.memoryContext || 'Derived from creator persona memory';
      } else if (slot.captionAiModified) {
        modBadge.textContent = 'Sample • AI-suggested (Style-Aligned)';
        modBadge.className = 'hf-badge hf-badge-ai';
      } else {
        modBadge.textContent = 'Sample • AI-suggested';
        modBadge.className = 'hf-badge hf-badge-ai';
      }
    }

    // Music idea display with explicit trend disclaimer
    const musicEl = document.getElementById('musicIdeaDisplay');
    if (musicEl) musicEl.textContent = slot.musicIdea || 'Atmospheric Synthwave (120 BPM) [AI-suggested - Unverified Trend Data]';

    renderHashtagsList(slot);
  }

  // BKT-5: Review & Human Approval
  if (step === 5) {
    const revSlotBadge = document.getElementById('revSlotBadge');
    if (revSlotBadge) revSlotBadge.textContent = `Slot ${slot.id} of 12 • Format: ${slot.type.toUpperCase()}`;
    const revTitle = document.getElementById('revTitle');
    if (revTitle) revTitle.textContent = slot.title;
    const revHook = document.getElementById('revHook');
    if (revHook) {
      const scriptPreview = (slot.scriptText || slot.scriptHook || '').trim();
      revHook.textContent = scriptPreview ? `"${scriptPreview.slice(0, 140)}${scriptPreview.length > 140 ? '...' : ''}"` : '[No script provided - Mandatory]';
    }
    const revCaption = document.getElementById('revCaption');
    if (revCaption) revCaption.textContent = slot.caption || '[No caption generated]';
    
    // Caption memory source badge in Review pane
    const revCaptionSourceBadge = document.getElementById('revCaptionSourceBadge');
    if (revCaptionSourceBadge) {
      if (slot.captionSource === 'memory') {
        revCaptionSourceBadge.textContent = 'Served from memory';
        revCaptionSourceBadge.className = 'hf-badge hf-badge-memory';
      } else {
        revCaptionSourceBadge.textContent = 'Sample • AI-suggested';
        revCaptionSourceBadge.className = 'hf-badge hf-badge-ai';
      }
    }

    const revMusic = document.getElementById('revMusic');
    if (revMusic) revMusic.textContent = slot.musicIdea || '[No music suggested]';
    
    // Human Approval Checkbox
    const approvalCheck = document.getElementById('humanApprovalCheckbox');
    if (approvalCheck) {
      approvalCheck.checked = !!slot.humanApproved;
    }
    const approvalStatusBadge = document.getElementById('approvalStatusBadge');
    if (approvalStatusBadge) {
      if (slot.humanApproved) {
        approvalStatusBadge.textContent = 'Human Approved ✓';
        approvalStatusBadge.className = 'hf-status-pill approved';
      } else {
        approvalStatusBadge.textContent = 'Awaiting Human Approval ⚠️';
        approvalStatusBadge.className = 'hf-status-pill needs-script';
      }
    }
  }

  // BKT-6: Scheduling & Truthful Publishing
  if (step === 6) {
    renderSchedulingScreen(slot);
  }
}

// 12-Slot Visual Grid Generator (BKT-1)
function render12SlotGrid() {
  const gridContainer = document.getElementById('slotGrid12');
  const meterFill = document.getElementById('meterFill');
  const meterText = document.getElementById('meterText');
  
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  const filledSlots = wireframeState.bucketSlots.filter(s => s.type !== 'empty');
  const count = filledSlots.length;

  if (meterFill) meterFill.style.width = `${(count / 12) * 100}%`;
  if (meterText) meterText.textContent = `${count} / 12 Slots Filled (Partial Bucket Scheduling is Valid)`;

  wireframeState.bucketSlots.forEach((slot, index) => {
    const card = document.createElement('div');
    const isEmpty = slot.type === 'empty';
    card.className = `hf-slot-card ${isEmpty ? 'empty-slot' : ''} ${index === wireframeState.selectedSlotIndex ? 'active-slot' : ''}`;
    card.tabIndex = 0;
    card.role = 'button';
    card.setAttribute('aria-label', `Select Slot ${slot.id}: ${slot.title}`);

    // Map status to readable tag (Never display "Live")
    const statusClassMap = {
      empty: 'empty',
      'video-added': 'ready',
      'needs-script': 'needs-script',
      'script-done': 'ready',
      'captions-ready': 'ready',
      approved: 'approved',
      scheduled: 'scheduled',
      posted: 'posted',
      failed: 'failed'
    };
    const statusLabelMap = {
      empty: 'Empty Slot',
      'video-added': 'Asset Added',
      'needs-script': 'Needs Script ⚠️',
      'script-done': 'Script Done',
      'captions-ready': 'Captions Ready',
      approved: 'Approved ✓',
      scheduled: 'Scheduled',
      posted: 'Posted (Sample)',
      failed: 'Failed (Sample)'
    };

    const statusPillClass = statusClassMap[slot.status] || 'ready';
    const statusPillText = statusLabelMap[slot.status] || slot.status;

    card.innerHTML = `
      <div class="hf-slot-card-header">
        <span class="hf-slot-num">SLOT ${slot.id.toString().padStart(2, '0')}</span>
        <span class="hf-status-pill ${statusPillClass}">${statusPillText}</span>
      </div>
      <div class="hf-slot-title">${isEmpty ? '+ Add Content Slot' : slot.title}</div>
      <div class="hf-slot-meta">
        <span>Format: <strong>${isEmpty ? 'Available' : slot.type.toUpperCase()}</strong></span>
        ${slot.proposedDate ? `<span style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-cyan);">${slot.proposedDate.slice(5)}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      wireframeState.selectedSlotIndex = index;
      render12SlotGrid();
      navigateToStep(2);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wireframeState.selectedSlotIndex = index;
        navigateToStep(2);
      }
    });

    gridContainer.appendChild(card);
  });
}

// BKT-2 Format Selector
function selectSlotFormat(element, formatType) {
  document.querySelectorAll('.bkt2-format-card').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');
  const slot = getActiveSlot();
  slot.type = formatType;
  if (slot.title === 'Empty Slot') {
    slot.title = `Untitled ${formatType.toUpperCase()} Post`;
  }
  if (slot.status === 'empty') {
    slot.status = 'needs-script';
  }
  saveSlotsToStorage();
}

function updateSlotTitleFromInput(val) {
  const slot = getActiveSlot();
  slot.title = val.trim() || `Slot ${slot.id} Post`;
  saveSlotsToStorage();
}

// BKT-3 Script Telemetry Calculator
function updateScriptTelemetry() {
  const slot = getActiveSlot();
  const fullText = (slot.scriptText || `${slot.scriptHook || ''} ${slot.scriptBody || ''} ${slot.scriptCta || ''}`).trim();
  const wordCount = fullText ? fullText.split(/\s+/).length : 0;
  const spokenSecs = Math.round(wordCount / 2.3); // ~138 words per minute

  const countEl = document.getElementById('scriptWordCount');
  const paceEl = document.getElementById('scriptPaceEstimate');
  const statusEl = document.getElementById('scriptReqStatus');

  if (countEl) countEl.textContent = `${wordCount} Words`;
  if (paceEl) paceEl.textContent = `~${spokenSecs} Seconds [Sample estimate]`;
  if (statusEl) {
    if (isSlotScriptValid(slot)) {
      statusEl.textContent = 'Script Provided (Valid)';
      statusEl.style.color = '#10B981';
    } else {
      statusEl.textContent = 'Script Required (Mandatory)';
      statusEl.style.color = '#F59E0B';
    }
  }
}

// BKT-4 AI Correction Action (Simulates Creator Voice Style Alignment)
function applyAiCorrection() {
  const slot = getActiveSlot();
  const textarea = document.getElementById('captionInput');
  const original = textarea ? textarea.value : slot.caption;

  const corrected = `🔥 CreatorOS Style-Aligned: "${original.replace(/(\. )/g, '.\n\n')}"\n\nDrop a comment if you are building this week. 🚀`;
  
  if (textarea) textarea.value = corrected;
  slot.caption = corrected;
  slot.captionAiModified = true;
  slot.captionSource = 'ai-suggested';
  saveSlotsToStorage();

  const modBadge = document.getElementById('captionStyleBadge');
  if (modBadge) {
    modBadge.textContent = 'Sample • AI-suggested (Style-Aligned)';
    modBadge.className = 'hf-badge hf-badge-ai';
  }
  alert('[Sample Action]: Applied creator voice style alignment. All outputs remain Sample and AI-suggested.');
}

function renderHashtagsList(slot) {
  const container = document.getElementById('hashtagChipsList');
  if (!container) return;
  container.innerHTML = '';
  
  const tags = slot.hashtags && slot.hashtags.length > 0
    ? slot.hashtags
    : ['#CreatorEconomy', '#AItools', '#ContentStrategy', '#CodeMeet2026'];

  tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'hf-chip selected';
    chip.textContent = tag;
    chip.title = 'AI-suggested hashtag [Unverified Trend Data] (Click to toggle)';
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
    container.appendChild(chip);
  });
}

// BKT-5 Human Approval Checkbox Toggle (Gate cannot be bypassed)
function toggleHumanApproval(checked) {
  const slot = getActiveSlot();
  if (checked && !isSlotScriptValid(slot)) {
    alert('Action Blocked: A script is required before this post can be approved.');
    const approvalCheck = document.getElementById('humanApprovalCheckbox');
    if (approvalCheck) approvalCheck.checked = false;
    navigateToStep(3);
    return;
  }

  slot.humanApproved = checked;
  if (checked) {
    if (slot.status === 'captions-ready' || slot.status === 'script-done') {
      slot.status = 'approved';
    }
  } else {
    if (slot.status === 'approved') {
      slot.status = 'captions-ready';
    }
  }
  saveSlotsToStorage();
  
  const approvalStatusBadge = document.getElementById('approvalStatusBadge');
  if (approvalStatusBadge) {
    if (slot.humanApproved) {
      approvalStatusBadge.textContent = 'Human Approved ✓';
      approvalStatusBadge.className = 'hf-status-pill approved';
    } else {
      approvalStatusBadge.textContent = 'Awaiting Human Approval ⚠️';
      approvalStatusBadge.className = 'hf-status-pill needs-script';
    }
  }
}

// BKT-6 Scheduling & Truthful Publishing Status Rendering
function renderSchedulingScreen(slot) {
  const schedSlotBadge = document.getElementById('schedSlotBadge');
  if (schedSlotBadge) schedSlotBadge.textContent = `Slot ${slot.id}: ${slot.title}`;

  const dateInput = document.getElementById('schedDateInput');
  const timeInput = document.getElementById('schedTimeInput');
  if (dateInput) dateInput.value = slot.proposedDate || '2026-11-04';
  if (timeInput) timeInput.value = slot.proposedTime || '17:30';

  const approvalReqNote = document.getElementById('schedApprovalCheckNote');
  if (approvalReqNote) {
    if (!slot.humanApproved) {
      approvalReqNote.style.display = 'block';
      approvalReqNote.textContent = '⚠️ Note: This slot has not received explicit Human Approval in Screen BKT-5.';
    } else {
      approvalReqNote.style.display = 'none';
    }
  }

  renderRetryHistory(slot);
}

// Render Preserved Failure & Attempt History Log
function renderRetryHistory(slot) {
  const container = document.getElementById('retryHistoryList');
  if (!container) return;
  container.innerHTML = '';
  const history = slot.retryHistory && slot.retryHistory.length > 0 ? slot.retryHistory : [
    {
      attempt: 1,
      timestamp: '2026-11-02 19:00 IST (Provisional)',
      outcome: 'Failed (Sample)',
      detail: 'Sample Dispatch Error (Code 401): Simulated OAuth access token expired.'
    }
  ];

  history.forEach(item => {
    const row = document.createElement('div');
    row.style.padding = '4px 0';
    row.style.borderBottom = '1px dashed rgba(255,255,255,0.08)';
    const isSuccess = item.outcome.includes('Posted') || item.outcome.includes('Success');
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: ${isSuccess ? '#10B981' : '#FCA5A5'}; font-size: 11px;">${item.outcome}</span>
        <span style="font-size: 10px; color: var(--text-subtle);">${item.timestamp}</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Attempt ${item.attempt}: ${item.detail}</div>
    `;
    container.appendChild(row);
  });
}

// Simulate Publishing Demonstration with Truthful Status Tracking
function simulatePublishDemonstration() {
  const slot = getActiveSlot();

  // 1. Mandatory Script Gate
  if (!isSlotScriptValid(slot)) {
    alert('Action Blocked: Every post requires a script. Please provide a script in Step 3 before scheduling.');
    navigateToStep(3);
    return;
  }

  // 2. Mandatory Human Approval Gate
  if (!slot.humanApproved) {
    alert('Action Blocked: No content leaves the platform without explicit human approval. Please approve the post in BKT-5 before scheduling dispatch.');
    navigateToStep(5);
    return;
  }

  // 3. Explicit schedule confirmation checkbox
  const schedApproveCheck = document.getElementById('schedExplicitApproveCheck');
  if (schedApproveCheck && !schedApproveCheck.checked) {
    alert('Action Blocked: You must explicitly approve the proposed schedule before dispatching.');
    return;
  }

  slot.status = 'scheduled';
  slot.publishStatus = 'Scheduled';
  slot.proposedDate = document.getElementById('schedDateInput')?.value || slot.proposedDate;
  slot.proposedTime = document.getElementById('schedTimeInput')?.value || slot.proposedTime;
  saveSlotsToStorage();

  alert(`[Truthful Schedule Confirmation - Sample]:\nSlot ${slot.id} ("${slot.title}") is queued as Scheduled for ${slot.proposedDate} at ${slot.proposedTime} ${slot.timezone}.\n\nNo live external API calls were made. State is retained in local browser demonstration storage.`);
  render12SlotGrid();
}

/**
 * Controlled Retry Simulation:
 * - Never automatically implies real publishing success.
 * - Shows simulated retry-in-progress state.
 * - Demonstrates BOTH simulated success and failure outcomes.
 * - Labels every simulated outcome "Sample".
 * - Preserves previous failure information in demo history.
 */
function simulateRetryWithOutcome(outcome) {
  const slot = getActiveSlot();
  const inProgressBanner = document.getElementById('retryInProgressBanner');
  const actionButtons = document.getElementById('retryActionButtons');
  const statusPill = document.getElementById('demoFailedStatusPill');
  const statusText = document.getElementById('demoFailedStatusText');
  const errorDetail = document.getElementById('demoFailedErrorDetail');

  if (!slot.retryHistory || slot.retryHistory.length === 0) {
    slot.retryHistory = [
      {
        attempt: 1,
        timestamp: '2026-11-02 19:00 IST (Provisional)',
        outcome: 'Failed (Sample)',
        detail: 'Sample Dispatch Error (Code 401): Simulated OAuth access token expired.'
      }
    ];
  }

  // 1. Show simulated retry-in-progress state
  if (inProgressBanner) inProgressBanner.style.display = 'block';
  if (actionButtons) actionButtons.style.display = 'none';
  if (statusPill) {
    statusPill.textContent = 'Publishing (Sample)';
    statusPill.className = 'hf-status-pill ready';
  }
  if (statusText) statusText.textContent = 'Simulated Retry in Progress...';
  if (errorDetail) errorDetail.textContent = 'Re-verifying simulated webhook handshake and tokens...';

  setTimeout(() => {
    if (inProgressBanner) inProgressBanner.style.display = 'none';
    if (actionButtons) actionButtons.style.display = 'flex';

    const nextAttempt = slot.retryHistory.length + 1;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST (Provisional)';

    if (outcome === 'success') {
      slot.status = 'posted';
      slot.publishStatus = 'Posted (Sample)';
      if (statusPill) {
        statusPill.textContent = 'Posted (Sample)';
        statusPill.className = 'hf-status-pill posted';
      }
      if (statusText) statusText.textContent = 'Sample Success: Simulated Dispatch';
      if (errorDetail) errorDetail.textContent = 'Simulated token re-authenticated; YouTube asset queued as "Private, pending audit" (Sample).';

      slot.retryHistory.push({
        attempt: nextAttempt,
        timestamp: nowTime,
        outcome: 'Posted (Sample)',
        detail: 'Simulated OAuth token re-authenticated; YouTube upload marked "Private, pending audit" (Sample).'
      });
      saveSlotsToStorage();
      renderRetryHistory(slot);
      alert('[Simulated Retry Outcome - Sample]:\nSimulated retry completed with Sample Success.\nYouTube upload marked as "Private, pending audit" (Sample).\nPrior failure information preserved in demo history.');
    } else {
      slot.status = 'failed';
      slot.publishStatus = 'Failed (Sample)';
      if (statusPill) {
        statusPill.textContent = 'Failed (Sample)';
        statusPill.className = 'hf-status-pill failed';
      }
      if (statusText) statusText.textContent = 'Sample Failure: Rate Limit (Simulated)';
      if (errorDetail) errorDetail.textContent = 'Simulated API Error (Code 429: Simulated rate limit exceeded during token refresh retry).';

      slot.retryHistory.push({
        attempt: nextAttempt,
        timestamp: nowTime,
        outcome: 'Failed (Sample)',
        detail: 'Sample Error (Code 429): Simulated rate limit exceeded during token refresh retry.'
      });
      saveSlotsToStorage();
      renderRetryHistory(slot);
      alert('[Simulated Retry Outcome - Sample]:\nSimulated retry completed with Sample Failure (Code 429).\nPrior failure information preserved in demo history.');
    }
  }, 1000);
}

// Dynamic Summary Population for Onboarding Screen 6
function populateOnboardingSummary() {
  const d = wireframeState.onboardingData;
  const personaMap = {
    'solo-creator': 'Solo Content Creator',
    'studio-agency': 'Creator Studio / Media Agency',
    'educator-coach': 'Educator / Course Creator',
    'brand-influencer': 'E-Commerce / Brand Influencer'
  };

  const personaEl = document.getElementById('summaryPersona');
  const profileEl = document.getElementById('summaryProfile');
  const nicheEl = document.getElementById('summaryNiche');
  const goalsEl = document.getElementById('summaryGoals');

  if (personaEl) personaEl.textContent = personaMap[d.persona] || d.persona;
  if (profileEl) profileEl.textContent = `${d.displayName} (${d.handle}) • Primary: ${d.primaryPlatform}`;
  if (nicheEl) nicheEl.textContent = `${d.niche} [${d.subtopics.join(', ')}]`;
  if (goalsEl) goalsEl.textContent = d.goals.join(' • ');
}

// Interactive Helpers for Onboarding
function selectPersona(cardEl, personaKey) {
  document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  wireframeState.onboardingData.persona = personaKey;
}

function selectGoal(cardEl, goalName) {
  cardEl.classList.toggle('selected');
  const goals = wireframeState.onboardingData.goals;
  const idx = goals.indexOf(goalName);
  if (idx > -1) {
    goals.splice(idx, 1);
  } else {
    goals.push(goalName);
  }
}

function toggleChip(chipEl, topic) {
  chipEl.classList.toggle('selected');
  const topics = wireframeState.onboardingData.subtopics;
  const idx = topics.indexOf(topic);
  if (idx > -1) {
    topics.splice(idx, 1);
  } else {
    topics.push(topic);
  }
}

function selectPlatform(cardEl, platformName) {
  document.querySelectorAll('.hf-platform-radio-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  wireframeState.onboardingData.primaryPlatform = platformName;
}

// Export globals to window for browser console access and automated testing
if (typeof window !== 'undefined') {
  window.wireframeState = wireframeState;
  window.DEFAULT_12_SLOTS = DEFAULT_12_SLOTS;
  window.FLOW_CONFIG = FLOW_CONFIG;
  window.navigateToStep = navigateToStep;
  window.setCurrentStep = setCurrentStep;
  window.setScreenDirectly = setScreenDirectly;
  window.getActiveSlot = getActiveSlot;
  window.isSlotScriptValid = isSlotScriptValid;
  window.simulateRetryWithOutcome = simulateRetryWithOutcome;
  window.simulatePublishDemonstration = simulatePublishDemonstration;
  window.toggleHumanApproval = toggleHumanApproval;
  window.selectSlotFormat = selectSlotFormat;
  window.updateSlotTitleFromInput = updateSlotTitleFromInput;
  window.applyAiCorrection = applyAiCorrection;
  window.resetPrototypeStorage = resetPrototypeStorage;
  window.selectPlatform = selectPlatform;
  window.selectPersona = selectPersona;
  window.selectGoal = selectGoal;
  window.toggleChip = toggleChip;
}

