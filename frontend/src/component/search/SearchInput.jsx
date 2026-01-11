import { Show } from "solid-js";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import { useSearch } from "../../context/SearchContext";

export function SearchInput(props) {
  let inputRef;
  const {
    query,
    setQuery,
    results,
    selectLocation,
    selectedIndex,
    setSelectedIndex,
    setIsSearchFocused,
  } = useSearch();

  const clearSearch = () => {
    setQuery("");
    inputRef?.focus();
  };

  const handleKeyDown = (e) => {
    const items = results() || [];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Tab":
        if (items.length > 0 && selectedIndex() === -1) {
          e.preventDefault();
          setSelectedIndex(0);
        } else if (selectedIndex() >= 0 && items[selectedIndex()]) {
          e.preventDefault();
          setQuery(items[selectedIndex()].properties.name);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex() >= 0 && items[selectedIndex()]) {
          selectLocation(items[selectedIndex()]);
        } else if (items.length > 0) {
          selectLocation(items[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        if (query()) {
          clearSearch();
        } else {
          inputRef?.blur();
          setIsSearchFocused(false);
        }
        break;
    }
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
        onkeydown={handleKeyDown}
        value={query()}
        onInput={(e) => {
          setQuery(e.target.value);
          setSelectedIndex(-1);
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
