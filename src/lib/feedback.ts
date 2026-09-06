/** Client-side feedback → Web3Forms (access key is public-safe per their docs). */

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/** Opaque Web3Forms access key — safe in client code; never put inbox addresses here. */
export const WEB3FORMS_ACCESS_KEY = "425580d2-611e-4863-9efa-ab079f7c225f";

export type FeedbackPayload = {
  category: string;
  categoryLabel: string;
  message: string;
  at: number;
};

export type FeedbackSubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitFeedbackEmail(
  entry: FeedbackPayload,
): Promise<FeedbackSubmitResult> {
  const when = new Date(entry.at).toISOString();
  const body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Bag Chart feedback: ${entry.categoryLabel}`,
    from_name: "Bag Chart",
    name: "Bag Chart user",
    // Honeypot — must stay empty / unchecked for humans
    botcheck: false,
    message: [
      `Category: ${entry.categoryLabel} (${entry.category})`,
      `Submitted: ${when}`,
      "",
      entry.message,
    ].join("\n"),
  };

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: { success?: boolean; message?: string } | null = null;
    try {
      data = (await res.json()) as { success?: boolean; message?: string };
    } catch {
      data = null;
    }

    if (res.ok && data?.success !== false) {
      return { ok: true };
    }

    const apiMsg =
      typeof data?.message === "string" && data.message.trim()
        ? data.message.trim()
        : null;
    return {
      ok: false,
      error:
        apiMsg ??
        `Couldn’t send feedback (HTTP ${res.status}). Check your connection and try again.`,
    };
  } catch {
    return {
      ok: false,
      error:
        "Couldn’t reach the feedback service. Check your connection and try again.",
    };
  }
}
