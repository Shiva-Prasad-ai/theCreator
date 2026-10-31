import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, SelectCard } from '../ui/Card';
import { Input, Textarea, ErrorBanner } from '../ui/Input';
import { TrustBadge } from '../ui/Badge';

/**
 * CreatorOS AI — High-Fidelity Onboarding Flow Blueprint
 * Encompasses ONB-1 through ONB-6.
 * Reference implementation for Shiva's Next.js integration.
 */

export interface OnboardingState {
  persona: string;
  displayName: string;
  handle: string;
  bio: string;
  niche: string;
  audience: string;
  cadence: string;
  growthGoal: string;
}

export interface OnboardingFlowProps {
  initialState?: Partial<OnboardingState>;
  onComplete?: (state: OnboardingState) => void;
  onSwitchToBucket?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialState,
  onComplete,
  onSwitchToBucket
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formState, setFormState] = useState<OnboardingState>({
    persona: initialState?.persona || 'tech-educator',
    displayName: initialState?.displayName || 'Jeevan Tech',
    handle: initialState?.handle || '@jeevantech',
    bio: initialState?.bio || 'Building AI agents and modern creator tools for engineers.',
    niche: initialState?.niche || 'ai-engineering',
    audience: initialState?.audience || 'Senior software engineers and AI builders.',
    cadence: initialState?.cadence || '3-posts-week',
    growthGoal: initialState?.growthGoal || 'reach-10k'
  });

  const personas = [
    {
      id: 'tech-educator',
      title: 'Technical Educator',
      description: 'Break down complex software engineering, system design, and AI models for developers.',
      icon: '💻'
    },
    {
      id: 'indie-hacker',
      title: 'Indie Hacker & Builder',
      description: 'Document build-in-public journeys, revenue milestones, and shipping micro-SaaS.',
      icon: '🚀'
    },
    {
      id: 'ai-researcher',
      title: 'AI Practitioner',
      description: 'Benchmark LLMs, evaluate agent frameworks, and explain paper implementations.',
      icon: '🧠'
    },
    {
      id: 'founder',
      title: 'Tech Founder',
      description: 'Share leadership insights, engineering culture, hiring, and company scale.',
      icon: '🏢'
    }
  ];

  const niches = [
    { id: 'ai-engineering', title: 'AI Engineering & LLMs', count: 'High engagement' },
    { id: 'fullstack-web', title: 'Fullstack & Next.js Ecosystem', count: 'Fastest growing' },
    { id: 'devops-cloud', title: 'Cloud Infrastructure & DevOps', count: 'Enterprise audience' },
    { id: 'career-growth', title: 'Tech Career & Senior Leadership', count: 'Broad reach' }
  ];

  const handleNext = () => {
    setErrorMessage(null);

    // Step 3 validation: Display name and handle required
    if (currentStep === 3) {
      if (!formState.displayName.trim() || !formState.handle.trim()) {
        setErrorMessage('Display Name and Primary Handle are required to personalize your creator profile.');
        return;
      }
    }

    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onComplete) onComplete(formState);
      if (onSwitchToBucket) onSwitchToBucket();
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      {/* Onboarding Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>STEP {currentStep} OF 6</span>
          <span className="text-accent font-semibold">
            {currentStep === 1 && 'Welcome'}
            {currentStep === 2 && 'Persona Selection'}
            {currentStep === 3 && 'Profile Setup'}
            {currentStep === 4 && 'Niche & Audience'}
            {currentStep === 5 && 'Cadence & Goals'}
            {currentStep === 6 && 'Review & Confirmation'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-accent transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6">
          <ErrorBanner message={errorMessage} />
        </div>
      )}

      {/* Screen 1: Welcome */}
      {currentStep === 1 && (
        <Card variant="glass" className="text-center p-10 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20">
            ⚡
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-3xl font-extrabold text-white">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-accent">CreatorOS AI</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Your autonomous creator command center. Supercharge your content workflow with an AI brain attuned to your unique voice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-accent font-bold text-xs uppercase block mb-1">01. Setup</span>
              <p className="text-xs text-slate-300">Quick 2-minute creator profile configuration.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-violet-400 font-bold text-xs uppercase block mb-1">02. Alignment</span>
              <p className="text-xs text-slate-300">AI learns your tone, format, and technical depth.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-cyan-400 font-bold text-xs uppercase block mb-1">03. Production</span>
              <p className="text-xs text-slate-300">Organize content in your 12-slot Content Bucket.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Screen 2: Persona */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Select Your Primary Persona</h2>
            <p className="text-sm text-slate-400">Choose the profile that best reflects how you communicate with your audience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map(p => (
              <SelectCard
                key={p.id}
                title={p.title}
                description={p.description}
                selected={formState.persona === p.id}
                icon={<span>{p.icon}</span>}
                onClick={() => setFormState(prev => ({ ...prev, persona: p.id }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Screen 3: Profile Setup */}
      {currentStep === 3 && (
        <Card variant="glass" className="space-y-5">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Creator Profile Setup</h2>
            <p className="text-sm text-slate-400">Personalize how CreatorOS AI formats your platform signatures and handles.</p>
          </div>
          <Input
            label="Display Name *"
            value={formState.displayName}
            onChange={e => setFormState(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="e.g. Jeevan Tech"
          />
          <Input
            label="Primary Social Handle *"
            value={formState.handle}
            onChange={e => setFormState(prev => ({ ...prev, handle: e.target.value }))}
            placeholder="e.g. @jeevantech"
          />
          <Textarea
            label="Creator Bio / Background"
            value={formState.bio}
            onChange={e => setFormState(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell your AI brain about your core domain, writing style, and experience..."
            characterCount={formState.bio.length}
            maxCharacters={240}
          />
        </Card>
      )}

      {/* Screen 4: Niche & Audience */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Target Niche & Audience</h2>
            <p className="text-sm text-slate-400">Specify your domain so CreatorOS AI generates high-authority terminology.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {niches.map(n => (
              <SelectCard
                key={n.id}
                title={n.title}
                description={n.count}
                selected={formState.niche === n.id}
                onClick={() => setFormState(prev => ({ ...prev, niche: n.id }))}
              />
            ))}
          </div>
          <Textarea
            label="Describe Your Ideal Viewer / Reader"
            value={formState.audience}
            onChange={e => setFormState(prev => ({ ...prev, audience: e.target.value }))}
            placeholder="e.g., Developers looking to level up their architecture skills, tech leaders..."
          />
        </div>
      )}

      {/* Screen 5: Goals */}
      {currentStep === 5 && (
        <Card variant="glass" className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-1">Publishing Cadence & Goals</h2>
            <p className="text-sm text-slate-400">Set your pacing for the 12-slot Content Bucket.</p>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
              Target Publishing Cadence
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['2-posts-week', '3-posts-week', 'daily-pulse'].map(cad => (
                <button
                  key={cad}
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, cadence: cad }))}
                  className={`p-3 text-xs font-semibold rounded-md border text-center transition-all ${
                    formState.cadence === cad
                      ? 'bg-accent/20 border-accent text-accent font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cad === '2-posts-week' && '2 Posts / Week'}
                  {cad === '3-posts-week' && '3 Posts / Week (Recommended)'}
                  {cad === 'daily-pulse' && 'Daily Pulse (7/wk)'}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Primary 90-Day Growth Objective"
            value={formState.growthGoal}
            onChange={e => setFormState(prev => ({ ...prev, growthGoal: e.target.value }))}
            placeholder="e.g. Reach 10,000 developer subscribers"
          />
        </Card>
      )}

      {/* Screen 6: Review & Launch */}
      {currentStep === 6 && (
        <Card variant="glass" className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-1">Configuration Review</h2>
              <p className="text-sm text-slate-400">Confirm your settings before entering your Content Bucket workspace.</p>
            </div>
            <TrustBadge type="verified">Ready for Launch</TrustBadge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Creator Identity</span>
              <span className="font-bold text-white">{formState.displayName} ({formState.handle})</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Primary Persona</span>
              <span className="font-bold text-accent capitalize">{formState.persona.replace('-', ' ')}</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Target Niche</span>
              <span className="font-bold text-white capitalize">{formState.niche.replace('-', ' ')}</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Publishing Cadence</span>
              <span className="font-bold text-violet-300 capitalize">{formState.cadence.replace(/-/g, ' ')}</span>
            </div>
          </div>

          <div className="p-4 bg-violet-950/20 border border-violet-500/30 rounded-lg">
            <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">Content Bucket Rules</h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>12-Slot visual grid with partial bucket publishing support.</li>
              <li>Every post strictly requires a valid script before AI captions or scheduling.</li>
              <li>Explicit human approval gate enforced prior to mock publishing.</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
        {currentStep > 1 ? (
          <Button variant="ghost" onClick={handleBack}>
            ← Back
          </Button>
        ) : (
          <div />
        )}
        <Button variant="primary" onClick={handleNext}>
          {currentStep === 6 ? 'Launch Content Bucket →' : 'Continue →'}
        </Button>
      </div>
    </div>
  );
};

