export type ShareResult = "shared" | "copied" | "failed";

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * Share via the native share sheet when available, otherwise copy a link
 * to the clipboard. Returns how it was handled so the caller can toast.
 */
export async function shareContent(data: ShareData): Promise<ShareResult> {
  const url = data.url ?? window.location.href;

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title: data.title, text: data.text, url });
      return "shared";
    } catch (err) {
      // user dismissed the share sheet — not an error
      if (err instanceof Error && err.name === "AbortError") return "shared";
      // otherwise fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${data.text}\n${url}`.trim());
    return "copied";
  } catch {
    return "failed";
  }
}
