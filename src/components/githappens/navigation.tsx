import { NavLogo } from "../nav-logo";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "../icons";

export default function Navigation() {
	return (
		<nav className="flex justify-between px-4 py-2 border-b-2 border-ink">
			<NavLogo />
			<div className="flex flex-wrap flex-col mb-1 md:mb-0 md:flex-row gap-1">
				<Button asChild variant="link">
					<a href="#docs">Documenti</a>
				</Button>
				<Button asChild>
					<a href="https://github.com/GitHappens-Team" target="_blank" rel="noreferrer">
						<GitHubIcon className="size-4" /> GitHub
					</a>
				</Button>
			</div>
		</nav>
	);
}
