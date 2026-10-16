const selector =
  'button, a[href], input, select, textarea, [tabindex], [contenteditable="true"]';
export interface ContainedFocus {
  id: string;
  name: string | null;
  label: string | null;
  tag: string;
  index: number;
  selection?: [number | null, number | null];
}
function controls(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) =>
      !element.matches(':disabled, input[type="hidden"]') &&
      !element.closest('[hidden], [inert]') &&
      element.tabIndex >= 0,
  );
}
export function captureContainedFocus(
  container: HTMLElement | null,
  focused?: Element | null,
): ContainedFocus | null {
  const active = focused ?? container?.ownerDocument.activeElement;
  if (
    !container ||
    !(active instanceof HTMLElement) ||
    !container.contains(active)
  )
    return null;
  return {
    id: active.id,
    name: active.getAttribute('name'),
    label: active.getAttribute('aria-label'),
    tag: active.tagName,
    index: controls(container).indexOf(active),
    selection:
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLInputElement
        ? [active.selectionStart, active.selectionEnd]
        : undefined,
  };
}
export function restoreContainedFocus(
  container: HTMLElement | null,
  previous: ContainedFocus,
): boolean {
  if (!container) return false;
  const elements = controls(container);
  const target =
    (previous.id && elements.find((element) => element.id === previous.id)) ||
    (previous.name &&
      elements.find(
        (element) =>
          element.tagName === previous.tag &&
          element.getAttribute('name') === previous.name,
      )) ||
    (previous.label &&
      elements.find(
        (element) =>
          element.tagName === previous.tag &&
          element.getAttribute('aria-label') === previous.label,
      )) ||
    elements[previous.index] ||
    elements[0];
  if (!target) return false;
  target.focus();
  if (
    previous.selection &&
    (target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement)
  ) {
    try {
      target.setSelectionRange(...previous.selection);
    } catch {
      /* Selection is unavailable on non-text input types. */
    }
  }
  return container.ownerDocument.activeElement === target;
}
