'use client';

/**
 * StepWizard Component
 * Multi-step form wizard
 * @module components/StepWizard
 * @version 1.0.0
 */

import { memo, useState, useCallback, ReactNode, createContext, useContext } from 'react';

// Types
interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  optional?: boolean;
}

interface WizardContextType {
  currentStep: number;
  steps: Step[];
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  completedSteps: number[];
  markCompleted: (step: number) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within StepWizard');
  }
  return context;
}

// Main StepWizard component
interface StepWizardProps {
  steps: Step[];
  children: ReactNode | ((context: WizardContextType) => ReactNode);
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  allowStepClick?: boolean;
  showStepIndicator?: boolean;
  indicatorPosition?: 'top' | 'left';
  className?: string;
}

function StepWizardComponent({
  steps,
  children,
  initialStep = 0,
  onStepChange,
  onComplete,
  allowStepClick = false,
  showStepIndicator = true,
  indicatorPosition = 'top',
  className = '',
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [steps.length, onStepChange]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      const next = currentStep + 1;
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      goToStep(next);
    } else {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      onComplete?.();
    }
  }, [currentStep, isLastStep, goToStep, onComplete]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, isFirstStep, goToStep]);

  const markCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  }, []);

  const contextValue: WizardContextType = {
    currentStep,
    steps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    completedSteps,
    markCompleted,
  };

  const content = typeof children === 'function' ? children(contextValue) : children;

  if (indicatorPosition === 'left') {
    return (
      <WizardContext.Provider value={contextValue}>
        <div className={`flex gap-8 ${className}`}>
          {/* Left Indicator */}
          {showStepIndicator && (
            <div className="w-64 flex-shrink-0">
              <VerticalStepIndicator
                steps={steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                allowClick={allowStepClick}
                onStepClick={goToStep}
              />
            </div>
          )}
          <div className="flex-1">{content}</div>
        </div>
      </WizardContext.Provider>
    );
  }

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={className}>
        {/* Top Indicator */}
        {showStepIndicator && (
          <HorizontalStepIndicator
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            allowClick={allowStepClick}
            onStepClick={goToStep}
          />
        )}
        <div className="mt-8">{content}</div>
      </div>
    </WizardContext.Provider>
  );
}

// Horizontal Step Indicator
interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  allowClick?: boolean;
  onStepClick?: (step: number) => void;
}

function HorizontalStepIndicator({
  steps,
  currentStep,
  completedSteps,
  allowClick,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800">
        <div
          className="h-full bg-purple-600 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = allowClick && (isCompleted || index <= currentStep);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center
                ${isClickable ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all
                  ${isCompleted 
                    ? 'bg-purple-600 text-white' 
                    : isCurrent 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-600/30' 
                      : 'bg-gray-800 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon || (
                  index + 1
                )}
              </div>

              {/* Step Title */}
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                {step.optional && (
                  <p className="text-xs text-gray-500">Optional</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Vertical Step Indicator
function VerticalStepIndicator({
  steps,
  currentStep,
  completedSteps,
  allowClick,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        const isClickable = allowClick && (isCompleted || index <= currentStep);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={`
                  absolute left-5 top-10 w-0.5 h-full -translate-x-1/2
                  ${completedSteps.includes(index) ? 'bg-purple-600' : 'bg-gray-800'}
                `}
              />
            )}

            {/* Step */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                flex items-start gap-4 pb-8 w-full text-left
                ${isClickable ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {/* Step Circle */}
              <div
                className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold flex-shrink-0 transition-all
                  ${isCompleted 
                    ? 'bg-purple-600 text-white' 
                    : isCurrent 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-600/30' 
                      : 'bg-gray-800 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon || (
                  index + 1
                )}
              </div>

              {/* Step Info */}
              <div>
                <p className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                  {step.optional && (
                    <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                  )}
                </p>
                {step.description && (
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * WizardStep - wrapper for step content
 */
interface WizardStepProps {
  stepIndex: number;
  children: ReactNode;
}

export function WizardStep({ stepIndex, children }: WizardStepProps) {
  const { currentStep } = useWizard();
  
  if (currentStep !== stepIndex) return null;
  
  return <>{children}</>;
}

/**
 * WizardNavigation - navigation buttons
 */
interface WizardNavigationProps {
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  showPrev?: boolean;
  nextDisabled?: boolean;
  onNext?: () => boolean | void;
  className?: string;
}

export function WizardNavigation({
  nextLabel = 'Continue',
  prevLabel = 'Back',
  finishLabel = 'Finish',
  showPrev = true,
  nextDisabled = false,
  onNext,
  className = '',
}: WizardNavigationProps) {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useWizard();

  const handleNext = () => {
    if (onNext) {
      const shouldProceed = onNext();
      if (shouldProceed === false) return;
    }
    nextStep();
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showPrev && !isFirstStep ? (
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {prevLabel}
          </span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={nextDisabled}
        className={`
          px-6 py-2.5 rounded-xl font-medium transition-all
          ${nextDisabled 
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
            : 'bg-purple-600 text-white hover:bg-purple-500'
          }
        `}
      >
        <span className="flex items-center gap-2">
          {isLastStep ? finishLabel : nextLabel}
          {!isLastStep && (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}

/**
 * MintWizard - pre-configured for NFT minting
 */
interface MintWizardProps {
  onComplete: (data: Record<string, unknown>) => void;
  className?: string;
}

export function MintWizard({ onComplete, className = '' }: MintWizardProps) {
  const mintSteps: Step[] = [
    { 
      id: 'upload', 
      title: 'Upload', 
      description: 'Upload your artwork',
      icon: <span>📤</span>
    },
    { 
      id: 'details', 
      title: 'Details', 
      description: 'Add name and description',
      icon: <span>📝</span>
    },
    { 
      id: 'properties', 
      title: 'Properties', 
      description: 'Add traits and attributes',
      icon: <span>🏷️</span>,
      optional: true
    },
    { 
      id: 'pricing', 
      title: 'Pricing', 
      description: 'Set your price',
      icon: <span>💰</span>
    },
    { 
      id: 'review', 
      title: 'Review', 
      description: 'Confirm and mint',
      icon: <span>✅</span>
    },
  ];

  return (
    <StepWizardComponent
      steps={mintSteps}
      onComplete={() => onComplete({})}
      indicatorPosition="left"
      allowStepClick
      className={className}
    >
      {({ currentStep }) => (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          {currentStep === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-xl font-bold text-white mb-2">Upload your artwork</h3>
              <p className="text-gray-400">Drag and drop or click to upload</p>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">NFT Details</h3>
              <p className="text-gray-400">Enter the name and description for your NFT</p>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Properties</h3>
              <p className="text-gray-400">Add traits and attributes (optional)</p>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Set Your Price</h3>
              <p className="text-gray-400">Choose how you want to sell your NFT</p>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Review & Mint</h3>
              <p className="text-gray-400">Confirm your NFT details and mint</p>
            </div>
          )}
          
          <WizardNavigation className="mt-8 pt-6 border-t border-gray-800" />
        </div>
      )}
    </StepWizardComponent>
  );
}

export default memo(StepWizardComponent);
