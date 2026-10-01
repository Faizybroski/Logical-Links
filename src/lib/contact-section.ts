// The homepage Contact ("How Can We Help?") section lets visitors pick one of
// these forms. Anything outside the section that wants to open a specific form
// (e.g. the header's "Request a Quote" CTA) goes through openContactForm, or
// links to "/#quote" from another page — the section reads that hash on mount.

export type ContactFormKind = "quote" | "support" | "inquiry";

export const CONTACT_SECTION_ID = "contact";
export const CONTACT_OPEN_EVENT = "contact:open";

export function openContactForm(kind: ContactFormKind) {
  window.dispatchEvent(
    new CustomEvent<ContactFormKind>(CONTACT_OPEN_EVENT, { detail: kind }),
  );
  document
    .getElementById(CONTACT_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth" });
}
