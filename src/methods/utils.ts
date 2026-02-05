import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class names, objects, or arrays of class names
 * @returns Merged and deduplicated class name string
 */
export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
