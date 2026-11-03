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
