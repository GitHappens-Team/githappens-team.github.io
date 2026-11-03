import { createContext, useContext, useMemo } from "react";
import type { Manifest, ManifestFile } from "./use-manifest";

export type DocumentStatus = "new" | "updated";

/** document path -> version ("" when the document has none) */
type Snapshot = Record<string, string>;

// what this device saw on its latest visit, updated on every visit
const SEEN_KEY = "githappens:seen-documents";
// what it had seen before this visit, kept for the tab's lifetime so reloads keep the marks
const BASELINE_KEY = "githappens:seen-documents-baseline";

const versionOf = (file: ManifestFile) => file.metadata?.version?.version ?? "";

function snapshot(manifest: Manifest): Snapshot {
	return Object.fromEntries(manifest.groups.flatMap((g) => g.files.map((f) => [f.path, versionOf(f)])));
}

// storage can be missing or throw (private mode, blocked site data): treat it as empty
function read(storage: () => Storage, key: string): string | null {
	try {
		return storage().getItem(key);
	} catch {
		return null;
	}
}

function write(storage: () => Storage, key: string, value: string) {
	try {
		storage().setItem(key, value);
	} catch {
		// nothing to do: the marks just won't survive
	}
}

/**
 * The snapshot of the previous visit, or null on the device's first visit.
 * Records the current manifest as seen, so the next visit compares against it.
 */
function loadBaseline(manifest: Manifest): Snapshot | null {
	const current = JSON.stringify(snapshot(manifest));
	let baseline = read(() => sessionStorage, BASELINE_KEY);
	// Tabs opened before 0461d72 may still hold a pinned "null": drop it and rebuild the
	// baseline from the last snapshot this device saw.
	if (baseline === "null") baseline = null;
	if (baseline === null) {
		baseline = read(() => localStorage, SEEN_KEY);
		// On the device's first visit there is nothing to mark yet, but this tab's later
		// reloads must still compare against what it showed now. Pinning "null" here would
		// hide every new or updated document for the rest of the tab's lifetime.
		write(() => sessionStorage, BASELINE_KEY, baseline ?? current);
	}
	write(() => localStorage, SEEN_KEY, current);

	if (baseline === null) return null;
	try {
		return JSON.parse(baseline) as Snapshot | null;
	} catch {
		return null;
	}
}

/**
 * Documents added or with a different version since this device's previous visit.
 * Empty on the first visit, when there is nothing to compare against.
 */
export function useSeenDocuments(manifest: Manifest | null): Map<string, DocumentStatus> {
	return useMemo(() => {
		const statuses = new Map<string, DocumentStatus>();
		if (!manifest) return statuses;

		const baseline = loadBaseline(manifest);
		if (!baseline) return statuses;

		for (const file of manifest.groups.flatMap((g) => g.files)) {
			if (!(file.path in baseline)) statuses.set(file.path, "new");
			else if (baseline[file.path] !== versionOf(file)) statuses.set(file.path, "updated");
		}
		return statuses;
	}, [manifest]);
}

const seenCtx = createContext<Map<string, DocumentStatus>>(new Map());

export const SeenDocumentsProvider = seenCtx.Provider;

/** Whether the document is new or updated since the previous visit, if either. */
export const useDocumentStatus = (file: ManifestFile): DocumentStatus | undefined => useContext(seenCtx).get(file.path);
