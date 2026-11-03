import { useState } from "react";

export type ViewMode = "rows" | "cards";

const VIEW_KEY = "githappens:docs-view";

// storage can be missing or throw (private mode, blocked site data): fall back to rows
function load(): ViewMode {
	try {
		return localStorage.getItem(VIEW_KEY) === "cards" ? "cards" : "rows";
	} catch {
		return "rows";
	}
}

/** How the documents are laid out, remembered on this device. Rows by default. */
export function useViewMode() {
	const [view, setView] = useState<ViewMode>(load);

	const update = (next: ViewMode) => {
		setView(next);
		try {
			localStorage.setItem(VIEW_KEY, next);
		} catch {
			// nothing to do: the choice just won't survive a reload
		}
	};

	return [view, update] as const;
}
