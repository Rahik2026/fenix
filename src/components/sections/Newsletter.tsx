"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail } from "@/lib/utils";

export default function Newsletter() {
  const settings = useSettings();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast("Please enter a valid email", "error");
      return;
    }
    setEmail("");
    toast("Subscribed! Watch your inbox for drops.", "success");
  };

  return (
    <section className="py-10 md:py-12">
      <div className="container-x">
        <div
          className="rounded-xl3 p-6 md:p-10 text-white"
          style={{
            background:
              "linear-gradient(120deg, #0a2337 0%, #183954 55%, #2a648d 100%)",
          }}
        >
          <div className="max-w-2xl">
            <span className="kicker text-white/80">Newsletter</span>
            <h2 className="serif-title text-2xl md:text-4xl mt-1.5 mb-2">
              {settings.newsletterTitle}
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-5">
              {settings.newsletterCopy}
            </p>
            <form
              onSubmit={submit}
              className="grid gap-2 sm:grid-cols-[1fr_auto] max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input"
                autoComplete="email"
              />
              <button type="submit" className="btn-ghost text-ink">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
