"use client";

import { useSettings } from "@/context/SettingsContext";

export default function InfoPage({
  variant,
}: {
  variant: "about" | "contact" | "policies";
}) {
  const settings = useSettings();
  const map = {
    about: { kicker: "About", title: settings.aboutTitle, body: settings.aboutBody },
    contact: { kicker: "Contact", title: settings.contactTitle, body: settings.contactBody },
    policies: { kicker: "Policies", title: settings.policiesTitle, body: settings.policiesBody },
  } as const;
  const data = map[variant];

  return (
    <div className="container-x py-10 md:py-14">
      <div className="grid gap-2 mb-6 max-w-3xl">
        <span className="kicker">{data.kicker}</span>
        <h1 className="serif-title text-[30px] md:text-[48px] text-[#122033]">
          {data.title}
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="card p-6 md:p-8">
          {data.body.split("\n").map((para, i) => (
            <p key={i} className="text-muted leading-relaxed mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>
        <div className="card p-6 grid gap-3">
          <h2 className="serif-title text-xl">Get in touch</h2>
          <p className="text-sm text-muted"><strong>Email:</strong> {settings.supportEmail}</p>
          <p className="text-sm text-muted"><strong>Phone:</strong> {settings.supportPhone}</p>
          <p className="text-sm text-muted"><strong>WhatsApp:</strong> {settings.supportWhatsapp}</p>
          <p className="text-sm text-muted"><strong>bKash (Send Money):</strong> {settings.bkashNumber}</p>
          <a href={`mailto:${settings.supportEmail}`} className="btn mt-2">Email us</a>
        </div>
      </div>
    </div>
  );
}
