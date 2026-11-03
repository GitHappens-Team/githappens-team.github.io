import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { ManifestFile } from "./use-manifest";
import { displayName } from "../team";

export type SearchContext = {
	/** the current search query, lowercased */
	query: string;
};

const searchCtx = createContext<[SearchContext, Dispatch<SetStateAction<SearchContext>>] | null>(null);

export const SearchProvider = searchCtx.Provider;
export function useSearch() {
	const [ctx, setCtx] = useContext(searchCtx) ?? [null, null];

	if (!ctx || !setCtx) {
		throw new Error("useSearch must be used within a SearchProvider");
	}

	return {
		query: ctx.query,
		setQuery: (newQuery: string) => {
			setCtx({ ...ctx, query: newQuery.toLowerCase() });
		},
	};
}

/**
 * Factory for a function that tests a document against a search query, returning true if the document matches the query.
 * @param query the query, probably from the search context
 * @returns a function that takes a ManifestFile and returns a boolean
 */
export function docMatchesQuery(query: string): (f: ManifestFile) => boolean {
	query = query.toLowerCase().trim(); // normalize the query to lowercase and trim whitespace
	return (doc) => {
		if (query === "") return true; // if the query is empty, match all documents

		return (
			doc.name.toLowerCase().includes(query) ||
			doc.metadata?.title?.toLowerCase().includes(query) ||
			doc.metadata?.description?.toLowerCase().includes(query) ||
			doc.metadata?.version?.version.toLowerCase().includes(query) ||
			doc.metadata?.approved?.by.some((a) => a.toLowerCase().includes(query) || displayName(a).toLowerCase().includes(query)) ||
			doc.metadata?.createdAt?.toLocaleDateString().toLowerCase().includes(query) ||
			doc.metadata?.approved?.approvedAt.toLocaleDateString().toLowerCase().includes(query) ||
			doc.metadata?.approved?.prNumber.toString().toLowerCase().includes(query) ||
			false
		);
	};
}
