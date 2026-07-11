'use client';

import React from 'react';
import { Step } from '@/types';

const STEPS: { label: string; subtitle: string }[] = [
  { label: 'Upload',   subtitle: 'Choose CSV' },
  { label: 'Preview',  subtitle: 'Review data' },
  { label: 'Confirm',  subtitle: 'Start AI import' },
  { label: 'Results',  subtitle: 'View CRM records' },
];

export default function StepIndicator({ current }: { current: Step }) {
  return (
    <nav className="steps-wrapper" aria-label="Import steps">
      {STEPS.map((step, idx) => {
        const num = (idx + 1) as Step;
        const isDone = num < current;
        const isActive = num === current;
        return (
          <React.Fragment key={num}>
            <div className="step-item">
              <div
                className={`step-circle${isActive ? ' active' : isDone ? ' done' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? '✓' : num}
              </div>
              <span className={`step-label${isActive ? ' active' : isDone ? ' done' : ''}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`step-connector${isDone ? ' done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
