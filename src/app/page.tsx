"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { useMegaLeadForm } from "@/hooks/useMegaLeadForm";
import { useTracking } from "@/hooks/useTracking";

// ─── Phone helpers ─────────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
function isValidPhone(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 10) return false;
  if (d[0] === "0" || d[0] === "1") return false;
  if (d[3] === "0" || d[3] === "1") return false;
  return true;
}

// ─── Lead Form ─────────────────────────────────────────────────────────────────
interface FormState { firstName: string; lastName: string; email: string; phone: string; ownsHome: string; }
interface FormErrors { firstName?: string; lastName?: string; email?: string; phone?: string; ownsHome?: string; }

function LeadForm({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { submit } = useMegaLeadForm();
  const [form, setForm] = useState<FormState>({ firstName: "", lastName: "", email: "", phone: "", ownsHome: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!isValidPhone(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.ownsHome) e.ownsHome = "Please select one";
    return e;
  };

  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (/[a-zA-Z]/.test(e.target.value)) return;
    setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus("submitting");
    try {
      await submit({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, ownsHomeInNorthernMichigan: form.ownsHome });
      setStatus("success");
    } catch { setStatus("error"); }
  };

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on our list!</h3>
        <p className="text-gray-500 text-sm mb-1">A Peninsula Solar specialist will call you within 1 business day.</p>
        <a href="tel:9062350340" className="text-[#f7792e] font-semibold text-sm">(906) 235-0340</a>
      </div>
    );
  }

  const inp = (field: keyof FormErrors) =>
    `w-full px-4 py-3 rounded-lg border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f7792e] transition ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`;

  return (
    <form onSubmit={handleSubmit} noValidate id="hero-form-fields" className="space-y-3">
      {title && (
        <div className="mb-1">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inp("firstName")} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <input type="text" placeholder="Last Name *" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inp("lastName")} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <input type="email" placeholder="Email Address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp("email")} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={handlePhone} className={inp("phone")} maxLength={14} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you own your home or property in Northern Michigan? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {["Yes", "No"].map(opt => (
            <button key={opt} type="button" onClick={() => setForm(f => ({ ...f, ownsHome: opt }))}
              className={`py-3 rounded-lg border-2 text-sm font-semibold transition ${form.ownsHome === opt ? "border-[#f7792e] bg-[#f7792e] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#f7792e]"}`}>
              {opt}
            </button>
          ))}
        </div>
        {errors.ownsHome && <p className="text-red-500 text-xs mt-1">{errors.ownsHome}</p>}
      </div>
      {status === "error" && <p className="text-red-500 text-sm text-center">Something went wrong. Please try again or call (906) 235-0340.</p>}
      <button type="submit" disabled={status === "submitting"}
        className="w-full py-4 rounded-lg bg-[#f7792e] text-white font-bold text-base hover:bg-[#e66820] transition disabled:opacity-60 shadow-lg">
        {status === "submitting" ? "Sending…" : "Get My Free Solar Estimate →"}
      </button>
      <p className="text-center text-gray-400 text-xs">No spam. No pressure. Northern Michigan&apos;s most trusted solar company since 2011.</p>
    </form>
  );
}

// ─── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[#f7792e] text-xs font-bold uppercase tracking-[0.15em] mb-3">{children}</p>;
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function Check({ dark }: { dark?: boolean }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${dark ? "text-[#f7792e]" : "text-[#f7792e]"}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PeninsulaSolarLP() {
  useTracking({ siteKey: "sk_moeyep8q_kj6i28c0wm", gtmId: "GTM-WLQXZ22P" });

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#1a2332]/97 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="https://peninsula-solar.com" target="_blank" rel="noopener noreferrer">
            <Image src="/images/logo-white.png" alt="Peninsula Solar" width={200} height={63} className="h-9 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#residential" className="hover:text-white transition">Residential Solar</a>
            <a href="#battery-backup" className="hover:text-white transition">Battery Backup</a>
            <a href="#off-grid" className="hover:text-white transition">Off-Grid</a>
            <a href="#tundra-racking" className="hover:text-white transition">Tundra Racking</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:9062350340" className="hidden sm:flex items-center gap-2 text-white/70 hover:text-white text-sm transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-.82-3.68 2 2 0 012-2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              (906) 235-0340
            </a>
            <a href="#get-estimate" className="rounded-lg px-4 py-2.5 text-sm font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition">
              Free Estimate
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#1a2332]">
        <div className="absolute inset-0">
          <Image src="/images/hero-bg.jpg" alt="Peninsula Solar rooftop installation on a Northern Michigan home in winter" fill className="object-cover object-top opacity-35" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332] via-[#1a2332]/85 to-[#1a2332]/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f7792e]/15 border border-[#f7792e]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#f7792e] animate-pulse shrink-0" />
                <span className="text-[#f7792e] text-sm font-semibold">Northern Michigan&apos;s Solar Installer Since 2011</span>
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-black text-white leading-[1.08] mb-6 tracking-tight">
                Stop Renting Power.<br />
                <span className="text-[#f7792e]">Own Your Energy.</span>
              </h1>
              <p className="text-white/75 text-lg sm:text-xl mb-8 max-w-lg leading-relaxed">
                Battery-backed solar is the modern alternative to a standby generator — silent, automatic, and built to pay for itself. Peninsula Solar&apos;s fully in-house licensed crews handle everything from design to commissioning.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
                {[
                  "Automatic backup during outages",
                  "Slash your monthly electric bill",
                  "30% Federal Tax Credit",
                  "100% in-house licensed crews",
                  "Tundra Solar Racking System",
                  "Free custom system design",
                ].map(t => (
                  <div key={t} className="flex items-start gap-2 text-white/85 text-sm">
                    <Check /><span className="leading-tight">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <a href="#get-estimate" className="rounded-lg px-7 py-4 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition shadow-lg">
                  Get My Free Estimate
                </a>
                <a href="tel:9062350340" className="text-white/60 hover:text-white text-sm transition">
                  Or call: <span className="font-semibold text-white">(906) 235-0340</span>
                </a>
              </div>
            </div>
            <div id="get-estimate" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <LeadForm title="Get Your Free Solar Estimate" subtitle="No pressure. No commitment. Custom design included." />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section className="bg-[#f7792e] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "15+", label: "Years in Business" },
              { val: "500+", label: "Installations Completed" },
              { val: "100%", label: "In-House Licensed Crews" },
              { val: "30%", label: "Federal Tax Credit Available" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-white/80 text-sm mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PENINSULA SOLAR ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image src="/images/about-team.jpg" alt="Peninsula Solar's in-house installation crew in Northern Michigan" width={800} height={600} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1a2332] to-transparent p-6">
                <p className="text-white font-semibold text-sm">Founded by Ian Olmsted, 2010 — 100% in-house team</p>
              </div>
            </div>
            <div>
              <SectionLabel>Why Peninsula Solar</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-5">
                Michigan&apos;s Only Fully Vertically Integrated Solar Company
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Peninsula Solar began 15 years ago with a clear purpose: deliver reliable, high-performance solar systems to homes and businesses across Northern Michigan. Under founder Ian Olmsted, we&apos;ve grown from a one-person operation into the region&apos;s most trusted full-service solar company.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Every phase of your project — system design, electrical engineering, structural foundations, trenching, mounting, wiring, and final commissioning — is executed by our own trained, licensed team. No subcontractors, no fragmented workflow, no finger-pointing when something needs attention. Just one crew, fully accountable for your system from start to finish.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Licensed Electricians on Every Job", body: "Every wire run by our own licensed electricians — not subcontractors. From service panel upgrades to inverter wiring to final commissioning." },
                  { title: "Systems Built for the North", body: "We engineer every system for Michigan's snow loads, freeze-thaw cycles, and extreme winters. Your system will perform when you need it most." },
                  { title: "Michigan Saves Authorized Contractor", body: "We're an authorized contractor for the Michigan Saves loan program — making low-interest financing available for your solar project." },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#f7792e] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE: RESIDENTIAL SOLAR + BATTERY ─────────────────────────────── */}
      <section id="residential" className="py-24 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionLabel>Service — Residential Solar</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-5">
                Residential Solar + Energy Storage
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                Electric bills keep climbing every year in Michigan. Solar lets you produce your own power, store it for outages, and stop paying the utility forever. A battery-backed system keeps your home running automatically the moment the grid goes down — no fuel runs, no generator noise, no manual switching.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Most home solar systems pay for themselves within 10 years. With the 30% federal tax credit, Michigan Saves financing, and rising utility rates working in your favor, the economics have never been better. Peninsula Solar provides free, custom-designed solar estimates based on your actual energy usage and property — no guessing, no one-size-fits-all.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: "⚡", title: "Capture More Solar Power", body: "Store excess solar in your batteries. Use it later instead of buying grid electricity. Avoid low-value utility credits." },
                  { icon: "🏠", title: "Backup Power for Harsh Winters", body: "Handles snow, ice storms, and rural outages. Instant, automatic backup power. No fuel, no startup delay." },
                  { icon: "💰", title: "Save Thousands Over Time", body: "Cut your electric bill by up to 100%. Most systems see ROI within 10 years with the 30% federal tax credit." },
                  { icon: "📊", title: "Real-Time Energy Monitoring", body: "Monitor production and consumption live. Prioritize loads, optimize usage, and track your savings in real time." },
                ].map(card => (
                  <div key={card.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl mb-3">{card.icon}</div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{card.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{card.body}</p>
                  </div>
                ))}
              </div>
              <a href="#get-estimate" className="inline-block rounded-lg px-6 py-3 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition">
                Get a Free Residential Estimate →
              </a>
            </div>
            <div className="space-y-4">
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/residential-roof.jpg" alt="Peninsula Solar residential rooftop solar installation" fill className="object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-44 rounded-xl overflow-hidden shadow">
                  <Image src="/images/install-2.jpg" alt="Solar panels on Northern Michigan home" fill className="object-cover" />
                </div>
                <div className="relative h-44 rounded-xl overflow-hidden shadow">
                  <Image src="/images/install-4.jpg" alt="Completed Peninsula Solar residential installation" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE: BATTERY BACKUP / GENERATOR ALTERNATIVE ─────────────────── */}
      <section id="battery-backup" className="py-24 bg-[#1a2332] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl mb-4">
                <Image src="/images/electrical-panel.jpg" alt="Peninsula Solar battery storage and electrical system" fill className="object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <Image src="/images/install-5.jpg" alt="Battery storage installation" fill className="object-cover" />
                </div>
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <Image src="/images/design.jpg" alt="Peninsula Solar electrical system design" fill className="object-cover" />
                </div>
              </div>
            </div>
            <div>
              <SectionLabel>Service — Battery Backup Power</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                The Smarter Alternative to a Standby Generator
              </h2>
              <p className="text-white/75 text-lg leading-relaxed mb-6">
                Northern Michigan winters bring ice storms, downed lines, and outages that can last days. A standby generator is loud, burns fuel, needs maintenance, and requires you to be home to start it. Battery-backed solar is different — it switches automatically the second the grid fails, and it runs quietly on stored solar energy.
              </p>
              <p className="text-white/65 leading-relaxed mb-8">
                During normal operation, your system charges from solar and stores excess energy in your LFP (Lithium Iron Phosphate) battery bank. During an outage, it seamlessly takes over household loads — your heat, lights, refrigerator, and appliances keep running. Once grid power is restored, the system reconnects automatically. No fuel runs. No startup sequence. No noise.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { title: "Instant, Automatic Switchover", body: "Your home transitions to battery power in milliseconds when the grid fails — before most electronics even notice." },
                  { title: "Off-Peak Energy Purchasing", body: "Program your batteries to charge from the grid overnight at lower rates. Use that stored energy during high-cost daytime periods." },
                  { title: "LFP Batteries — Built to Last", body: "Lithium Iron Phosphate batteries have exceptional cycle life, 10-year warranties, and are safe and stable in cold Michigan climates." },
                  { title: "Generator Integration Available", body: "For extended low-solar periods, we can integrate an automatic backup generator that charges the batteries and shuts off when solar resumes." },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#f7792e]/20 border border-[#f7792e]/50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#f7792e]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm">{item.title} — </span>
                      <span className="text-white/60 text-sm">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#get-estimate" className="inline-block rounded-lg px-6 py-3 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition">
                Get a Backup Power Estimate →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE: OFF-GRID SOLAR ───────────────────────────────────────────── */}
      <section id="off-grid" className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionLabel>Service — Off-Grid Solar</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-5">
                Complete Energy Independence — No Grid Required
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                Installing an off-grid solar system means relying on the sun for essentially all of your energy needs. If you&apos;re in a remote location far from the nearest power line — a cabin, lodge, farm, or off-grid home — Peninsula Solar can design a system that gives you full, reliable power without ever connecting to the utility.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Advances in solar and battery technology have made off-grid living more accessible and affordable than ever. From cabins to schools to boats, we&apos;ve designed and installed off-grid systems across a wide range of applications. Every system includes top-of-the-line equipment with full remote monitoring so you can see exactly how your power is being produced and consumed.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Remote cabin, lodge, and farm power solutions",
                  "RV and mobile off-grid power systems",
                  "Agricultural and outbuilding electrification",
                  "Full LFP battery storage — no fuel dependency",
                  "Remote monitoring and control via integrated app",
                  "Generator integration for extended low-sun periods",
                ].map(pt => (
                  <div key={pt} className="flex items-start gap-3">
                    <Check />
                    <span className="text-gray-700 text-sm">{pt}</span>
                  </div>
                ))}
              </div>
              <a href="#get-estimate" className="inline-block rounded-lg px-6 py-3 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition">
                Get an Off-Grid System Quote →
              </a>
            </div>
            <div className="space-y-4">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <Image src="/images/offgrid-1.jpg" alt="Peninsula Solar off-grid cabin solar installation in Northern Michigan" fill className="object-cover object-center" />
              </div>
              <div className="relative h-56 rounded-xl overflow-hidden shadow">
                <Image src="/images/local.webp" alt="Peninsula Solar installation in Northern Michigan landscape" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICE: TUNDRA SOLAR RACKING ────────────────────────────────────── */}
      <section id="tundra-racking" className="py-24 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="order-2 lg:order-1 space-y-4">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <Image src="/images/tundra-racking-1.jpg" alt="Tundra Solar Racking System — Peninsula Solar's proprietary ground mount" fill className="object-cover object-center" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-44 rounded-xl overflow-hidden shadow">
                  <Image src="/images/tundra-racking-2.jpg" alt="Tundra Solar Racking post foundation detail" fill className="object-cover" />
                </div>
                <div className="relative h-44 rounded-xl overflow-hidden shadow">
                  <Image src="/images/forestville-aerial.jpg" alt="Aerial view of Peninsula Solar Forestville installation" fill className="object-cover" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionLabel>Service — Tundra Solar Racking Systems</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-5">
                Racking Built for Michigan — Not Designed in California
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                Most solar racking systems are designed for mild climates. Tundra Solar Racking was born out of frustration with mounts that couldn&apos;t handle Northern Michigan&apos;s reality: 80+ psf snow loads, extreme freeze-thaw cycles, and brutal winds. We built racking that fixes all of it.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Tundra Solar is Peninsula Solar&apos;s own proprietary racking product — designed by our installers, for our installers. Every component is engineered for faster installation, cleaner layouts, and real structural strength. Our top-of-pile clamp system lets a standard W6x9 I-beam serve as the foundation post, making material sourcing straightforward and costs predictable.
              </p>
              <div className="bg-[#1a2332] rounded-2xl p-6 mb-8">
                <h4 className="font-bold text-white mb-4">Tundra Racking Specs</h4>
                <div className="space-y-3">
                  {[
                    ["Snow Load Rating", "Engineered for 80 psf — handles Upper Peninsula winters"],
                    ["Construction", "Welded steel — not aluminum extrusions that flex and fatigue"],
                    ["Foundation", "Top-of-pile clamp accepts standard W6x9 I-beam posts"],
                    ["Certification", "Fully engineered and certified for Northern Michigan installs"],
                    ["Installation Speed", "Designed by installers for faster, cleaner layouts"],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex gap-4 text-sm">
                      <span className="text-white/50 w-36 shrink-0">{label}</span>
                      <span className="text-white/85">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="#get-estimate" className="inline-block rounded-lg px-6 py-3 text-base font-bold bg-[#f7792e] text-white hover:bg-[#e66820] transition">
                Ask About Tundra Racking →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Real Northern Michigan Homeowners</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">What Our Customers Say</h2>
            <p className="text-gray-500 text-lg mt-3 max-w-xl mx-auto">Unfiltered feedback from homeowners across the Upper Peninsula and Northern Michigan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We are very happy with Peninsula Solar from start to finish of the project and highly recommend the company for anyone looking into going solar.",
                name: "Lynn M.",
                location: "Paradise, MI",
                project: "Residential — Great Lakes Coastal Home",
                img: "/images/install-1.jpg",
              },
              {
                quote: "The workmanship of the installation was beyond what we expected. The salesman was incredibly knowledgeable, competent and trustworthy — he directed us to great products and guided us through all government incentives available to us.",
                name: "Dan P.",
                location: "Ishpeming, MI",
                project: "Residential — Metal Roof, Battery-Backed",
                img: "/images/install-2.jpg",
              },
              {
                quote: "I couldn't give you better than a 10-star rating. I mean, it's just the best. I was really blessed by you guys — I was so happy to meet you and you were always just delightful to be around.",
                name: "Pam & Tim M.",
                location: "Lake City, MI",
                project: "Small Farm — Energy Self-Sufficient",
                img: "/images/install-3.png",
              },
            ].map(t => (
              <div key={t.name} className="flex flex-col bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="relative h-52">
                  <Image src={t.img} alt={`Peninsula Solar installation — ${t.name}`} fill className="object-cover" />
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
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t.location}</p>
                    <p className="text-[#f7792e] text-xs font-medium mt-0.5">{t.project}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#1a2332]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Our Process</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Simple. Transparent. Done Right.</h2>
            <p className="text-white/60 text-lg mt-3">From your first call to flipping the switch — we handle everything.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Free Custom Design", body: "We analyze your energy usage, roof or property, and goals. You get a fully engineered system design — free, no obligation." },
              { num: "02", title: "Review & Approve", body: "We walk you through the design, pricing, tax credits, and financing options. No surprises. You approve before we order a single component." },
              { num: "03", title: "We Handle Everything", body: "Permits, equipment ordering, scheduling — our in-house licensed crew handles design through commissioning, start to finish." },
              { num: "04", title: "Power On", body: "We commission your system, walk you through monitoring, and leave you with a system built to perform for 25+ years." },
            ].map(step => (
              <div key={step.num}>
                <div className="text-6xl font-black text-[#f7792e]/15 leading-none mb-2">{step.num}</div>
                <h3 className="font-bold text-white text-base mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS / CERTIFICATIONS ────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-8">Certified & Partnered With</p>
          <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-60">
            <Image src="/images/badge-tesla.jpg" alt="Tesla Powerwall Certified Installer" width={150} height={50} className="h-10 w-auto object-contain" />
            <Image src="/images/michigan-saves.png" alt="Michigan Saves Authorized Contractor" width={120} height={60} className="h-12 w-auto object-contain" />
            <Image src="/images/badge-mi-saves.png" alt="Michigan Saves Badge" width={60} height={60} className="h-12 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA + FORM ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50" id="get-estimate-bottom">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <SectionLabel>Get Started Today</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Ready to Own Your Energy?</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Fill out the form and a Peninsula Solar specialist will reach out within 1 business day with a free, no-obligation custom solar design for your home or property.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Free, fully engineered custom system design",
                  "No pushy sales tactics — ever",
                  "Michigan Saves financing options available",
                  "30% federal tax credit guidance included",
                  "In-house crew handles permits, installation, commissioning",
                ].map(pt => (
                  <div key={pt} className="flex items-center gap-3 text-gray-700">
                    <Check />
                    <span className="text-sm">{pt}</span>
                  </div>
                ))}
              </div>
              <a href="tel:9062350340" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-.82-3.68 2 2 0 012-2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Prefer to call? <span className="font-semibold text-gray-900 ml-1">(906) 235-0340</span>
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <LeadForm title="Get Your Free Solar Estimate" subtitle="No pressure. Custom design included." />
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-3">Certified by</p>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <Image src="/images/badge-tesla.jpg" alt="Tesla Powerwall Certified Installer" width={120} height={40} className="h-8 w-auto object-contain" />
                  <Image src="/images/michigan-saves.png" alt="Michigan Saves Authorized Contractor" width={90} height={45} className="h-9 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#111b28] py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <Image src="/images/logo-white.png" alt="Peninsula Solar" width={180} height={57} className="h-9 w-auto mb-3" />
              <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                Northern Michigan&apos;s most trusted solar company. 100% in-house crews. Built for life in the North since 2011.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-white/45 text-sm">
                {[
                  ["#residential", "Residential Solar + Battery"],
                  ["#battery-backup", "Battery Backup Power"],
                  ["#off-grid", "Off-Grid Solar Systems"],
                  ["#tundra-racking", "Tundra Solar Racking"],
                ].map(([href, label]) => (
                  <li key={label}><a href={href} className="hover:text-white transition">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <div className="space-y-3 text-white/45 text-sm">
                <div>
                  <p className="text-white/70 font-medium">Marquette</p>
                  <a href="tel:9062350340" className="hover:text-white transition block">(906) 235-0340</a>
                  <p>102 W. Washington St. 232, Marquette MI 49855</p>
                </div>
                <div>
                  <p className="text-white/70 font-medium">Traverse City</p>
                  <a href="tel:2315907305" className="hover:text-white transition block">(231) 590-7305</a>
                  <p>1090 E Traverse Lake Rd, Cedar MI 49621</p>
                </div>
                <a href="mailto:sales@peninsula-solar.com" className="block hover:text-white transition">sales@peninsula-solar.com</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/25 text-xs">
            &copy; {new Date().getFullYear()} Peninsula Solar. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
