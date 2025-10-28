/**
 * Validation utilities for form inputs and data validation
 *
 * SECURITY NOTE: For production HTML sanitization, consider using DOMPurify library
 * Install: npm install dompurify @types/dompurify
 * Usage: import DOMPurify from 'dompurify'; const clean = DOMPurify.sanitize(dirty);
 */

/**
 * Validate email format with comprehensive checks
 * @param email - Email address to validate
 * @returns boolean - true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  // More robust email validation regex (RFC 5322 compliant)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional validation checks
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;

  // Validate local part (before @)
  if (!local || local.length === 0 || local.length > 64) {
    return false;
  }
  if (local.startsWith('.') || local.endsWith('.')) {
    return false;
  }
  if (local.includes('..')) {
    return false;
  } // No consecutive dots

  // Validate domain part (after @)
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }
  if (!domain.includes('.')) {
    return false;
  } // Must have at least one dot
  if (domain.startsWith('.') || domain.startsWith('-')) {
    return false;
  }
  if (domain.endsWith('.') || domain.endsWith('-')) {
    return false;
  }

  // Validate TLD (top-level domain)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return false;
  } // TLD must be at least 2 characters
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return false;
  } // TLD must be only letters

  return true;
};

/**
 * Validate URL format with protocol security check
 * @param url - URL string to validate
 * @param allowedProtocols - Optional array of allowed protocols (default: ['http:', 'https:'])
 */
export const isValidURL = (url: string, allowedProtocols: string[] = ['http:', 'https:']): boolean => {
  try {
    const parsed = new URL(url);
    // Check if protocol is in the allowed list
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Check if URL is safe (no javascript:, data:, or other dangerous protocols)
 * @param url - URL string to check
 */
export const isSafeURL = (url: string): boolean => {
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'];
  return isValidURL(url, safeProtocols);
};

/**
 * Validate string length
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate required field
 */
export const isRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Validate number range
 */
export const isInRange = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max;
};

/**
 * Encode text to HTML entities to prevent XSS
 * Note: This ENCODES plain text, it does NOT sanitize HTML
 * Use this when you want to display user text safely
 */
export const encodeHTML = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Basic HTML sanitization (removes all HTML tags)
 * For more advanced sanitization, use a library like DOMPurify
 * @param html - HTML string to sanitize
 * @returns Plain text with all HTML removed
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Sanitize HTML but allow safe tags (basic implementation)
 * WARNING: This is a basic implementation. For production, use DOMPurify
 * @param html - HTML string
 * @returns HTML with only safe tags
 */
export const sanitizeHTMLBasic = (html: string): string => {
  // Use DOM-based sanitization which is more secure than regex
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove all script tags
  const scripts = div.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove all elements with event handlers
  const allElements = div.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all event handler attributes (onclick, onerror, etc.)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove javascript: protocol from href and src
    ['href', 'src', 'action', 'formaction'].forEach(attr => {
      const value = el.getAttribute(attr);
      if (value) {
        // Use URL parsing to properly validate the protocol
        try {
          const url = new URL(value, window.location.href);
          // Only allow safe protocols
          if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
            el.removeAttribute(attr);
          }
        } catch {
          // If it's not a valid URL, check if it starts with javascript:
          if (value.toLowerCase().trim().startsWith('javascript:')) {
            el.removeAttribute(attr);
          }
        }
      }
    });
  });

  return div.innerHTML;
};

/**
 * Validate champion name (letters, spaces, apostrophes)
 */
export const isValidChampionName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z' ]+$/;
  return nameRegex.test(name) && isValidLength(name, 2, 30);
};

/**
 * Validate tag format
 */
export const isValidTag = (tag: string): boolean => {
  return isValidLength(tag, 1, 20) && !/[<>{}]/.test(tag);
};

/**
 * Validate draft name
 */
export const isValidDraftName = (name: string): boolean => {
  return isValidLength(name, 1, 50);
};

/**
 * Validate lesson topic
 */
export const isValidLessonTopic = (topic: string): boolean => {
  return isValidLength(topic, 3, 100);
};

/**
 * Validation error messages
 */
export const validationErrors = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  range: (min: number, max: number) => `Must be between ${min} and ${max}`,
  championName: 'Champion name must contain only letters, spaces, and apostrophes',
  tag: 'Tag must not contain special characters',
  draftName: 'Draft name must be between 1 and 50 characters',
  lessonTopic: 'Topic must be between 3 and 100 characters',
};
