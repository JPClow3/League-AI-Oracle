/**
 * Validation utilities for form inputs and data validation
 */

/**
 * Validate email format with comprehensive checks
 * @param email - Email address to validate
 * @returns boolean - true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
    // More robust email validation regex (RFC 5322 compliant)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    // Additional validation checks
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [local, domain] = parts;

    // Validate local part (before @)
    if (!local || local.length === 0 || local.length > 64) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false;
    if (local.includes('..')) return false; // No consecutive dots

    // Validate domain part (after @)
    if (!domain || domain.length === 0 || domain.length > 255) return false;
    if (!domain.includes('.')) return false; // Must have at least one dot
    if (domain.startsWith('.') || domain.startsWith('-')) return false;
    if (domain.endsWith('.') || domain.endsWith('-')) return false;

    // Validate TLD (top-level domain)
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) return false; // TLD must be at least 2 characters
    if (!/^[a-zA-Z]+$/.test(tld)) return false; // TLD must be only letters

    return true;
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate string length
 */
export const isValidLength = (
    str: string,
    min: number,
    max: number
): boolean => {
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
export const isInRange = (
    num: number,
    min: number,
    max: number
): boolean => {
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
    // Remove script tags and event handlers
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    clean = clean.replace(/javascript:/gi, '');
    return clean;
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

