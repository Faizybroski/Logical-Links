"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Phone, Send } from "lucide-react";
import Header from "@/components/landingPage/Header";
import Footer from "@/components/landingPage/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, ApiError, type ApiResponse } from "@/lib/api";

const SUPPORT_PHONE = "1300 000 000";
const SUPPORT_EMAIL = "support@logicallinks.com.au";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactSupportPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.subject.trim()) next.subject = "Subject is required";
    if (!form.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post<ApiResponse<unknown>>("/api/v1/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-page min-h-screen bg-white flex flex-col">
      <div className="bg-[url('/hero2.png')] bg-cover bg-center pt-10">
        <Header />

        <section className="max-w-6xl mx-auto pt-32 pb-20 px-6 text-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-6xl text-black font-bold leading-tight mb-6 uppercase"
          >
            Contact
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">Support</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-base sm:text-xl font-medium text-black max-w-xl"
          >
            Have a question or an issue? Send us a message and our team will
            get back to you as soon as possible.
          </motion.p>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left — contact details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Get In Touch
              </p>
              <h2 className="mt-2 text-2xl font-bold text-black">
                We&apos;re here to help
              </h2>
              <p className="mt-2 text-sm text-gray-600 max-w-md">
                Whether it&apos;s a question about a delivery, an invoice, or
                anything else, our support team typically responds within 24
                hours.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xs border border-gray-100 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Call Support</p>
                <p className="text-xs text-gray-600">{SUPPORT_PHONE}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xs border border-gray-100 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Email Support</p>
                <p className="text-xs text-gray-600">{SUPPORT_EMAIL}</p>
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-full rounded-xs border border-gray-100 p-8 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-semibold text-black">
                    Message sent
                  </p>
                  <p className="max-w-xs text-sm text-gray-600">
                    Thanks for reaching out — our team will get back to you
                    shortly.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 rounded-xs"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-black">
                    Send a Message
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Fill out the form below and we&apos;ll be in touch.
                  </p>

                  <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <Input
                        placeholder="Full Name"
                        className="rounded-xs"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <Input
                        placeholder="Email Address"
                        type="email"
                        className="rounded-xs"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <Input
                        placeholder="Phone Number (optional)"
                        type="tel"
                        className="rounded-xs"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <Input
                        placeholder="Subject"
                        className="rounded-xs"
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                    </div>

                    <div>
                      <Textarea
                        placeholder="How can we help?"
                        rows={5}
                        className="rounded-xs"
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-600">{submitError}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xs uppercase tracking-wide"
                    >
                      {submitting ? "Sending…" : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
