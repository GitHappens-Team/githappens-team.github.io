import { fileUrl, type ManifestFile } from "@/lib/hooks/use-manifest";
import { cn, humanize } from "@/lib/utils";
import { FileIcon } from "../icons";
import { Badge } from "../ui/badge";
import { displayName } from "@/lib/team";
import { useDocumentStatus } from "@/lib/hooks/use-seen-documents";
import { CheckCheck, GitPullRequestArrowIcon, Star } from "lucide-react";

type DocumentCardProps = Omit<React.ComponentProps<"a">, "href" | "title"> & {
	file: ManifestFile;
	/** overrides file.metadata.title */
	title?: string;
	/** overrides file.metadata.description */
	summary?: string;
};

function StatusSticker({ file, className }: { file: ManifestFile; className?: string }) {
	const status = useDocumentStatus(file);
	if (!status) return null;

	return (
		<Badge variant={status === "new" ? "yellow" : "outline"} size="sm" className={cn("-rotate-2 shadow-[2px_2px_0_var(--ink)]", className)}>
			{status === "new" ? "NUOVO" : "AGGIORNATO"}
		</Badge>
	);
}

function VersionBadge({ file }: { file: ManifestFile }) {
	const version = file.metadata?.version;
	if (!version) return null;

	return (
		<Badge>
			versione {version.version} del {version.atTimestamp.toLocaleDateString()}
		</Badge>
	);
}

function ApprovedBadge({ file }: { file: ManifestFile }) {
	const approved = file.metadata?.approved;
	if (!approved) return null;

	return (
		<Badge variant="success">
			<div className="flex items-center gap-2">
				<CheckCheck aria-label="Approvato da" />
				<span>{approved.by.map(displayName).join(", ")}</span>
				<div className="h-1 w-1 bg-success" />
				<GitPullRequestArrowIcon />#{approved.prNumber}
			</div>
		</Badge>
	);
}

// PDF card: ink outline, hard offset shadow; on hover it lifts up-left, the
// shadow grows and the ground turns yellow-tint.
export function DocumentCard({ file, title, summary, className, ...props }: DocumentCardProps) {
	// metadata (when the manifest has it) > humanised file name
	const heading = title ?? file.metadata?.title ?? humanize(file.name);
	const description = summary ?? file.metadata?.description;

	return (
		<a
			href={fileUrl(file)}
			target="_blank"
			title={description}
			className={cn(
				"relative flex flex-col justify-between gap-6 border-2 border-ink bg-paper p-6 text-ink no-underline shadow-offset",
				"transition-[transform,box-shadow,background-color] duration-75",
				"hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-yellow-tint hover:shadow-[6px_6px_0_var(--ink)]",
				"outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
				className,
			)}
			{...props}
		>
			{/* sticker straddling the top border, so it doesn't take a row in the card */}
			<StatusSticker file={file} className="absolute -top-3.5 left-5" />
			<div className="flex gap-4">
				<div className="flex items-center justify-between gap-4">
					<FileIcon className="size-7" />
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex gap-1 justify-between">
						<h3 className="text-xl leading-tight font-semibold">{heading}</h3>
						{file.metadata?.important && <Star aria-label="documento di rilievo" className="text-yellow size-6 shrink-0" />}
					</div>
					<div className="flex justify-between gap-2 flex-wrap">
						<VersionBadge file={file} />
						<ApprovedBadge file={file} />
						<span className="mt-1 font-light">Creato il {file.metadata?.createdAt?.toLocaleDateString()}</span>
					</div>
				</div>
			</div>
		</a>
	);
}

// PDF row: one line of a ruled list (DocumentList draws the outline). Its cells
// sit on the list's subgrid so titles, badges and dates line up across rows;
// on narrow screens they wrap instead. Hover turns the row yellow-tint.
export function DocumentRow({ file, title, summary, className, ...props }: DocumentCardProps) {
	const heading = title ?? file.metadata?.title ?? humanize(file.name);
	const description = summary ?? file.metadata?.description;

	return (
		<a
			href={fileUrl(file)}
			target="_blank"
			title={description}
			className={cn(
				"flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-ink bg-paper px-4 py-3 text-ink no-underline last:border-b-0",
				"lg:col-span-full lg:grid lg:grid-cols-subgrid",
				"transition-colors duration-75 hover:bg-yellow-tint",
				"outline-none focus-visible:relative focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-ink",
				className,
			)}
			{...props}
		>
			<FileIcon className="size-6 shrink-0" />
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<StatusSticker file={file} className="shrink-0" />
				<h3 className="min-w-0 text-lg leading-tight font-semibold">{heading}</h3>
				{file.metadata?.important && <Star aria-label="documento di rilievo" className="text-yellow size-5 shrink-0" />}
			</div>
			<div className="flex flex-wrap items-center gap-2 lg:justify-end">
				<VersionBadge file={file} />
				<ApprovedBadge file={file} />
			</div>
			<span className="text-sm font-light whitespace-nowrap lg:text-right">{file.metadata?.createdAt && `Creato il ${file.metadata.createdAt.toLocaleDateString()}`}</span>
		</a>
	);
}
