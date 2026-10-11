const navigationKeys = new Set([
  'Tab',
  'Enter',
  ' ',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

/**
 * Marks the root element with how the page was last used, `data-input`
 * "pointer" or "keyboard". Browsers treat focus that moves after any typing
 * as keyboard focus, so a slot that gets focus back after a search was typed
 * and a result tapped would show the keyboard highlight. The slot styles use
 * this to tell the two apart. Typing letters doesn't change it.
 */
export function trackInputModality(root = document.documentElement) {
  addEventListener(
    'pointerdown',
    () => {
      root.dataset.input = 'pointer';
    },
    true,
  );
  addEventListener(
    'keydown',
    (event) => {
      if (navigationKeys.has(event.key)) root.dataset.input = 'keyboard';
    },
    true,
  );
}
