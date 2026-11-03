import { useEffect, useState } from "react";

export type ManifestFile = {
	name: string;
	/** path relative to content/, e.g. "verbali/esterni/2026-10-20/2026-10-20.pdf" */
	path: string;
	/** sub-folders below the category, "" when the file sits directly in it */
	folder: string;
	size: number;
	modified: Date;
	/** from the metadata.json next to the PDF, if there is one */
	metadata?: ManifestFileMetadata;
};

export type ManifestFileMetadata = {
	title: string;
	description?: string;
	version?: {
		version: string;
		atTimestamp: Date;
	};
	createdAt?: Date;
};

export type Category = {
	/** top-level folder name inside content/ */
	id: string;
	files: ManifestFile[];
};

export type Manifest = {
	groups: Category[];
};

export type ManifestState = { status: "loading"; manifest: null } | { status: "error"; manifest: null } | { status: "ready"; manifest: Manifest };

/** Same shape as the manifest on disk: every Date is still an ISO string. */
type Raw<T> = T extends Date ? string : T extends object ? { [K in keyof T]: Raw<T[K]> } : T;
type RawManifest = Raw<Manifest>;

const parseMetadata = (raw: RawManifest["groups"][number]["files"][number]["metadata"]): ManifestFileMetadata | undefined =>
	raw && {
		...raw,
		version: raw.version && { ...raw.version, atTimestamp: new Date(raw.version.atTimestamp) },
		createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
	};

function parseManifest(raw: RawManifest): Manifest {
	return {
		groups: raw.groups.map((group) => ({
			...group,
			files: group.files.map((file) => {
				return {
					...file,
					modified: new Date(file.modified),
					metadata: parseMetadata(file.metadata),
				};
			}),
		})),
	};
}

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
				return response.json() as Promise<RawManifest>;
			})
			.then((raw) => {
				if (!Array.isArray(raw?.groups)) throw new Error("Malformed manifest");
				setState({ status: "ready", manifest: parseManifest(raw) });
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
