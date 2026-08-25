import { toPng } from "html-to-image";

export async function exportElementAsPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0d0e10",
    pixelRatio: 2,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
