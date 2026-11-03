import { useState } from "react";
import { cn } from "@/lib/utils";
import { rotations, team, type Role, type Rotation } from "@/lib/team";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { Button } from "../ui/button";

type Status = "past" | "current" | "future";

const statusLabel: Record<Status, string> = { past: "Conclusa", current: "In corso", future: "In programma" };

// "2026-10-16" -> days since epoch, so dates compare without timezone drift
const dayNumber = (iso: string) => {
	const [y, m, d] = iso.split("-").map(Number);
	return Date.UTC(y, m - 1, d) / 86_400_000;
};

const formatDate = (iso: string, month: "long" | "short") =>
	new Date(dayNumber(iso) * 86_400_000).toLocaleDateString("it-IT", { day: "numeric", month, timeZone: "UTC" });

function statusOf(rotation: Rotation, today: number): Status {
	if (today >= dayNumber(rotation.to)) return "past";
	if (today >= dayNumber(rotation.from)) return "current";
	return "future";
}

/** The rotation to open on: the one in charge today, else the next one, else the latest. */
function initialRotation(today: number): number {
	const current = rotations.findIndex((r) => statusOf(r, today) === "current");
	if (current >= 0) return current;
	const next = rotations.findIndex((r) => statusOf(r, today) === "future");
	return next >= 0 ? next : rotations.length - 1;
}

/** Tree level of each role, top first. Everyone else sits on the bottom level. */
const roleRank: Partial<Record<Role, number>> = { Responsabile: 0, Amministratore: 1 };
const rankOf = (role: Role) => roleRank[role] ?? 2;

const roleBg: Partial<Record<Role, string>> = { Responsabile: "bg-primary", Amministratore: "bg-yellow-tint" };

function Callout({ index, today }: { index: number; today: number }) {
	const rotation = rotations[index];
	const status = statusOf(rotation, today);
	const from = formatDate(rotation.from, "long");
	const to = formatDate(rotation.to, "long");
	const isLatest = index === rotations.length - 1;

	let call: { kicker: string; title: string; sub: string; bg: string };
	if (status === "current") {
		const left = dayNumber(rotation.to) - today;
		const when = left === 1 ? "domani" : `tra ${left} giorni`;
		call = { kicker: "in corso", title: `Cambiano il ${to}`, sub: `Cioè ${when}. In carica dal ${from}.`, bg: "bg-primary" };
	} else if (status === "future") {
		call = { kicker: "in programma", title: `Cominciano il ${from}`, sub: `In carica fino al ${to}.`, bg: "bg-yellow-tint" };
	} else if (isLatest) {
		// nothing scheduled after it yet
		call = { kicker: "conclusa", title: "Nuovi ruoli in definizione", sub: `L'ultima rotazione è andata dal ${from} al ${to}.`, bg: "bg-yellow-tint" };
	} else {
		call = { kicker: "conclusa", title: `Sono cambiati il ${to}`, sub: `In carica dal ${from} al ${to}.`, bg: "bg-muted" };
	}

	return (
		<div
			aria-live="polite"
			className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t-2 border-ink px-6 py-4", call.bg)}
		>
			<div className="flex flex-col gap-1">
				<span className="font-pixel text-[22px] leading-none">
					rotazione {index + 1} {call.kicker}
				</span>
				<strong className="text-[28px] leading-[1.1] font-bold">{call.title}</strong>
			</div>
			<span className="text-sm font-medium text-ink-muted">{call.sub}</span>
		</div>
	);
}

/** Half-width rails either side of a step or tree node, so siblings join into one line. */
function Rails({ left, right, className }: { left: boolean; right: boolean; className?: string }) {
	return (
		<>
			<span className={cn("absolute left-0 w-1/2 border-t-3 border-ink", !left && "border-transparent", className)} />
			<span className={cn("absolute right-0 w-1/2 border-t-3 border-ink", !right && "border-transparent", className)} />
		</>
	);
}

function RotationStepper({ selected, onSelect, today }: { selected: number; onSelect: (i: number) => void; today: number }) {
	const last = rotations.length - 1;
	// the latest rotation is over and the next one isn't decided yet: show it as a pending step
	const pending = statusOf(rotations[last], today) === "past";
	const many = rotations.length > 1;

	return (
		<div className="flex items-start gap-4 p-6">
			{many && (
				<Button
					variant="outline"
					size="icon"
					className="-mt-1"
					aria-label="Rotazione precedente"
					disabled={selected === 0}
					onClick={() => onSelect(selected - 1)}
				>
					<ChevronLeftIcon />
				</Button>
			)}
			<ol aria-label="Rotazioni" className="flex min-w-0 flex-1 overflow-x-auto pb-1">
				{rotations.map((r, i) => {
					const status = statusOf(r, today);
					const isSelected = i === selected;
					return (
						<li key={r.from} className="flex-[1_0_140px]">
							<button
								type="button"
								onClick={() => onSelect(i)}
								aria-current={isSelected ? "step" : undefined}
								aria-label={`Rotazione ${i + 1}, dal ${formatDate(r.from, "long")} al ${formatDate(r.to, "long")}, ${statusLabel[status].toLowerCase()}`}
								className="group flex min-h-11 w-full cursor-pointer flex-col items-center gap-2 outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
							>
								<span className="relative block h-9 w-full">
									<Rails left={i > 0} right={i < last || pending} className="top-4" />
									<span
										className={cn(
											"absolute left-1/2 -ml-[18px] flex size-9 items-center justify-center border-2 border-ink pt-[0.1em] font-pixel text-2xl leading-none transition-transform duration-75 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5",
											status === "past" && "bg-ink text-paper",
											status === "current" && "bg-primary",
											status === "future" && "bg-paper",
											isSelected && "shadow-offset",
										)}
									>
										{i + 1}
									</span>
								</span>
								<span className={cn("text-[17px] leading-tight font-bold underline-offset-4", isSelected ? "underline decoration-3" : "group-hover:underline")}>
									{formatDate(r.from, "short")}
								</span>
								<span className="text-sm leading-tight font-medium text-ink-muted">{statusLabel[status]}</span>
							</button>
						</li>
					);
				})}
				{pending && (
					<li className="flex flex-[1_0_140px] flex-col items-center gap-2">
						<span className="sr-only">Rotazione {rotations.length + 1}, da definire</span>
						<span aria-hidden="true" className="relative block h-9 w-full">
							<Rails left right={false} className="top-4 border-dashed" />
							<span className="absolute left-1/2 -ml-[18px] flex size-9 items-center justify-center border-2 border-dashed border-ink bg-paper pt-[0.1em] font-pixel text-2xl leading-none text-ink-muted">
								?
							</span>
						</span>
						<span aria-hidden="true" className="text-[17px] leading-tight font-bold text-ink-muted">
							Prossima
						</span>
						<span aria-hidden="true" className="text-sm leading-tight font-medium text-ink-muted">
							Da definire
						</span>
					</li>
				)}
			</ol>
			{many && (
				<Button
					variant="outline"
					size="icon"
					className="-mt-1"
					aria-label="Rotazione successiva"
					disabled={selected === last}
					onClick={() => onSelect(selected + 1)}
				>
					<ChevronRightIcon />
				</Button>
			)}
		</div>
	);
}

const initials = (name: string) =>
	name
		.split(/\s+/)
		.map((w) => w[0] ?? "")
		.join("")
		.slice(0, 2)
		.toUpperCase();

/** GitHub avatar, falling back to the member's initials if it can't load. */
function Avatar({ username, name, className }: { username: string; name: string; className?: string }) {
	const [failed, setFailed] = useState(false);

	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex items-center justify-center overflow-hidden border-2 border-ink text-[26px] leading-none font-extrabold shadow-offset transition-[translate,box-shadow] duration-75 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_var(--ink)]",
				className,
			)}
		>
			{failed ? (
				<span className="pt-[0.18em]">{initials(name)}</span>
			) : (
				<img
					src={`https://github.com/${username}.png?size=208`}
					alt=""
					loading="lazy"
					className="size-full object-cover"
					onError={() => setFailed(true)}
				/>
			)}
		</span>
	);
}

function RoleTree({ rotation }: { rotation: Rotation }) {
	const members = team
		.filter((m) => rotation.roles[m.username])
		.map((m) => ({ ...m, role: rotation.roles[m.username] }));
	const levels = [...new Set(members.map((m) => rankOf(m.role)))].sort((a, b) => a - b);

	return (
		<div className="flex flex-col items-center pt-6 pb-2">
			{levels.map((level, ti) => {
				// keep people with the same role next to each other
				const group = members.filter((m) => rankOf(m.role) === level).sort((a, b) => a.role.localeCompare(b.role));
				return (
					<div key={level} className="flex w-full flex-col items-center">
						<ul
							aria-label={`Livello ${ti + 1}`}
							className={cn("flex max-w-full flex-wrap justify-center gap-y-8 md:flex-nowrap", ti > 0 && "mt-8 md:mt-0")}
						>
							{group.map((m, i) => (
								<li key={m.username} className="flex w-40 flex-col items-center md:w-auto md:min-w-0 md:flex-[0_1_13rem]">
									{ti > 0 && (
										<span aria-hidden="true" className="relative hidden h-7 w-full md:block">
											<Rails left={i > 0} right={i < group.length - 1} className="top-0" />
											<span className="absolute top-0 left-1/2 -ml-[1.5px] h-7 w-[3px] bg-ink" />
										</span>
									)}
									<a
										href={`https://github.com/${m.username}`}
										target="_blank"
										rel="noreferrer"
										aria-label={`${m.name}, @${m.username}, ${m.role} (profilo GitHub)`}
										className="group flex flex-col items-center gap-2 px-3 text-center no-underline outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
									>
										<Avatar
											username={m.username}
											name={m.name}
											className={cn(roleBg[m.role] ?? "bg-paper", ti === 0 ? "size-26" : "size-20")}
										/>
										<span className="mt-2 flex flex-col items-center gap-0.5">
											<span className="text-lg leading-tight font-bold group-hover:underline">{m.name}</span>
											<span className="font-pixel text-xl leading-none [overflow-wrap:anywhere] text-ink-muted">@{m.username}</span>
										</span>
										<span
											className={cn(
												"inline-flex min-h-7 items-center rounded-full border-2 border-ink px-3 pt-[0.18em] text-sm font-bold",
												roleBg[m.role] ?? "bg-paper",
											)}
										>
											{m.role}
										</span>
									</a>
								</li>
							))}
						</ul>
						{ti < levels.length - 1 && <span aria-hidden="true" className="mt-3 hidden h-7 w-[3px] bg-ink md:block" />}
					</div>
				);
			})}
		</div>
	);
}

export default function Team() {
	const [today] = useState(() => {
		const now = new Date();
		return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000;
	});
	const [selected, setSelected] = useState(() => initialRotation(today));

	return (
		<section id="team" className="scroll-mt-4 border-t-2 border-ink bg-muted">
			<div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-16 md:px-10">
				<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
					<div className="flex flex-col">
						<span className="font-pixel text-[22px] leading-none text-ink-muted">git shortlog -s</span>
						<h2 className="text-[40px] leading-none font-extrabold uppercase">Il team</h2>
					</div>
					<span className="text-sm font-medium text-ink-muted">I ruoli ruotano: scegli una rotazione per vedere chi ha fatto cosa.</span>
				</div>
				<div className="border-2 border-ink bg-paper shadow-offset">
					<RotationStepper selected={selected} onSelect={setSelected} today={today} />
					<Callout index={selected} today={today} />
				</div>
				<RoleTree rotation={rotations[selected]} />
			</div>
		</section>
	);
}
