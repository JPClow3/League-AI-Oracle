/**
 * Accessibility Utilities
 * WCAG 2.1 AA Compliance Helpers
 */

/**
 * Calculate color contrast ratio
 * WCAG requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {return 0;}

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  const num = parseInt(hex, 16);

  if (isNaN(num)) {return null;}

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const values = [rgb.r, rgb.g, rgb.b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  const [r = 0, g = 0, b = 0] = values;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastRequirement(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate accessible color palette
 */
export function generateAccessibleColor(
  baseColor: string,
  backgroundColor: string,
  targetRatio: number = 4.5
): string {
  let color = baseColor;
  let ratio = getContrastRatio(color, backgroundColor);
  let attempts = 0;
  const maxAttempts = 100;

  while (ratio < targetRatio && attempts < maxAttempts) {
    const rgb = hexToRgb(color);
    if (!rgb) {break;}

    // Adjust brightness
    const adjustment = ratio < targetRatio ? -10 : 10;
    const newRgb = {
      r: Math.max(0, Math.min(255, rgb.r + adjustment)),
      g: Math.max(0, Math.min(255, rgb.g + adjustment)),
      b: Math.max(0, Math.min(255, rgb.b + adjustment)),
    };

    color = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    ratio = getContrastRatio(color, backgroundColor);
    attempts++;
  }

  return color;
}

/**
 * Screen reader announcement
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') {return;}

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);

  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
}

/**
 * Get accessible name for element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {return ariaLabel;}

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) {return labelElement.textContent || '';}
  }

  // Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {return label.textContent || '';}
  }

  // Check text content
  if (element.textContent) {return element.textContent.trim();}

  // Check alt text for images
  if (element.tagName === 'IMG') {
    return element.getAttribute('alt') || '';
  }

  return '';
}

/**
 * Focus trap for modals
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {return;}

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check for motion preferences
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {return false;}
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check for high contrast mode
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') {return false;}
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(container: HTMLElement = document.body): {
  valid: boolean;
  issues: string[];
} {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues: string[] = [];

  if (headings.length === 0) {
    issues.push('No headings found on page');
    return { valid: false, issues };
  }

  // Check for h1
  const h1Count = headings.filter(h => h.tagName === 'H1').length;
  if (h1Count === 0) {
    issues.push('Page missing h1 heading');
  } else if (h1Count > 1) {
    issues.push(`Page has ${h1Count} h1 headings (should have 1)`);
  }

  // Check hierarchy
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));

    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push(`Heading ${index + 1} skips from h${previousLevel} to h${level}`);
    }

    previousLevel = level;
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Check for accessible form labels
 */
export function validateFormAccessibility(form: HTMLFormElement): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach((input, index) => {
    const accessibleName = getAccessibleName(input as HTMLElement);
    if (!accessibleName) {
      issues.push(`Input ${index + 1} (${input.getAttribute('type') || input.tagName}) missing label`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Audit page for accessibility issues
 */
export function auditAccessibility(container: HTMLElement = document.body): {
  passed: number;
  failed: number;
  issues: Array<{ rule: string; severity: 'error' | 'warning'; message: string }>;
} {
  const issues: Array<{ rule: string; severity: 'error' | 'warning'; message: string }> = [];
  let passed = 0;
  let failed = 0;

  // Check heading hierarchy
  const headingCheck = validateHeadingHierarchy(container);
  if (!headingCheck.valid) {
    failed++;
    headingCheck.issues.forEach(issue => {
      issues.push({ rule: 'heading-hierarchy', severity: 'error', message: issue });
    });
  } else {
    passed++;
  }

  // Check images for alt text
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    const alt = img.getAttribute('alt');
    const isDecorative = img.getAttribute('role') === 'presentation';

    if (alt === null && !isDecorative) {
      failed++;
      issues.push({
        rule: 'image-alt',
        severity: 'error',
        message: `Image ${index + 1} missing alt attribute`,
      });
    } else {
      passed++;
    }
  });

  // Check buttons for labels
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const label = getAccessibleName(button);
    if (!label) {
      failed++;
      issues.push({
        rule: 'button-label',
        severity: 'error',
        message: `Button ${index + 1} missing accessible label`,
      });
    } else {
      passed++;
    }
  });

  // Check for keyboard navigation
  const interactiveElements = container.querySelectorAll('a, button, input, textarea, select, [onclick]');
  interactiveElements.forEach((element, index) => {
    if (!isKeyboardAccessible(element as HTMLElement)) {
      failed++;
      issues.push({
        rule: 'keyboard-accessible',
        severity: 'error',
        message: `Interactive element ${index + 1} not keyboard accessible`,
      });
    } else {
      passed++;
    }
  });

  return { passed, failed, issues };
}

/**
 * Log accessibility audit results
 */
export function logAccessibilityAudit() {
  if (typeof window === 'undefined' || !import.meta.env.DEV) {return;}

  const results = auditAccessibility();

  console.group('♿ Accessibility Audit');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.issues.length > 0) {
    console.group('Issues:');
    results.issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`${icon} [${issue.rule}] ${issue.message}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}

