import { SearchInput } from "../search/SearchBox";

export function MobileSearchHeader(props) {
  return (
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <SearchInput
          onFocus={props.onFocus}
          query={props.query}
          setQuery={props.setQuery}
          isSearchFocused={props.isSearchFocused}
          setIsSearchFocused={props.setIsSearchFocused}
        />
      </div>
      <LocateMeButton />
    </div>
  );
}
