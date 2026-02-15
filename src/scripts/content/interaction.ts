/**
 * DOM interaction utilities for content scripts.
 *
 * Provides functions for automating UI interactions on web pages.
 * All functions throw errors on failure rather than returning false/undefined,
 * making flow control cleaner and errors more explicit.
 */

/**
 * Navigates to the account details page in Monarch.
 *
 * @param monarchId - The Monarch account ID to navigate to
 * @throws Error if navigation fails
 */
export const navigateToAccountPage = async (
	monarchId: string,
): Promise<void> => {
	const target = `/accounts/details/${monarchId}`;
	const accountsTarget = "/accounts";

	// Already on target page
	if (window.location.pathname === target) {
		return;
	}

	// Navigate to accounts page if needed
	if (window.location.pathname !== accountsTarget) {
		await clickLink(accountsTarget);
	}

	// Navigate to target account page
	await clickLink(target);
};

/**
 * Finds and clicks an HTML element matching the specified criteria.
 * Retries with exponential backoff until timeout.
 *
 * @template K - The HTML element type to return
 * @param type - CSS selector for element type (e.g., 'button', 'div')
 * @param regex - Regular expression to match against element's text content or name attribute
 * @param timeout - Retry timeout in milliseconds, or true for default 5000ms, false for single attempt
 * @returns Promise resolving to the clicked element
 * @throws Error if element is not found or is disabled
 */
export const clickElement = async <K extends HTMLElement>(
	type: string,
	regex: RegExp = /.*/,
	timeout: boolean | number = true,
): Promise<K> => {
	const element = await trySeveralTimes<K | undefined>(() => {
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

	if (!element) {
		throw new Error(`Failed to find or click ${type} matching ${regex}`);
	}

	return element;
};

/**
 * Finds and clicks a link (anchor element) with the specified href.
 * Retries with exponential backoff until timeout.
 *
 * @param href - The exact href attribute value to match
 * @param timeout - Retry timeout in milliseconds, or true for default 5000ms, false for single attempt
 * @returns Promise resolving to the clicked link element
 * @throws Error if link is not found
 */
export const clickLink = async (
	href: string,
	timeout: boolean | number = true,
): Promise<HTMLAnchorElement> => {
	const link = await trySeveralTimes<HTMLAnchorElement | undefined>(() => {
		const thing = Array.from(document.querySelectorAll("a")).find(
			(el: HTMLAnchorElement) => href === el.getAttribute("href"),
		);

		if (thing) {
			thing.click();
			return thing;
		}
		return undefined;
	}, timeout);

	if (!link) {
		throw new Error(`Failed to find or click link with href: ${href}`);
	}

	return link;
};

/**
 * Uploads files to a file input element by programmatically setting its files property.
 * Finds the first file input element on the page.
 *
 * @param files - Files to upload to the input
 * @returns Promise resolving to the input element
 * @throws Error if file input is not found
 */
export const uploadFilesToInput = async (
	...files: File[]
): Promise<HTMLInputElement> => {
	const input = await trySeveralTimes<HTMLInputElement | undefined>(() => {
		const inputs = Array.from(
			document.querySelectorAll('input[type="file"]'),
		) as HTMLInputElement[];
		const firstInput = inputs[0];

		if (!firstInput) {
			return undefined;
		}

		const dataTransfer = new DataTransfer();
		files.forEach((file) => {
			dataTransfer.items.add(file);
		});
		firstInput.files = dataTransfer.files;
		firstInput.dispatchEvent(new Event("change", { bubbles: true }));
		return firstInput;
	}, true);

	if (!input) {
		throw new Error("Failed to find file input element");
	}

	return input;
};

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
