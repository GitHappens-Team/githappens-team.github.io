import mascot from "@/assets/brand/mascot-on-yellow.png";
import { ArrowDownIcon } from "../icons";
import { Button } from "../ui/button";

export default function Hero() {
	return (
		<section id="hero" className="flex w-full flex-1 items-center bg-primary px-4 py-8 border-b-2 border-ink border-solid">
			<div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-10">
				<div className="flex min-w-0 flex-[1_1_480px] flex-col gap-4">
					<div>
						<h1 className="font-bold text-4xl uppercase flex flex-col">
							<span className="font-pixel font-normal lowercase text-3xl">git</span>
							<span lang="en">Documentation</span>
						</h1>
					</div>
					<p className="text-2xl font-medium">Tutta la documentazione del team in una sola pagina.</p>
					<Button asChild variant="outline" className="self-start text-xl">
						<a href="#docs">
							Vai ai documenti <ArrowDownIcon />
						</a>
					</Button>
				</div>
				<div className="flex min-w-0 flex-[0_1_320px] justify-center">
					<img src={mascot} alt="La mascot di git HAPPENS che saluta" className="block h-auto w-full max-w-80" />
				</div>
			</div>
		</section>
	);
}
