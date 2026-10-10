import { useState } from 'react';
import { Button, useToast } from '@spicegarden/ui';
import Head from 'next/head';
import styles from './index.module.css';

const STEPS = [
  { id: 1, title: 'Business Info', href: '/onboarding/business' },
  { id: 2, title: 'Documents', href: '/onboarding/documents' },
  { id: 3, title: 'GST Config', href: '/onboarding/gst' },
  { id: 4, title: 'Menu Setup', href: '/onboarding/menu' },
  { id: 5, title: 'Pricing', href: '/onboarding/pricing' },
  { id: 6, title: 'Payout', href: '/onboarding/payout' },
];

export default function OnboardingIndex() {
  const [currentStep, setCurrentStep] = useState(1);
  const toast = useToast();

  return (
    <div className={styles.page}>
      <Head><title>Restaurant Onboarding - SpiceGarden</title></Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Restaurant Onboarding</h1>
        <p className={styles.description}>Complete all steps to get your restaurant live on SpiceGarden</p>

        <div className={styles.stepper}>
          {STEPS.map((step, idx) => {
            const isActive = step.id <= currentStep;
            return (
              <div key={step.id} className={styles.step}>
                <div className={styles.stepContent}>
                  <div className={`${styles.stepDot} ${isActive ? styles.stepDotActive : styles.stepDotInactive}`}>
                    {step.id}
                  </div>
                  <span className={`${styles.stepTitle} ${isActive ? styles.stepTitleActive : styles.stepTitleInactive}`}>{step.title}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${step.id < currentStep ? styles.stepLineActive : styles.stepLineInactive}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </h2>
          <p className={styles.cardText}>
            Complete this step to continue with your onboarding.
          </p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep < 6) {
                  setCurrentStep((s) => s + 1);
                  window.location.href = STEPS[currentStep].href;
                } else {
                  toast.showToast({ message: 'Onboarding complete! Your restaurant will be reviewed shortly.', type: 'success', duration: 0 });
                }
              }}
            >
              {currentStep === 6 ? 'Submit for Review' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
