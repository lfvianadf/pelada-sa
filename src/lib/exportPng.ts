import { toPng } from "html-to-image";

export async function captureElementAsPng(element: HTMLElement): Promise<string> {
  return toPng(element, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0d0e10",
    pixelRatio: 2,
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
