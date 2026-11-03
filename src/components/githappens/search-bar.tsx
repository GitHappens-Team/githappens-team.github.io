import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSearch } from "@/lib/hooks/search";
import { cn } from "@/lib/utils";

type SearchBarProps = React.ComponentProps<"search"> & {
	/** forwarded to the underlying <Input>; value/onChange stay controlled by the search context */
	inputProps?: Omit<React.ComponentProps<typeof Input>, "value" | "onChange">;
};

/** Filters the document cards by the search context's query. */
export function SearchBar({ className, inputProps, ...props }: SearchBarProps) {
	const { setQuery } = useSearch();
	// the context stores the lowercased query, so keep what the user typed locally
	const [value, setValue] = useState("");

	const update = (next: string) => {
		setValue(next);
		setQuery(next);
	};

	return (
		<search className={cn("relative flex items-center gap-2 px-4", className)} {...props}>
			<SearchIcon aria-hidden className="pointer-events-none absolute left-8 size-5 text-ink-muted" />
			<Input
				type="search"
				name="q"
				placeholder="Cerca per titolo, versione, ..."
				aria-label="Cerca nei documenti"
				autoComplete="off"
				{...inputProps}
				value={value}
				onChange={(e) => update(e.target.value)}
				className={cn("pl-11 pr-12 [&::-webkit-search-cancel-button]:hidden", inputProps?.className)}
			/>
			{value && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Cancella ricerca"
					className="absolute right-6"
					onClick={() => update("")}
				>
					<XIcon />
				</Button>
			)}
		</search>
	);
}
