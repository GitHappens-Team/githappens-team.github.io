import { fileUrl, type ManifestFile } from "@/lib/hooks/use-manifest";
import { cn, humanize } from "@/lib/utils";
import { FileIcon } from "../icons";
import { Badge } from "../ui/badge";
import { CheckCheck, GitPullRequestArrowIcon, Star } from "lucide-react";

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
			target="_blank"
			title={description}
			className={cn(
				"flex flex-col justify-between gap-6 border-2 border-ink bg-paper p-6 text-ink no-underline shadow-offset",
				"transition-[transform,box-shadow,background-color] duration-75",
				"hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-yellow-tint hover:shadow-[6px_6px_0_var(--ink)]",
				"outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
				className,
			)}
			{...props}
		>
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
						{file.metadata?.version && (
							<Badge>
								versione {file.metadata.version.version} del {file.metadata.version.atTimestamp.toLocaleDateString()}
							</Badge>
						)}
						{file.metadata?.approved && (
							<Badge variant="success">
								<div className="flex items-center gap-2">
									<CheckCheck aria-label="Approvato da" />
									<span>{file.metadata.approved.by.join(", ")}</span>
									<div className="h-1 w-1 bg-success" />
									<GitPullRequestArrowIcon />#{file.metadata.approved.prNumber}
								</div>
							</Badge>
						)}
						<span className="mt-1 font-light">Creato il {file.metadata?.createdAt?.toLocaleDateString()}</span>
					</div>
				</div>
			</div>
		</a>
	);
}
