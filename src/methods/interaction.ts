import { widgetInputId } from "@/components";

export const clickElement = async <K extends HTMLElement>(
	type: string,
	regex: RegExp = /.*/,
	timeout: boolean | number = true,
): Promise<K | undefined> =>
	await trySeveralTimes<K | undefined>(() => {
		const thing = Array.from(document.querySelectorAll(type)).find((el) =>
			regex.test(el.textContent || ""),
		) as K;

		if (thing && !(thing as unknown as HTMLButtonElement).disabled) {
			thing.click();
			return thing;
		}
		return undefined;
	}, timeout);

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
		files.forEach((file) => dataTransfer.items.add(file));
		input.files = dataTransfer.files;
		input.dispatchEvent(new Event("change", { bubbles: true }));
		return input;
	}, true);

export const wait = (ms: number): Promise<true> =>
	new Promise((resolve) => setTimeout(() => resolve(true), ms));

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
