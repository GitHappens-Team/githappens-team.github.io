/** GitHub username -> "Name Surname" of each team member. */
const members: Record<string, string> = {
	MrFreex: "Filippo Lissandrin",
	PGgabbo: "Gabriele Gambarro",
	marameo0: "Diana Grosselle",
	monacolama: "Cristiano Antoniazzo",
	giangrinovero: "Gianmaria Grinovero",
	gchomy: "Tommaso Caon",
	FAnoFOUR: "Antonio Tang",
};

export type Member = { username: string; name: string };

/** Every team member, in the order of the map above. */
export const team: Member[] = Object.entries(members).map(([username, name]) => ({ username, name }));

/**
 * A GitHub username as "N. Surname", e.g. "F. Lissandrin".
 * Falls back to the username for anyone not in the map.
 */
export function displayName(username: string): string {
	const name = members[username];
	if (!name) return username;

	const [first, ...rest] = name.trim().split(/\s+/);
	return rest.length ? `${first[0]}. ${rest.join(" ")}` : first;
}

export type Role = "Responsabile" | "Amministratore" | "Verificatore" | "Redattore";

export type Rotation = {
	/** first day in charge, YYYY-MM-DD */
	from: string;
	/** the day roles change again (no longer in charge), YYYY-MM-DD */
	to: string;
	/** GitHub username -> role held during the rotation */
	roles: Record<string, Role>;
};

/** Role rotations, oldest first, as decided in the internal minutes. */
export const rotations: Rotation[] = [
	{
		// verbali interni del 16 e 20 ottobre 2026
		from: "2026-10-16",
		to: "2026-11-03",
		roles: {
			marameo0: "Responsabile",
			gchomy: "Amministratore",
			monacolama: "Verificatore",
			PGgabbo: "Verificatore",
			giangrinovero: "Redattore",
			FAnoFOUR: "Redattore",
			MrFreex: "Redattore",
		},
	},
];
