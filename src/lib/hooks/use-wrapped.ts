import { useLayoutEffect, useRef, useState } from "react";

/**
 * Whether a flex-wrap container's children have wrapped onto more than one line.
 * CSS can't select on that, so it's measured on every resize.
 */
export function useWrapped<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [wrapped, setWrapped] = useState(false);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const measure = () => {
			const children = [...el.children] as HTMLElement[];
			setWrapped(children.some((c) => c.offsetTop > children[0].offsetTop + 1));
		};
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return [ref, wrapped] as const;
}
