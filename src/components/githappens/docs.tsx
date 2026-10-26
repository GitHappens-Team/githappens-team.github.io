import { useManifest, type Category } from "@/lib/hooks/use-manifest";
import { Badge } from "../ui/badge";
import { DocumentCard } from "./document-card";
import { Button } from "../ui/button";

/** DOM id of a category section, used by the chips to jump to it. */
const categoryAnchor = (id: string) => `cat-${id.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

function Categories({ groups }: { groups: Category[] }) {
	return (
		<nav aria-label="Categorie" className="flex flex-wrap items-center gap-2 bg-muted p-4 border-b-2 border-ink">
			<span className="font-pixel text-2xl p-2">categorie</span>
			{groups.map((g) => (
				<Button key={g.id} asChild variant="chip">
					<a href={`#${categoryAnchor(g.id)}`}>
						<span>{g.id}</span>
						<span className="text-sm font-light">{g.files.length} documenti</span>
					</a>
				</Button>
			))}
		</nav>
	);
}

function DocumentCategory({ category }: { category: Category }) {
	return (
		<div id={categoryAnchor(category.id)} className="flex scroll-mt-4 flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
				<div className="flex flex-col">
					<span className="text-ink-muted font-pixel text-2xl">pdf/{category.id.replaceAll(" ", "_")}/</span>
					<h3 className="uppercase font-bold text-3xl">{category.id}</h3>
				</div>
				<Badge>{category.files.length} documenti</Badge>
			</div>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
				{category.files.length ? (
					category.files.map((file) => <DocumentCard key={file.path} file={file} />)
				) : (
					<span className="text-ink-muted text-center">Nessun documento qui per ora</span>
				)}
			</div>
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
