import logo from "@/assets/brand/logo.png";
import { GitHubIcon, MailIcon } from "../icons";
import { Button } from "../ui/button";

const GITHUB_URL = "https://github.com/GitHappens-Team";
const EMAIL = "githappens4swe@gmail.com";

export default function Footer() {
	return (
		<footer className="border-t-2 border-ink bg-primary">
			<div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-10 px-4 py-10 md:px-10">
				<div className="flex min-w-0 flex-[1_1_360px] items-center gap-6">
					<img src={logo} alt="git HAPPENS" className="block h-auto w-60 max-w-1/2" />
					<p className="font-medium">Fatto da git HAPPENS. Se si rompe, beh, lo sai.</p>
				</div>
				<nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
					<Button asChild variant="outline">
						<a href={GITHUB_URL}>
							<GitHubIcon /> GitHub
						</a>
					</Button>
					<Button asChild variant="outline">
						<a href={`mailto:${EMAIL}`}>
							<MailIcon /> {EMAIL}
						</a>
					</Button>
				</nav>
			</div>
			<div className="border-t-2 border-ink">
				<div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-6 gap-y-2 px-4 py-4 text-sm font-medium md:px-10">
					<span>© {new Date().getFullYear()} git HAPPENS</span>
					<span>Software Engineering 2026/2027 - corso di Informatica presso UniPD</span>
				</div>
			</div>
		</footer>
	);
}
