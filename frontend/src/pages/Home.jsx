import { SearchInput } from "~/component/search/SearchInput";
import SearchResults from "../component/search/SearchResults";
import { SearchProvider } from "~/component/search/SearchProvider";

export default function Home() {
  return (
    <>
      <SearchProvider>
        <SearchInput />
        <SearchResults />
      </SearchProvider>

    </>
  );
}
