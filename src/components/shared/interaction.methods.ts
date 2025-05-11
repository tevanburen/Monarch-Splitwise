import { widgetInputId } from '@/components';

export const clickElement = async (
  type: string,
  regex: RegExp,
  timeout?: boolean | number
): Promise<boolean> =>
  await trySeveralTimes<boolean>(() => {
    const thing = Array.from(document.querySelectorAll(type)).find((el) =>
      regex.test(el.textContent || '')
    ) as HTMLElement;

    if (thing) {
      thing.click();
      return true;
    }
    return false;
  }, timeout);

export const uploadFilesToInput = async (...files: File[]): Promise<boolean> =>
  await trySeveralTimes<boolean>(() => {
    const inputs = Array.from(
      document.querySelectorAll('input[type="file"]')
    ) as HTMLInputElement[];
    const input = inputs.find((el) => el.id !== widgetInputId);

    if (!input) {
      return false;
    }

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, true);

const trySeveralTimes = async <K>(
  funcToTry: () => K | Promise<K>,
  timeout?: boolean | number,
  interval: number = 200
): Promise<K> =>
  new Promise((resolve) => {
    const endTime = Date.now() + (timeout === true ? 500 : timeout || 0);

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
