import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const siteDirectory = resolve(testDirectory, '..');
const htmlPath = resolve(siteDirectory, 'index.html');
const cssPath = resolve(siteDirectory, 'styles.css');

function readRequired(path) {
  assert.ok(existsSync(path), `required file is missing: ${path}`);
  return readFileSync(path, 'utf8');
}

test('publishes the approved page structure and copy', () => {
  const html = readRequired(htmlPath);

  assert.match(html, /<header\b/i);
  assert.match(html, /<main\b/i);
  assert.match(html, /<footer\b/i);
  assert.match(html, /Shared bills,\s*<br[^>]*>\s*made simple\./i);
  assert.match(html, /One place for the people and plans you share\./i);
  assert.match(html, /Create a Circle/i);
  assert.match(html, /Add a Bill or Card/i);
  assert.match(html, /Invite people and agree/i);
  assert.match(html, /BUILT TO LAST/i);
  assert.match(html, /© 2026 Potluck\. All rights reserved\./i);
});

test('contains no registration, tracking, or executable surface', () => {
  const html = readRequired(htmlPath);

  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /<input\b/i);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /waitlist|email address|unsubscribe|analytics|pixel/i);
});

test('uses only local production assets and every referenced file exists', () => {
  const html = readRequired(htmlPath);
  const css = readRequired(cssPath);
  const combined = `${html}\n${css}`;

  assert.doesNotMatch(combined, /https?:\/\//i);

  const references = [
    ...html.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi),
    ...css.matchAll(/url\(["']?([^"')]+)["']?\)/gi),
  ].map((match) => match[1]);

  for (const reference of references) {
    assert.ok(
      existsSync(resolve(siteDirectory, reference)),
      `referenced asset does not exist: ${reference}`,
    );
  }
});

test('self-hosts the approved fonts and includes responsive breakpoints', () => {
  const css = readRequired(cssPath);

  assert.match(css, /@font-face[\s\S]*font-family:\s*["']Manrope["']/i);
  assert.match(css, /@font-face[\s\S]*font-family:\s*["']Epilogue["']/i);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/i);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/i);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/i);
});

test('provides basic document metadata and image alternatives', () => {
  const html = readRequired(htmlPath);

  assert.match(html, /<html\s+lang=["']en["']/i);
  assert.match(html, /<meta\s+name=["']viewport["']/i);
  assert.match(html, /<meta\s+name=["']description["']/i);
  assert.match(html, /<title>Potluck — Shared bills, made simple\.<\/title>/i);

  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  assert.ok(images.length > 0, 'expected the page to contain exported Figma artwork');
  for (const image of images) {
    assert.match(image, /\balt=["'][^"']*["']/i, `image is missing alt text: ${image}`);
  }
});
