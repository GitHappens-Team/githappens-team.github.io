import Navigation from "@/components/githappens/navigation";
import Hero from "./components/githappens/hero";
import Docs from "./components/githappens/docs";
import Footer from "./components/githappens/footer";

export default function App() {
	return (
		<div className="flex min-h-dvh flex-col">
			<header>
				<Navigation />
			</header>
			<main className="flex flex-1 flex-col">
				<Hero />
				<Docs />
			</main>
			<Footer />
		</div>
	);
}
