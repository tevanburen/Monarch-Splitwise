import { widgetInputId } from "@/components";

/**
 * Finds and clicks an HTML element matching the specified criteria.
 * Retries with exponential backoff until timeout.
 *
 * @template K - The HTML element type to return
 * @param type - CSS selector for element type (e.g., 'button', 'div')
 * @param regex - Regular expression to match against element's text content or name attribute
 * @param timeout - Retry timeout in milliseconds, or true for default 5000ms, false for single attempt
 * @returns Promise resolving to the clicked element, or undefined if not found/disabled
 */
export const clickElement = async <K extends HTMLElement>(
	type: string,
	regex: RegExp = /.*/,
	timeout: boolean | number = true,
): Promise<K | undefined> =>
	await trySeveralTimes<K | undefined>(() => {
		const thing = Array.from(document.querySelectorAll(type)).find(
			(el) =>
				regex.test(el.textContent || "") ||
				regex.test(el.getAttribute("name") || ""),
		) as K;

		if (thing && !(thing as unknown as HTMLButtonElement).disabled) {
			thing.click();
			return thing;
		}
		return undefined;
	}, timeout);

/**
 * Finds and clicks a link (anchor element) with the specified href.
 * Retries with exponential backoff until timeout.
 *
 * @param href - The exact href attribute value to match
 * @param timeout - Retry timeout in milliseconds, or true for default 5000ms, false for single attempt
 * @returns Promise resolving to the clicked link element, or undefined if not found
 */
export const clickLink = async (
	href: string,
	timeout: boolean | number = true,
): Promise<HTMLAnchorElement | undefined> =>
	await trySeveralTimes<HTMLAnchorElement | undefined>(() => {
		const thing = Array.from(document.querySelectorAll("a")).find(
			(el: HTMLAnchorElement) => href === el.getAttribute("href"),
		);

		if (thing) {
			thing.click();
			return thing;
		}
		return undefined;
	}, timeout);

/**
 * Uploads files to a file input element by programmatically setting its files property.
 * Finds the first file input that is not the widget's input.
 *
 * @param files - Files to upload to the input
 * @returns Promise resolving to the input element, or undefined if not found
 */
export const uploadFilesToInput = async (
	...files: File[]
): Promise<HTMLElement | undefined> =>
	await trySeveralTimes<HTMLElement | undefined>(() => {
		const inputs = Array.from(
			document.querySelectorAll('input[type="file"]'),
		) as HTMLInputElement[];
		const input = inputs.find((el) => el.id !== widgetInputId);

		if (!input) {
			return input;
		}

		const dataTransfer = new DataTransfer();
		files.forEach((file) => {
			dataTransfer.items.add(file);
		});
		input.files = dataTransfer.files;
		input.dispatchEvent(new Event("change", { bubbles: true }));
		return input;
	}, true);

/**
 * Async delay helper function.
 *
 * @param ms - Number of milliseconds to wait
 * @returns Promise that resolves to true after the specified delay
 */
export const wait = (ms: number): Promise<true> =>
	new Promise((resolve) => setTimeout(() => resolve(true), ms));

/**
 * Retries a function multiple times until it succeeds or times out.
 * Uses polling with a fixed interval to retry the operation.
 *
 * @template K - The return type of the function
 * @param funcToTry - The function to retry
 * @param timeout - Retry timeout in milliseconds, or true for default 5000ms, false/undefined for single attempt
 * @param interval - Milliseconds between retry attempts (default: 200)
 * @returns Promise resolving to the function's result
 */
const trySeveralTimes = async <K>(
	funcToTry: () => K | Promise<K>,
	timeout?: boolean | number,
	interval: number = 200,
): Promise<K> =>
	new Promise((resolve) => {
		const endTime = Date.now() + (timeout === true ? 5000 : timeout || 0);

		const tryFunc = async () => {
			const response = await funcToTry();
			if (response) {
				resolve(response);
			} else if (timeout && Date.now() < endTime) {
				setTimeout(tryFunc, interval);
			} else {
				resolve(response);
			}
		};

		tryFunc();
	});
