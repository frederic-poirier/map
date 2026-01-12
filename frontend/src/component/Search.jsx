import { For } from "solid-js";

export function SearchInput() {
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search places..."
      class={props.class}
      onFocus={() => setIsSearchFocused(true)}
      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
      onkeydown={onKeyDown}
      value={query()}
      onInput={(e) => {
        setQuery(e.target.value);
      }}
    />
  );
}

export function SearchResults() {
  return (
    <ul class={props.class}>
      <For each={props.items}>
        {(item, index) => (
          <li
            class={props.selectedIndex === index() ? props.selectedClass : ""}
            onClick={() => props.onSelect?.(item)}
          >
            {props.renderItem(item, index)}
          </li>
        )}
      </For>
    </ul>
  );
}
