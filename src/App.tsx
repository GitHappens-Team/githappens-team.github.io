import Navigation from "@/components/githappens/navigation";
import Hero from "./components/githappens/hero";
import Docs from "./components/githappens/docs";
import Footer from "./components/githappens/footer";
import Team from "./components/githappens/team";
import { type SearchContext, SearchProvider } from "./lib/hooks/search";
import { useState } from "react";

export default function App() {
	const [searchState, setSearchState] = useState<SearchContext>({
		query: "",
	});

	return (
		<div className="flex min-h-dvh flex-col">
			<header>
				<Navigation />
			</header>
			<SearchProvider value={[searchState, setSearchState]}>
				<main className="flex flex-1 flex-col">
					<Hero />
					<Docs />
					<Team />
				</main>
			</SearchProvider>
			<Footer />
		</div>
	);
}
