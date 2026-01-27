'use client';

/**
 * Stepper Component
 * Multi-step wizard progress indicator
 * @module components/Stepper
 * @version 1.0.0
 */

import React, { useState, useCallback, createContext, useContext } from 'react';

// Types
interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'dots' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  allowNavigation?: boolean;
  className?: string;
}

// Icons
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Size configurations
const sizeConfig = {
  sm: {
    circle: 'w-6 h-6 text-xs',
    connector: 'h-0.5',
    verticalConnector: 'w-0.5 h-8',
    label: 'text-sm',
    description: 'text-xs',
  },
  md: {
    circle: 'w-8 h-8 text-sm',
    connector: 'h-0.5',
    verticalConnector: 'w-0.5 h-12',
    label: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    circle: 'w-10 h-10 text-base',
    connector: 'h-1',
    verticalConnector: 'w-1 h-16',
    label: 'text-base',
    description: 'text-sm',
  },
};

/**
 * Main Stepper Component
 */
export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  showLabels = true,
  allowNavigation = false,
  className = '',
}: StepperProps) {
  const config = sizeConfig[size];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (index: number) => {
    if (allowNavigation && onStepClick && index <= currentStep) {
      onStepClick(index);
    }
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!allowNavigation || index > currentStep}
              className={`
                rounded-full transition-all duration-300
                ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}
                ${status === 'completed' ? 'bg-green-500' : ''}
                ${status === 'current' ? 'bg-purple-500 scale-125' : ''}
                ${status === 'upcoming' ? 'bg-zinc-600' : ''}
                ${allowNavigation && index <= currentStep ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
              `}
              title={step.label}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'progress') {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <span className={`text-white ${config.label}`}>
            {steps[currentStep]?.label}
          </span>
          <span className="text-zinc-400 text-sm">
            {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // Default variant
  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!allowNavigation || index > currentStep}
                  className={`
                    ${config.circle} rounded-full flex items-center justify-center
                    font-medium transition-all duration-300
                    ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                    ${status === 'current' ? 'bg-purple-500 text-white ring-4 ring-purple-500/20' : ''}
                    ${status === 'upcoming' ? 'bg-zinc-700 text-zinc-400' : ''}
                    ${allowNavigation && index <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  `}
                >
                  {status === 'completed' ? (
                    <CheckIcon />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Connector */}
                {!isLast && (
                  <div
                    className={`
                      ${config.verticalConnector} my-1
                      ${index < currentStep ? 'bg-green-500' : 'bg-zinc-700'}
                    `}
                  />
                )}
              </div>

              {/* Labels */}
              {showLabels && (
                <div className="ml-4 pb-8">
                  <p
                    className={`
                      ${config.label} font-medium
                      ${status === 'current' ? 'text-white' : 'text-zinc-400'}
                    `}
                  >
                    {step.label}
                    {step.optional && (
                      <span className="ml-2 text-zinc-500 text-xs">(Optional)</span>
                    )}
                  </p>
                  {step.description && (
                    <p className={`${config.description} text-zinc-500 mt-1`}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal default
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              {/* Step indicator */}
              <button
                onClick={() => handleStepClick(index)}
                disabled={!allowNavigation || index > currentStep}
                className={`
                  ${config.circle} rounded-full flex items-center justify-center
                  font-medium transition-all duration-300
                  ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${status === 'current' ? 'bg-purple-500 text-white ring-4 ring-purple-500/20' : ''}
                  ${status === 'upcoming' ? 'bg-zinc-700 text-zinc-400' : ''}
                  ${allowNavigation && index <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                `}
              >
                {status === 'completed' ? (
                  <CheckIcon />
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </button>

              {/* Label */}
              {showLabels && (
                <div className="mt-2 text-center">
                  <p
                    className={`
                      ${config.label} font-medium
                      ${status === 'current' ? 'text-white' : 'text-zinc-400'}
                    `}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className={`${config.description} text-zinc-500 mt-0.5`}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={`
                  flex-1 ${config.connector} mx-4
                  ${index < currentStep ? 'bg-green-500' : 'bg-zinc-700'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Stepper Context for controlled components
interface StepperContextType {
  currentStep: number;
  steps: Step[];
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const StepperContext = createContext<StepperContextType | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepperContext must be used within StepperProvider');
  }
  return context;
}

interface StepperProviderProps {
  steps: Step[];
  initialStep?: number;
  children: React.ReactNode;
}

export function StepperProvider({
  steps,
  initialStep = 0,
  children,
}: StepperProviderProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const value: StepperContextType = {
    currentStep,
    steps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };

  return (
    <StepperContext.Provider value={value}>
      {children}
    </StepperContext.Provider>
  );
}

/**
 * Step Content Component
 */
interface StepContentProps {
  step: number;
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ step, children, className = '' }: StepContentProps) {
  const { currentStep } = useStepperContext();

  if (step !== currentStep) return null;

  return (
    <div className={`animate-fadeIn ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stepper Navigation Component
 */
interface StepperNavigationProps {
  onComplete?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  className?: string;
}

export function StepperNavigation({
  onComplete,
  nextLabel = 'Next',
  prevLabel = 'Back',
  completeLabel = 'Complete',
  className = '',
}: StepperNavigationProps) {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useStepperContext();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={prevStep}
        disabled={isFirstStep}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${isFirstStep
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : 'bg-zinc-700 text-white hover:bg-zinc-600'
          }
        `}
      >
        {prevLabel}
      </button>

      {isLastStep ? (
        <button
          onClick={onComplete}
          className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        >
          {completeLabel}
        </button>
      ) : (
        <button
          onClick={nextStep}
          className="px-6 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Mint Stepper - Specific for NFT minting flow
 */
interface MintStepperProps {
  currentStep: 'upload' | 'details' | 'pricing' | 'review' | 'mint';
  className?: string;
}

const mintSteps: Step[] = [
  { id: 'upload', label: 'Upload', description: 'Add your artwork' },
  { id: 'details', label: 'Details', description: 'Name & description' },
  { id: 'pricing', label: 'Pricing', description: 'Set your price' },
  { id: 'review', label: 'Review', description: 'Check everything' },
  { id: 'mint', label: 'Mint', description: 'Create NFT' },
];

export function MintStepper({ currentStep, className = '' }: MintStepperProps) {
  const stepIndex = mintSteps.findIndex((s) => s.id === currentStep);

  return (
    <Stepper
      steps={mintSteps}
      currentStep={stepIndex}
      size="md"
      showLabels={true}
      className={className}
    />
  );
}

export default Stepper;
