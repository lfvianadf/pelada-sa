import { toPng } from "html-to-image";

function isSafari() {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS/.test(ua);
}

export async function exportElementAsPng(element: HTMLElement, filename: string) {
  // Safari (especially iOS) requires window.open to be called synchronously within the
  // user-gesture handler, and ignores the `download` attribute on synthetic <a> clicks in
  // many contexts — so open the tab up front, before the async capture, and fill it in once
  // the image is ready. The user can then save it via the native share/save sheet.
  const safariTab = isSafari() ? window.open() : null;

  const dataUrl = await toPng(element, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0d0e10",
    pixelRatio: 2,
  });

  if (safariTab) {
    safariTab.document.write(
      `<title>${filename}</title><body style="margin:0;background:#0d0e10;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;height:auto" /></body>`,
    );
    return;
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
