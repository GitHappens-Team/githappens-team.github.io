import { useManifest, type Category, type ManifestFile } from "@/lib/hooks/use-manifest";
import { Badge } from "../ui/badge";
import { DocumentCard, DocumentRow } from "./document-card";
import { Button } from "../ui/button";
import { cn, humanize } from "@/lib/utils";
import { useMemo } from "react";
import { docMatchesQuery, useSearch } from "@/lib/hooks/search";
import { SearchBar } from "./search-bar";
import { useWrapped } from "@/lib/hooks/use-wrapped";
import { SeenDocumentsProvider, useSeenDocuments } from "@/lib/hooks/use-seen-documents";
import { useViewMode, type ViewMode } from "@/lib/hooks/use-view-mode";
import { LayoutGridIcon, ListIcon } from "lucide-react";

/** DOM id of a category section, used by the chips to jump to it. */
const categoryAnchor = (id: string) =>
	`cat-${id
		.trim()
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, "-")}`;

const viewOptions = [
	{ mode: "rows", label: "Vista a righe", Icon: ListIcon },
	{ mode: "cards", label: "Vista a schede", Icon: LayoutGridIcon },
] as const;

// segmented control: two joined chips, the selected one inverted to ink
function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
	return (
		<div role="group" aria-label="Visualizzazione" className="flex shrink-0">
			{viewOptions.map(({ mode, label, Icon }) => (
				<Button
					key={mode}
					type="button"
					variant="chip"
					size="icon"
					aria-label={label}
					title={label}
					aria-pressed={view === mode}
					onClick={() => onChange(mode)}
					className="first:rounded-r-none last:-ml-0.5 last:rounded-l-none aria-pressed:bg-ink aria-pressed:text-paper"
				>
					<Icon />
				</Button>
			))}
		</div>
	);
}

type ViewProps = { view: ViewMode; onViewChange: (view: ViewMode) => void };

function CategoryAnchors({ groups, view, onViewChange }: { groups: Category[] } & ViewProps) {
	// spread apart while search and chips share a row, centered once they stack
	const [ref, wrapped] = useWrapped<HTMLElement>();

	return (
		<nav
			ref={ref}
			aria-label="Categorie"
			className={cn(
				"flex flex-wrap items-center gap-x-8 gap-y-2 bg-muted p-4 border-b-2 border-ink",
				wrapped ? "justify-center" : "justify-between",
			)}
		>
			<div className="flex max-w-full items-center gap-2">
				<SearchBar className="w-100 max-w-full min-w-0" />
				<ViewToggle view={view} onChange={onViewChange} />
			</div>
			<div className={cn("flex flex-wrap items-center gap-2 p-4", wrapped && "justify-center")}>
				<span className="font-pixel text-2xl p-2">categorie</span>
				{groups.map((g) => (
					<Button key={g.id} asChild variant="chip">
						<a href={`#${categoryAnchor(g.id)}`}>
							<span>{humanize(g.id)}</span>
							<span className="text-sm font-light">{g.files.length} documenti</span>
						</a>
					</Button>
				))}
			</div>
		</nav>
	);
}

type SubCategory = { id: string; files: ManifestFile[] };

/**
 * Splits a category's files by sub-category: the file's folder minus its last
 * segment (each document sits in its own folder). Loose files come first.
 */
function groupBySubCategory(files: ManifestFile[]): SubCategory[] {
	const groups = new Map<string, ManifestFile[]>();
	for (const file of files) {
		const id = file.folder.split("/").slice(0, -1).join("/");
		groups.set(id, [...(groups.get(id) ?? []), file]);
	}
	return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, files]) => ({ id, files }));
}

/**
 *
 * @param a ManifestFile a
 * @param b ManifestFile b
 * @returns one of [-1,1,0] respectively if a goes before b, b goes before a, they're equal (locale name compare fallback)
 */
function compFilesDesc(a: ManifestFile, b: ManifestFile): number {
	if (!a.metadata?.createdAt && !b.metadata?.createdAt) return a.name.localeCompare(b.name);

	if (a.metadata?.createdAt && b.metadata?.createdAt) {
		return a.metadata.createdAt > b.metadata.createdAt ? -1 : 1;
	} else if (a.metadata?.createdAt) {
		return -1;
	} else {
		return 1;
	}
}

const DocumentGrid = ({ files, view }: { files: ManifestFile[]; view: ViewMode }) => {
	const sorted = useMemo(() => [...files].sort(compFilesDesc), [files]);

	if (view === "rows") {
		// one outlined box ruled into rows; on wide screens the rows share its columns
		// (icon, title, badges, date) through subgrid
		return (
			<div className="flex flex-col border-2 border-ink shadow-offset lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
				{sorted.map((file) => (
					<DocumentRow key={file.path} file={file} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] gap-6">
			{sorted.map((file) => (
				<DocumentCard key={file.path} file={file} />
			))}
		</div>
	);
};

/**
 * Narrows every category to the documents matching the query. While searching,
 * categories left empty are dropped so only the ones with results show up.
 */
function filterGroups(groups: Category[], query: string): Category[] {
	if (!query.trim()) return groups;
	const matches = docMatchesQuery(query);
	return groups.map((g) => ({ ...g, files: g.files.filter(matches) })).filter((g) => g.files.length);
}

function DocumentSubCategory({ category, sub, view }: { category: Category; sub: SubCategory; view: ViewMode }) {
	return (
		<div id={categoryAnchor(`${category.id}/${sub.id}`)} className="flex scroll-mt-4 flex-col gap-4 m-4">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 pb-2">
				<div className="flex flex-col">
					<h4 className="font-bold text-2xl">{sub.id.split("/").map(humanize).join(" / ")}</h4>
				</div>
				<span className="text-sm font-light">{sub.files.length} documenti</span>
			</div>
			<DocumentGrid files={sub.files} view={view} />
		</div>
	);
}

function DocumentCategory({ category, view }: { category: Category; view: ViewMode }) {
	const subs = groupBySubCategory(category.files);

	return (
		<div id={categoryAnchor(category.id)} className="flex scroll-mt-4 flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
				<div className="flex flex-col">
					<span className="text-ink-muted font-pixel text-2xl">pdf/{category.id.replaceAll(" ", "_")}/</span>
					<h3 className="font-bold text-3xl">{humanize(category.id)}</h3>
				</div>
				<Badge>{category.files.length} documenti</Badge>
			</div>
			{subs.length ? (
				subs.map((sub) =>
					sub.id ? (
						<DocumentSubCategory key={sub.id} category={category} sub={sub} view={view} />
					) : (
						<DocumentGrid key="loose" files={sub.files} view={view} />
					),
				)
			) : (
				<span className="text-ink-muted text-center">Nessun documento qui per ora</span>
			)}
		</div>
	);
}

function Message({ children, role }: { children: React.ReactNode; role?: "alert" | "status" }) {
	return (
		<p role={role} className="p-4 py-16 text-center text-xl text-ink-muted">
			{children}
		</p>
	);
}

export default function Docs() {
	const { status, manifest } = useManifest();
	const { query } = useSearch();
	const groups = useMemo(() => (manifest ? filterGroups(manifest.groups, query) : []), [manifest, query]);
	const seen = useSeenDocuments(manifest);
	const [view, setView] = useViewMode();

	return (
		<SeenDocumentsProvider value={seen}>
			<section className="flex flex-col gap-4 mb-10" id="docs">
				{status === "loading" && <Message role="status">Carico i documenti…</Message>}
				{status === "error" && <Message role="alert">Non riesco a caricare i documenti. Riprova tra poco.</Message>}
				{manifest &&
					(manifest.groups.length ? (
						<>
							<CategoryAnchors groups={groups} view={view} onViewChange={setView} />
							{groups.length ? (
								<div className="flex flex-col gap-12 p-4">
									{groups.map((g) => (
										<DocumentCategory key={g.id} category={g} view={view} />
									))}
								</div>
							) : (
								<Message role="status">Nessun documento corrisponde a “{query.trim()}”.</Message>
							)}
						</>
					) : (
						<Message>Nessun documento disponibile per ora.</Message>
					))}
			</section>
		</SeenDocumentsProvider>
	);
}
