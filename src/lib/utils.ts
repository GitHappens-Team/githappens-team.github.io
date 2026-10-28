export { cn } from "cn"

// "project-proposal" / "way_of_working" -> "Project proposal" / "Way of working"
export const humanize = (name: string) => {
	const spaced = name.replace(/[-_]+/g, " ").trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
