/**
 * React Native Polyfills for browser-like environments
 *
 * Specifically handles:
 * - Window event listener stubs required by libraries like @liveblocks/core devtools
 * - atob / btoa for JWT token decoding
 */

// 1. Ensure window is defined and attached to global
if (typeof window === 'undefined') {
  (global as any).window = global;
}

// 2. Polyfill window DOM EventTarget and messaging methods if missing
if (typeof window !== 'undefined') {
  const win = window as any;
  if (typeof win.addEventListener !== 'function') {
    win.addEventListener = () => {};
  }
  if (typeof win.removeEventListener !== 'function') {
    win.removeEventListener = () => {};
  }
  if (typeof win.dispatchEvent !== 'function') {
    win.dispatchEvent = () => false;
  }
  if (typeof win.postMessage !== 'function') {
    win.postMessage = () => {};
  }
}

// 3. Base64 atob / btoa implementation
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function decodeBase64(input: string): string {
  const str = String(input).replace(/[\t\n\f\r ]+/g, '');
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === '=') break;
    const index = CHARS.indexOf(char);
    if (index === -1) {
      continue;
    }
    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

export function encodeBase64(input: string): string {
  const str = String(input);
  let output = '';
  for (
    let block = 0, charCode: number, idx = 0, map = CHARS;
    str.charAt(idx | 0) || ((map = '='), idx % 1);
    output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
  ) {
    charCode = str.charCodeAt((idx += 3 / 4));
    if (charCode > 0xff) {
      throw new Error(
        "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
      );
    }
    block = (block << 8) | charCode;
  }
  return output;
}

if (typeof (global as any).atob !== 'function') {
  (global as any).atob = decodeBase64;
}
if (typeof (global as any).btoa !== 'function') {
  (global as any).btoa = encodeBase64;
}
if (typeof window !== 'undefined') {
  const win = window as any;
  if (typeof win.atob !== 'function') {
    win.atob = decodeBase64;
  }
  if (typeof win.btoa !== 'function') {
    win.btoa = encodeBase64;
  }
}
