import { widgetInputId } from '@/components';

export const clickElement = (
  type: string,
  regex: RegExp,
  timeout?: boolean | number
): void => {
  const startTime = Date.now();

  const tryClick = () => {
    const thing = Array.from(document.querySelectorAll(type)).find((el) =>
      regex.test(el.textContent || '')
    ) as HTMLElement;

    if (thing) {
      thing.click();
    } else if (
      timeout &&
      Date.now() < startTime + (timeout === true ? 500 : timeout)
    ) {
      setTimeout(tryClick, 200);
    } else {
      console.warn(
        `${type} with text content matching ${regex} does not exist`
      );
    }
  };

  tryClick();
};

export const uploadFilesToInput = (...files: File[]): void => {
  const inputs = Array.from(
    document.querySelectorAll('input[type="file"]')
  ) as HTMLInputElement[];
  const input = inputs.find((el) => el.id !== widgetInputId);

  if (!input) {
    console.error('CSV file input not found.');
    return;
  }

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};
