"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { useMegaLeadForm } from "@/hooks/useMegaLeadForm";
import { useTracking } from "@/hooks/useTracking";

// ─── Phone helpers ────────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  if (digits[0] === "0" || digits[0] === "1") return false;
  if (digits[3] === "0" || digits[3] === "1") return false;
  return true;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ownsHome: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ownsHome?: string;
}

// ─── Trust Stats ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "14+", label: "Years in Business" },
  { value: "500+", label: "Installations" },
  { value: "100%", label: "In-House Crews" },
  { value: "30%", label: "Federal Tax Credit" },
];

// ─── Benefits ─────────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
    title: "Backup Power When the Grid Fails",
    body:
      "Northern Michigan winters bring outages. A battery-backed solar system keeps your home running — heat, lights, appliances — automatically, no generator noise or fuel required.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    ),
    title: "Lock In Your Energy Rate Forever",
    body:
      "Utility rates in Michigan have climbed every year. Solar lets you produce your own power at a fixed cost — protecting your household budget for decades.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    title: "True Energy Independence",
    body:
      "Produce, store, and consume your own electricity. Our systems work seamlessly with the grid — or completely without it when you need it most.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Fully In-House, Licensed Electricians",
    body:
      "Every phase — design, engineering, electrical, mounting, wiring, commissioning — is done by our own licensed team. No subcontractors, no gaps in accountability.",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "We are very happy with Peninsula Solar from start to finish of the project and highly recommend the company for anyone looking into going solar.",
    name: "Lynn M.",
    location: "Paradise, MI — Great Lakes Coastal Home",
    img: "/images/install-1.jpg",
  },
  {
    quote:
      "The workmanship of the installation was beyond what we expected. The salesman was incredibly knowledgeable, competent and trustworthy — he directed us to great products and guided us through all government incentives available to us.",
    name: "Dan P.",
    location: "Ishpeming, MI — Battery-Backed System",
    img: "/images/install-2.jpg",
  },
  {
    quote:
      "I couldn't give you better than a 10-star rating. I mean, it's just the best. I was really blessed by you guys.",
    name: "Pam & Tim M.",
    location: "Lake City, MI — Small Farm, Energy Self-Sufficient",
    img: "/images/local.webp",
  },
];

// ─── Lead Form Component ──────────────────────────────────────────────────────
function LeadForm({ compact = false }: { compact?: boolean }) {
  const { submit } = useMegaLeadForm();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ownsHome: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!isValidPhone(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.ownsHome) e.ownsHome = "Please select one";
    return e;
  };

  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Reject letters
    if (/[a-zA-Z]/.test(raw)) return;
    setForm((f) => ({ ...f, phone: formatPhone(raw) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("submitting");
    try {
      await submit({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        ownsHomeInNorthernMichigan: form.ownsHome,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re on our list!</h3>
        <p className="text-gray-600 mb-1">A Peninsula Solar specialist will reach out within 1 business day.</p>
        <p className="text-gray-500 text-sm">Questions now? Call us: <a href="tel:9062350340" className="text-[#2b7bb9] font-semibold">(906) 235-0340</a></p>
      </div>
    );
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 rounded-lg border text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#f7792e] transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {!compact && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Get Your Free Solar Estimate</h3>
          <p className="text-gray-500 text-sm mt-1">No pressure. Custom design included.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder="First Name *"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={inputClass("firstName")}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Last Name *"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={inputClass("lastName")}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <input
          type="email"
          placeholder="Email Address *"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClass("email")}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <input
          type="tel"
          placeholder="Phone Number *"
          value={form.phone}
          onChange={handlePhone}
          className={inputClass("phone")}
          maxLength={14}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Do you own your home or property in Northern Michigan? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm((f) => ({ ...f, ownsHome: opt }))}
              className={`py-3 rounded-lg border-2 text-sm font-semibold transition ${
                form.ownsHome === opt
                  ? "border-[#f7792e] bg-[#f7792e] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#f7792e]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {errors.ownsHome && <p className="text-red-500 text-xs mt-1">{errors.ownsHome}</p>}
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm text-center">Something went wrong. Please try again or call us at (906) 235-0340.</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 rounded-lg bg-[#f7792e] text-white font-bold text-base hover:bg-[#e66820] transition disabled:opacity-60 shadow-lg"
      >
        {status === "submitting" ? "Sending..." : "Get My Free Solar Estimate"}
      </button>

      <p className="text-center text-gray-400 text-xs">
        No spam. No pressure. Northern Michigan&apos;s most trusted solar company since 2011.
      </p>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PeninsulaSolarLP() {
  useTracking({ siteKey: "peninsula-solar" });

  return (
    <div className="min-h-screen font-sans bg-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#1a2332]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="https://peninsula-solar.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/logo-white.png"
              alt="Peninsula Solar"
              width={180}
              height={57}
              className="h-8 w-auto"
            />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="tel:9062350340"
              className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 0 12 .82 2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              (906) 235-0340
            </a>
            <a
              href="#get-estimate"
              className="rounded-lg px-4 py-2.5 text-sm font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition"
            >
              Free Estimate
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#1a2332]">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Peninsula Solar rooftop installation in Northern Michigan winter"
            fill
            className="object-cover object-center opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332] via-[#1a2332]/80 to-[#1a2332]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f7792e]/20 border border-[#f7792e]/40 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#f7792e] animate-pulse" />
                <span className="text-[#f7792e] text-sm font-semibold">Northern Michigan&apos;s #1 Solar Installer Since 2011</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Stop Renting Power.<br />
                <span className="text-[#f7792e]">Own Your Energy.</span>
              </h1>

              <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-xl leading-relaxed">
                Battery-backed solar is the smart alternative to a standby generator — it&apos;s silent, runs automatically, and pays for itself. Peninsula Solar&apos;s licensed crews install every system in-house, built for life in the North.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  "Backup Power During Outages",
                  "Lower Electric Bills",
                  "30% Federal Tax Credit",
                  "Free Custom Design",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-white/90 text-sm">
                    <svg className="w-4 h-4 text-[#f7792e] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t}
                  </div>
                ))}
              </div>

              <a
                href="#get-estimate"
                className="inline-block rounded-lg px-8 py-4 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition shadow-lg sm:hidden"
              >
                Get My Free Solar Estimate
              </a>

              {/* Phone */}
              <div className="mt-6 flex items-center gap-3">
                <a href="tel:9062350340" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 0 12 .82 2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Prefer to call? <span className="font-semibold text-white">(906) 235-0340</span>
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div id="get-estimate" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#f7792e] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-white/80 text-sm mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Pain Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[440px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/install-portrait.jpg"
                alt="Peninsula Solar installation crew at work"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">The Problem</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
                Northern Michigan Power Isn&apos;t Reliable. Your Energy Shouldn&apos;t Depend on It.
              </h2>
              <div className="space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  UP winters bring ice storms, downed lines, and outages that can last days. A gas generator is loud, needs fuel, and requires you to be home to start it. There&apos;s a better way.
                </p>
                <p>
                  At the same time, Michigan utility rates have climbed year after year — and they won&apos;t stop. Every month you stay on the grid is another month you&apos;re paying for power someone else controls.
                </p>
                <p>
                  Peninsula Solar installs battery-backed solar systems that turn your home into its own power source — automatically switching to backup mode the moment the grid goes down, silently keeping your heat, lights, and appliances running.
                </p>
              </div>
              <a
                href="#get-estimate"
                className="inline-block mt-8 rounded-lg px-6 py-3 text-base font-bold bg-[#1a2332] text-white hover:bg-[#2b3a52] transition"
              >
                Get My Free Custom Design
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits / Solution ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">Why Solar + Battery</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything a Standby Generator Offers — and More
            </h2>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
              No noise. No fuel runs. No maintenance. Just clean, automatic backup power that also slashes your electric bill.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#f7792e]/10 flex items-center justify-center text-[#f7792e] mb-4">
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tundra Racking / Vertically Integrated ── */}
      <section className="py-20 bg-[#1a2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">Built for the North</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
                The Only Solar Company That Does Everything In-House
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Tundra Solar Racking System",
                    body: "Engineered specifically for Northern Michigan's snow loads and freeze-thaw cycles. Our proprietary racking system handles what standard mounts can't.",
                  },
                  {
                    title: "Licensed Electricians on Every Job",
                    body: "From service panel upgrades to final commissioning — every wire is run by our own licensed electricians. No subcontractors, ever.",
                  },
                  {
                    title: "System Design to Service — All Peninsula Solar",
                    body: "We design, engineer, permit, mount, wire, and commission every system ourselves. That means no finger-pointing when something needs attention.",
                  },
                  {
                    title: "Michigan Saves Authorized Contractor",
                    body: "We're an authorized contractor for the Michigan Saves loan program — giving you access to low-interest financing for your solar project.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#f7792e] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base mb-1">{item.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/electrical.jpg"
                alt="Peninsula Solar electrical system design and installation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-semibold text-sm">Every electrical system custom-designed by our licensed team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">Real Customers</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Northern Michigan Homeowners Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={t.img}
                    alt={`Peninsula Solar installation — ${t.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#f7792e]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">Our Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple. Transparent. Done Right.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Free Custom Design", body: "We analyze your energy usage, roof/property, and goals. You get a fully engineered system design — free, no obligation." },
              { num: "02", title: "Review & Approve", body: "We walk you through the design, pricing, tax credits, and financing options. No surprises. You approve before we order a single part." },
              { num: "03", title: "We Handle Everything", body: "Permits, equipment ordering, scheduling, installation — our in-house licensed crew does it all from start to finish." },
              { num: "04", title: "Power On", body: "We commission your system, walk you through monitoring, and leave you with a system built to perform for 25+ years." },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-black text-[#f7792e]/10 leading-none mb-2">{step.num}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Row ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid grid-cols-3 h-48 sm:h-64">
          <div className="relative">
            <Image src="/images/install-2.jpg" alt="Rooftop solar installation" fill className="object-cover" />
          </div>
          <div className="relative">
            <Image src="/images/install-3.png" alt="Peninsula Solar crew installing panels" fill className="object-cover" />
          </div>
          <div className="relative">
            <Image src="/images/local.webp" alt="Northern Michigan solar installation" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* ── CTA Section with Form ── */}
      <section className="py-20 bg-[#1a2332]" id="get-estimate-bottom">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#f7792e] text-sm font-bold uppercase tracking-widest mb-3">Get Started Today</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Own Your Energy?
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Fill out the form and a Peninsula Solar specialist will reach out within 1 business day with a free, no-obligation custom solar design for your home or property.
              </p>
              <div className="space-y-4">
                {[
                  "Free custom system design",
                  "No pushy sales tactics",
                  "Financing options available",
                  "Michigan Saves authorized contractor",
                  "30% federal tax credit guidance",
                ].map((pt) => (
                  <div key={pt} className="flex items-center gap-3 text-white/80">
                    <div className="w-5 h-5 rounded-full bg-[#f7792e]/20 border border-[#f7792e]/40 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-[#f7792e]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">{pt}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <a href="tel:9062350340" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 0 12 .82 2 2 0 014 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Prefer to call? <span className="text-white font-semibold">(906) 235-0340</span></span>
                </a>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <LeadForm compact />
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-3">Certified by</p>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <Image src="/images/badge-mi-saves.png" alt="Michigan Saves Authorized Contractor" width={60} height={60} className="h-12 w-auto object-contain" />
                  <Image src="/images/badge-tesla.jpg" alt="Tesla Powerwall Certified Installer" width={120} height={40} className="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#111b28] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Col 1 */}
            <div>
              <Image
                src="/images/logo-white.png"
                alt="Peninsula Solar"
                width={160}
                height={50}
                className="h-8 w-auto mb-3"
              />
              <p className="text-white/50 text-sm leading-relaxed">
                Northern Michigan&apos;s most trusted solar company. Built by people who genuinely care about helping homeowners own their energy.
              </p>
              <p className="text-white/30 text-xs mt-3">Since 2011</p>
            </div>
            {/* Col 2 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                {["Residential Solar", "Battery Storage", "Off-Grid Systems", "Agricultural Solar", "Tundra Solar Racking"].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            {/* Col 3 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <div className="space-y-3 text-white/50 text-sm">
                <div>
                  <p className="text-white/70 font-medium">Marquette</p>
                  <a href="tel:9062350340" className="hover:text-white transition">(906) 235-0340</a>
                  <p>102 W. Washington St. 232<br />Marquette, MI 49855</p>
                </div>
                <div>
                  <p className="text-white/70 font-medium">Traverse City</p>
                  <a href="tel:2315907305" className="hover:text-white transition">(231) 590-7305</a>
                </div>
                <a href="mailto:sales@peninsula-solar.com" className="block hover:text-white transition">
                  sales@peninsula-solar.com
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Peninsula Solar. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
