import { fileUrl, type ManifestFile } from "@/lib/hooks/use-manifest";
import { cn, humanize } from "@/lib/utils";
import { ArrowRightIcon, FileIcon } from "../icons";
import { Badge } from "../ui/badge";

type DocumentCardProps = Omit<React.ComponentProps<"a">, "href" | "title"> & {
	file: ManifestFile;
	/** overrides file.metadata.title */
	title?: string;
	/** overrides file.metadata.description */
	summary?: string;
};

// PDF card: ink outline, hard offset shadow; on hover it lifts up-left, the
// shadow grows and the ground turns yellow-tint.
export function DocumentCard({ file, title, summary, className, ...props }: DocumentCardProps) {
	// metadata (when the manifest has it) > humanised file name
	const heading = title ?? file.metadata?.title ?? humanize(file.name);
	const description = summary ?? file.metadata?.description;

	return (
		<a
			href={fileUrl(file)}
			className={cn(
				"flex min-h-55 flex-col justify-between gap-6 border-2 border-ink bg-paper p-6 text-ink no-underline shadow-offset",
				"transition-[transform,box-shadow,background-color] duration-75",
				"hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-yellow-tint hover:shadow-[6px_6px_0_var(--ink)]",
				"outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
				className,
			)}
			{...props}
		>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4">
					<Badge variant="yellow" size="sm">
						PDF
					</Badge>
					<FileIcon className="size-7" />
				</div>
				<div className="flex flex-col gap-2">
					<h3 className="text-[22px] leading-tight font-bold">{heading}</h3>
					{description && <p className="text-ink-muted">{description}</p>}
				</div>
			</div>
			<div className="flex items-center justify-between gap-4 border-t-2 border-ink pt-4">
				<span className="font-pixel text-xl leading-[1.1] [overflow-wrap:anywhere]">{file.path.split("/").pop()}</span>
				<span className="inline-flex items-center gap-2 font-bold whitespace-nowrap">
					Apri
					<ArrowRightIcon className="size-5" />
				</span>
			</div>
		</a>
	);
}
