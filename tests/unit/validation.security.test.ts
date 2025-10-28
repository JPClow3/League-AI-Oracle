/**
 * Security tests for validation utilities
 * These tests verify that the security fixes properly handle XSS and injection attacks
 */

import { describe, it, expect } from 'vitest';
import { sanitizeHTMLBasic, isValidURL, isSafeURL } from '../../lib/validation';

describe('Security - HTML Sanitization', () => {
  it('should remove script tags', () => {
    const malicious = '<div>Hello<script>alert("XSS")</script>World</div>';
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('should remove inline event handlers', () => {
    const malicious = '<img src="x" onerror="alert(\'XSS\')">';
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('should remove onclick attributes', () => {
    const malicious = '<button onclick="alert(\'XSS\')">Click me</button>';
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  it('should remove javascript: protocol from href', () => {
    const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('javascript:');
  });

  it('should handle multiple XSS attempts', () => {
    const malicious = `
      <div>
        <script>alert(1)</script>
        <img src=x onerror=alert(2)>
        <a href="javascript:alert(3)">Click</a>
        <div onclick="alert(4)">Click</div>
      </div>
    `;
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('alert');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onclick');
  });

  it('should handle case variations of javascript protocol', () => {
    const variations = [
      '<a href="javascript:alert(1)">Test</a>',
      '<a href="JavaScript:alert(1)">Test</a>',
      '<a href="JAVASCRIPT:alert(1)">Test</a>',
      '<a href="  javascript:alert(1)">Test</a>',
    ];

    variations.forEach(malicious => {
      const result = sanitizeHTMLBasic(malicious);
      expect(result).not.toContain('alert');
    });
  });
});

describe('Security - URL Validation', () => {
  it('should accept valid http URLs', () => {
    expect(isValidURL('http://example.com')).toBe(true);
    expect(isValidURL('https://example.com')).toBe(true);
  });

  it('should reject javascript: URLs by default', () => {
    expect(isValidURL('javascript:alert("XSS")')).toBe(false);
  });

  it('should reject data: URLs by default', () => {
    expect(isValidURL('data:text/html,<script>alert("XSS")</script>')).toBe(false);
  });

  it('should reject vbscript: URLs', () => {
    expect(isValidURL('vbscript:msgbox("XSS")')).toBe(false);
  });

  it('should accept custom allowed protocols', () => {
    expect(isValidURL('ftp://files.example.com', ['ftp:'])).toBe(true);
    expect(isValidURL('mailto:test@example.com', ['mailto:'])).toBe(true);
  });

  it('should use isSafeURL for common safe protocols', () => {
    expect(isSafeURL('http://example.com')).toBe(true);
    expect(isSafeURL('https://example.com')).toBe(true);
    expect(isSafeURL('mailto:test@example.com')).toBe(true);
    expect(isSafeURL('tel:+1234567890')).toBe(true);
    expect(isSafeURL('ftp://files.example.com')).toBe(true);
  });

  it('should reject dangerous protocols with isSafeURL', () => {
    expect(isSafeURL('javascript:alert("XSS")')).toBe(false);
    expect(isSafeURL('data:text/html,<script>alert("XSS")</script>')).toBe(false);
    expect(isSafeURL('vbscript:msgbox("XSS")')).toBe(false);
  });
});

describe('Security - Edge Cases', () => {
  it('should handle encoded javascript: protocol', () => {
    // Note: URL constructor automatically decodes
    const malicious = '<a href="javascript&#58;alert(1)">Test</a>';
    const result = sanitizeHTMLBasic(malicious);
    // After parsing, the browser will decode &#58; to :
    // Our DOM-based approach should catch this
    expect(result).not.toContain('alert');
  });

  it('should handle nested event handlers', () => {
    const malicious = '<div><div><img src=x onerror=alert(1)></div></div>';
    const result = sanitizeHTMLBasic(malicious);
    expect(result).not.toContain('onerror');
  });

  it('should preserve safe content', () => {
    const safe = '<div class="container"><p>Hello <strong>World</strong></p></div>';
    const result = sanitizeHTMLBasic(safe);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).toContain('strong');
  });
});
