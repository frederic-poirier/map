import { Show } from "solid-js";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import { useSearch } from "../../context/SearchContext";

export function SearchInput() {
  let inputRef;
  const {
    query,
    setQuery,
    handleKeyDown,
    reset,
    setIsSearchFocused,
  } = useSearch();

  const clearSearch = () => {
    console.log('caca')
    reset();
    inputRef?.focus();
  };

  const onKeyDown = (e) => {
    // Handle Escape specially to manage focus
    if (e.key === "Escape") {
      e.preventDefault();
      if (query()) {
        clearSearch();
      } else {
        inputRef?.blur();
        setIsSearchFocused(false);
      }
      return;
    }
    handleKeyDown(e);
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
        placeholder="Search places..."
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        onkeydown={onKeyDown}
        value={query()}
        onInput={(e) => {
          setQuery(e.target.value);
        }}
        class="w-full pl-9 pr-9 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg-tertiary)] transition-all placeholder:text-[var(--text-tertiary)]"
      />
      <Show when={query()}>
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
