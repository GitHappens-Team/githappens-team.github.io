import { useManifest, type Category, type ManifestFile } from "@/lib/hooks/use-manifest";
import { Badge } from "../ui/badge";
import { DocumentCard } from "./document-card";
import { Button } from "../ui/button";
import { humanize } from "@/lib/utils";

/** DOM id of a category section, used by the chips to jump to it. */
const categoryAnchor = (id: string) => `cat-${id.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

function Categories({ groups }: { groups: Category[] }) {
	return (
		<nav aria-label="Categorie" className="flex flex-wrap items-center gap-2 bg-muted p-4 border-b-2 border-ink">
			<span className="font-pixel text-2xl p-2">categorie</span>
			{groups.map((g) => (
				<Button key={g.id} asChild variant="chip">
					<a href={`#${categoryAnchor(g.id)}`}>
						<span>{humanize(g.id)}</span>
						<span className="text-sm font-light">{g.files.length} documenti</span>
					</a>
				</Button>
			))}
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
	return [...groups.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([id, files]) => ({ id, files }));
}

const DocumentGrid = ({ files }: { files: ManifestFile[] }) => (
	<div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
		{files.map((file) => (
			<DocumentCard key={file.path} file={file} />
		))}
	</div>
);

function DocumentSubCategory({ category, sub }: { category: Category; sub: SubCategory }) {
	return (
		<div id={categoryAnchor(`${category.id}/${sub.id}`)} className="flex scroll-mt-4 flex-col gap-4">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
				<div className="flex flex-col">
					<span className="text-ink-muted font-pixel text-xl">{sub.id}/</span>
					<h4 className="font-bold text-2xl">{sub.id.split("/").map(humanize).join(" / ")}</h4>
				</div>
				<span className="text-sm font-light">{sub.files.length} documenti</span>
			</div>
			<DocumentGrid files={sub.files} />
		</div>
	);
}

function DocumentCategory({ category }: { category: Category }) {
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
						<DocumentSubCategory key={sub.id} category={category} sub={sub} />
					) : (
						<DocumentGrid key="loose" files={sub.files} />
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

	return (
		<section className="flex flex-col gap-4" id="docs">
			{status === "loading" && <Message role="status">Carico i documenti…</Message>}
			{status === "error" && (
				<Message role="alert">Non riesco a caricare i documenti. Riprova tra poco.</Message>
			)}
			{manifest &&
				(manifest.groups.length ? (
					<>
						<Categories groups={manifest.groups} />
						<div className="flex flex-col gap-12 p-4">
							{manifest.groups.map((g) => (
								<DocumentCategory key={g.id} category={g} />
							))}
						</div>
					</>
				) : (
					<Message>Nessun documento disponibile per ora.</Message>
				))}
		</section>
	);
}
