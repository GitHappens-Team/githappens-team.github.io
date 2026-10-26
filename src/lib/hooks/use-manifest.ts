import { useEffect, useState } from "react";

export type ManifestFile = {
	name: string;
	/** path relative to content/, e.g. "verbali/esterni/2026-10-20/2026-10-20.pdf" */
	path: string;
	/** sub-folders below the category, "" when the file sits directly in it */
	folder: string;
	size: number;
	modified: string;
	/** from the metadata.json next to the PDF, if there is one */
	metadata?: {
		title?: string;
		description?: string;
	};
};

export type Category = {
	/** top-level folder name inside content/ */
	id: string;
	files: ManifestFile[];
};

export type Manifest = {
	groups: Category[];
};

export type ManifestState =
	| { status: "loading"; manifest: null }
	| { status: "error"; manifest: null }
	| { status: "ready"; manifest: Manifest };

const CONTENT_URL = `${import.meta.env.BASE_URL}content/`;

/** URL of a PDF listed in the manifest. */
export const fileUrl = (file: ManifestFile) => CONTENT_URL + file.path;

export function useManifest(): ManifestState {
	const [state, setState] = useState<ManifestState>({ status: "loading", manifest: null });

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${CONTENT_URL}manifest.json`, { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
				return response.json() as Promise<Manifest>;
			})
			.then((manifest) => {
				if (!Array.isArray(manifest?.groups)) throw new Error("Malformed manifest");
				setState({ status: "ready", manifest });
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("Error fetching manifest:", error);
				setState({ status: "error", manifest: null });
			});

		return () => controller.abort();
	}, []);

	return state;
}
