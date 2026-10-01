"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Headset,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteGate } from "@/hooks/use-quote-gate";
import { api, ApiError, type ApiResponse } from "@/lib/api";
import {
  CONTACT_OPEN_EVENT,
  CONTACT_SECTION_ID,
  type ContactFormKind,
} from "@/lib/contact-section";

// Placeholder background — swap for the dedicated Contact/Help image once it's
// supplied.
const CONTACT_BG = "/quoteBg.svg";

const OPTIONS: {
  kind: ContactFormKind;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    kind: "quote",
    title: "Request a Quote",
    description:
      "Need pricing for an upcoming shipment or logistics requirement?",
    icon: FileText,
  },
  {
    kind: "support",
    title: "Customer Support",
    description:
      "Already have a shipment or need assistance with an existing delivery?",
    icon: Headset,
  },
  {
    kind: "inquiry",
    title: "General Inquiry",
    description: "Have a question about Logical Links or our services?",
    icon: MessageCircleQuestion,
  },
];

const FIELD_CLASS = "border-white/10 bg-white text-black rounded-xs";

export default function Contact() {
  const [active, setActive] = useState<ContactFormKind | null>(null);

  // "/#quote" (footer, services page, access hub) lands with the quote form
  // already open; the header CTA opens it in place via openContactForm.
  useEffect(() => {
    if (window.location.hash === "#quote") {
      setActive("quote");
      document
        .getElementById(CONTACT_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth" });
    }

    const onOpen = (e: Event) =>
      setActive((e as CustomEvent<ContactFormKind>).detail);
    window.addEventListener(CONTACT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONTACT_OPEN_EVENT, onOpen);
  }, []);

  return (
    <section
      id={CONTACT_SECTION_ID}
      className="relative min-h-screen overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${CONTACT_BG}')` }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-0">
          {/* Options column — sits on top so the chosen form slides out from
              underneath its edge, like the nav on the Services page. */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-20 text-white lg:pr-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Contact Us
            </p>
            <h2 className="mt-3 mb-4 text-4xl sm:text-6xl font-bold leading-tight">
              How Can
              <br />
              We Help?
            </h2>
            <p className="mb-10 text-lg text-white/80">
              Choose an option below and we&apos;ll point you to the right
              team.
            </p>

            <div className="space-y-4">
              {OPTIONS.map((option) => (
                <OptionCard
                  key={option.kind}
                  {...option}
                  active={active === option.kind}
                  onClick={() => setActive(option.kind)}
                />
              ))}
            </div>
          </motion.div>

          {/* Form column — the selected form slides out from the options
              column; overflow is clipped so it emerges from the seam. */}
          <div className="relative z-10 overflow-hidden lg:min-h-[640px]">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active}
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-sm border border-white/30 bg-white/10 p-8 backdrop-blur-xl"
                >
                  {active === "quote" ? (
                    <QuoteForm />
                  ) : (
                    <MessageForm kind={active} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionCard({
  title,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-full items-center gap-4 rounded-sm border p-5 text-left backdrop-blur-xl transition-colors ${
        active
          ? "border-primary bg-primary/25"
          : "border-white/30 bg-white/10 hover:border-white/60 hover:bg-white/15"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${
          active ? "bg-primary text-white" : "bg-white/15 text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-base font-semibold text-white">
          {title}
        </span>
        <span className="mt-1 block text-sm text-white/75">{description}</span>
      </span>
      <ChevronRight
        className={`h-5 w-5 shrink-0 text-white transition-transform ${
          active ? "translate-x-1" : "opacity-60 group-hover:translate-x-1"
        }`}
      />
    </button>
  );
}

function QuoteForm() {
  const requestQuote = useQuoteGate();

  return (
    <>
      <p className="text-2xl font-semibold text-white">Get Your Quote</p>
      <p className="mt-2 text-sm text-white/70">
        Tell us about your FTL, dedicated trucking, or RUSH delivery needs and
        we&apos;ll get back to you within 24 hours.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          requestQuote(() => {});
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="First Name" className={FIELD_CLASS} />
          <Input placeholder="Last Name" className={FIELD_CLASS} />
        </div>
        <Input placeholder="Email Address" type="email" className={FIELD_CLASS} />
        <Input placeholder="Company Name" className={FIELD_CLASS} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Service Type" className={FIELD_CLASS} />
          <Input placeholder="Package Volume" className={FIELD_CLASS} />
        </div>
        <Textarea
          placeholder="Tell us about your logistics needs..."
          className={`min-h-30 ${FIELD_CLASS}`}
        />
        <Button
          size="lg"
          className="h-12 w-full bg-primary font-semibold text-white hover:bg-primary-dark"
        >
          Get My Quote →
        </Button>
        <p className="text-center text-xs text-white/60">
          By submitting this form, you agree to our terms and privacy policy
        </p>
      </form>
    </>
  );
}

// ── Support / general inquiry ─────────────────────────────────────────────────
// Both post to the public contact endpoint (admin Contact Messages inbox); the
// subject is prefixed with the request type so the team can triage at a glance.

interface MessageFormState {
  name: string;
  email: string;
  phone: string;
  reference: string;
  subject: string;
  message: string;
}

const EMPTY_MESSAGE_FORM: MessageFormState = {
  name: "",
  email: "",
  phone: "",
  reference: "",
  subject: "",
  message: "",
};

const MESSAGE_COPY = {
  support: {
    title: "Customer Support",
    intro:
      "Share your delivery details and our support team will help you out.",
    messagePlaceholder: "How can we help with your delivery?",
    subjectPrefix: "Customer Support",
  },
  inquiry: {
    title: "General Inquiry",
    intro: "Ask us anything about Logical Links or our services.",
    messagePlaceholder: "What would you like to know?",
    subjectPrefix: "General Inquiry",
  },
} as const;

function MessageForm({ kind }: { kind: "support" | "inquiry" }) {
  const copy = MESSAGE_COPY[kind];
  const [form, setForm] = useState<MessageFormState>(EMPTY_MESSAGE_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof MessageFormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof MessageFormState>(
    key: K,
    value: MessageFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof MessageFormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address";
    if (kind === "inquiry" && !form.subject.trim())
      next.subject = "Subject is required";
    if (!form.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const detail =
      kind === "support" ? form.reference.trim() : form.subject.trim();

    setSubmitting(true);
    try {
      await api.post<ApiResponse<unknown>>("/api/v1/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        subject: detail ? `${copy.subjectPrefix}: ${detail}` : copy.subjectPrefix,
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_MESSAGE_FORM);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-white">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-white">Message sent</p>
        <p className="max-w-xs text-sm text-white/70">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-2xl font-semibold text-white">{copy.title}</p>
      <p className="mt-2 text-sm text-white/70">{copy.intro}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              placeholder="Full Name"
              className={FIELD_CLASS}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Input
              placeholder="Phone Number (optional)"
              type="tel"
              className={FIELD_CLASS}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Input
            placeholder="Email Address"
            type="email"
            className={FIELD_CLASS}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>

        {kind === "support" ? (
          <Input
            placeholder="Delivery / Tracking Number (optional)"
            className={FIELD_CLASS}
            value={form.reference}
            onChange={(e) => update("reference", e.target.value)}
          />
        ) : (
          <div>
            <Input
              placeholder="Subject"
              className={FIELD_CLASS}
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
            />
            <FieldError message={errors.subject} />
          </div>
        )}

        <div>
          <Textarea
            placeholder={copy.messagePlaceholder}
            className={`min-h-30 ${FIELD_CLASS}`}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
          <FieldError message={errors.message} />
        </div>

        {submitError && <p className="text-sm text-red-300">{submitError}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 w-full bg-primary font-semibold text-white hover:bg-primary-dark"
        >
          {submitting ? "Sending…" : "Send Message →"}
        </Button>
        <p className="text-center text-xs text-white/60">
          By submitting this form, you agree to our terms and privacy policy
        </p>
      </form>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-300">{message}</p>;
}
