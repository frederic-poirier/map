import { Show } from "solid-js";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";

/**
 * SearchInput - Headless search input component
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {(value: string) => void} props.onChange - Called when input changes
 * @param {(e: KeyboardEvent) => void} props.onKeyDown - Keyboard handler (from useListNavigation)
 * @param {() => void} props.onFocus - Called when input gains focus
 * @param {() => void} props.onBlur - Called when input loses focus
 * @param {() => void} props.onReset - Called to reset search
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.class - Additional CSS classes
 */
export default function SearchInput(props) {
  let inputRef;

  const clearSearch = () => {
    props.onReset?.();
    inputRef?.focus();
  };

  const handleKeyDown = (e) => {
    // Handle Escape specially to manage focus
    if (e.key === "Escape") {
      e.preventDefault();
      if (props.value) {
        clearSearch();
      } else {
        inputRef?.blur();
        props.onBlur?.();
      }
      return;
    }
    props.onKeyDown?.(e);
  };

  return (
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          size={16}
          strokeWidth={1.5}
          class="text-[var(--text-tertiary)]"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={props.placeholder || "Search places..."}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onkeydown={handleKeyDown}
        value={props.value}
        onInput={(e) => props.onChange?.(e.target.value)}
        class={
          props.class ||
          "w-full pl-9 pr-9 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
        }
      />
      <Show when={props.value}>
        <button
          onClick={clearSearch}
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </Show>
    </div>
  );
}
