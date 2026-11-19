import type { FormEvent, KeyboardEvent } from "react";

/** Enter keeps its native meaning in these; everywhere else it is stopped before a native submit fires. */
const NATIVE_ENTER_TAGS = new Set(["TEXTAREA", "SELECT", "BUTTON", "A"]);

interface FormKeyboardHandlers {
  handleKeyDown: (event: KeyboardEvent<HTMLFormElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * The optimizer's capture listener fires on any native submit, so Enter is stopped at keydown and
 * routed to the validate-first click handler. onSubmit is only a backstop.
 */
export function formKeyboardHandlers(handleClick: () => void): FormKeyboardHandlers {
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (NATIVE_ENTER_TAGS.has((event.target as HTMLElement).tagName)) return;
    event.preventDefault();
    handleClick();
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleClick();
  };
  return { handleKeyDown, handleSubmit };
}
