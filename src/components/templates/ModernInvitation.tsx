"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarHeart, Check, ChevronDown, Clock, Heart, Loader2, MapPin, Music2, Pause, Send, Shirt, Sparkles, Users, UtensilsCrossed,
} from "lucide-react";

/* ------------------------------------------------------------------ content */
const WEDDING = {
  partnerA: "Amaya",
  partnerB: "Dilan",
  date: "2027-06-12T16:00:00+05:30",
  displayDate: "Saturday, 12 June 2027",
  tagline: "Together with their families",
  heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80",
  eventsBackdrop: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80",
  // Soft instrumental placeholder — replace with your own licensed track.
  audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
};

const STORY = [
  { date: "March 2019", title: "How We Met", text: "A rainy afternoon, a shared umbrella and a conversation that outlasted the storm.", image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=80" },
  { date: "October 2019", title: "The First Date", text: "Dinner by the sea that was meant to last an hour — we closed the restaurant down.", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80" },
  { date: "December 2025", title: "The Proposal", text: "Sunrise on a quiet hilltop, one question, and the easiest yes of her life.", image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80" },
];

const EVENTS = [
  { icon: Sparkles, name: "The Ceremony", time: "4:00 PM", venue: "Garden Terrace, Galle Face Hotel", address: "2 Galle Road, Colombo 03", dress: "Formal · Soft pastels & champagne tones", map: "https://www.google.com/maps/search/?api=1&query=Galle+Face+Hotel+Colombo" },
  { icon: Heart, name: "The Reception", time: "7:00 PM", venue: "The Grand Ballroom", address: "2 Galle Road, Colombo 03", dress: "Black tie optional", map: "https://www.google.com/maps/search/?api=1&query=Galle+Face+Hotel+Colombo" },
];

const GALLERY = [
  { src: "photo-1519225421980-715cb0215aed", alt: "Couple holding hands", h: "aspect-[3/4]" },
  { src: "photo-1469371670807-013ccf25f16a", alt: "Wedding table setting", h: "aspect-square" },
  { src: "photo-1537633552985-df8429e8048b", alt: "Bridal bouquet", h: "aspect-[4/5]" },
  { src: "photo-1465495976277-4387d4b0b4c6", alt: "First dance", h: "aspect-[4/5]" },
  { src: "photo-1460978812857-470ed1c77af0", alt: "Rings", h: "aspect-[3/4]" },
  { src: "photo-1511285560929-80b456fea0bc", alt: "Wedding flowers", h: "aspect-square" },
].map((g) => ({ ...g, url: `https://images.unsplash.com/${g.src}?auto=format&fit=crop&w=900&q=80` }));

const MEALS = ["Chicken", "Fish", "Vegetarian", "Vegan"] as const;

const HEADING = "font-['Playfair_Display',serif]";
const BODY = "font-['Inter',sans-serif]";
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap";

/* ------------------------------------------------------------------ helpers */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (now === null) return null;
    const d = Math.max(0, new Date(target).getTime() - now);
    return { days: Math.floor(d / 864e5), hours: Math.floor(d / 36e5) % 24, minutes: Math.floor(d / 6e4) % 60, seconds: Math.floor(d / 1e3) % 60, done: d === 0 };
  }, [now, target]);
}

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className={`${BODY} mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-amber-700`}>{children}</p>
);

const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="mb-14 text-center sm:mb-20">
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className={`${HEADING} text-4xl font-normal text-slate-800 sm:text-5xl lg:text-6xl`}>{title}</h2>
    <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-12 bg-amber-200" /><Heart className="size-3.5 fill-amber-200 text-amber-300" /><span className="h-px w-12 bg-amber-200" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ audio */
function AudioToggle({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = async () => {
    const a = audio.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); return; }
    try { await a.play(); setPlaying(true); } catch { setPlaying(false); }
  };
  return (
    <>
      <audio ref={audio} src={src} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button type="button" onClick={toggle} aria-pressed={playing} aria-label={playing ? "Pause background music" : "Play background music"}
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-amber-200/70 bg-white/80 py-2.5 pl-3 pr-4 text-slate-700 shadow-lg shadow-amber-900/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:bottom-8 sm:right-8">
        <span className={`relative flex size-8 items-center justify-center rounded-full bg-amber-700 text-white ${playing ? "" : "pl-0.5"}`}>
          {playing ? <Pause className="size-3.5 fill-current" /> : <Music2 className="size-3.5" />}
          {playing && <span className="absolute inset-0 animate-ping rounded-full bg-amber-700/40" />}
        </span>
        <span className={`${BODY} hidden text-xs font-medium tracking-wide sm:inline`}>{playing ? "Pause music" : "Play music"}</span>
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ hero */
function Hero() {
  const c = useCountdown(WEDDING.date);
  const units = [["Days", c?.days], ["Hours", c?.hours], ["Minutes", c?.minutes], ["Seconds", c?.seconds]] as const;
  return (
    <header className="relative isolate flex min-h-svh items-center justify-center overflow-hidden text-center text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WEDDING.heroImage} alt="" className="absolute inset-0 -z-20 size-full scale-105 object-cover" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/60 via-slate-900/35 to-slate-950/80" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(15,23,42,.45)_100%)]" />

      <div className="mx-auto w-full max-w-5xl px-6 py-24">
        <p className={`${BODY} mb-8 text-[11px] font-medium uppercase tracking-[0.4em] text-amber-100/90 sm:text-xs`}>{WEDDING.tagline}</p>
        <h1 className={`${HEADING} text-6xl font-normal leading-[0.95] tracking-tight sm:text-8xl lg:text-9xl`}>
          {WEDDING.partnerA}
          <span className="my-2 block text-3xl italic text-amber-200 sm:my-3 sm:text-5xl lg:text-6xl">&amp;</span>
          {WEDDING.partnerB}
        </h1>
        <div className="mx-auto my-10 h-px w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
        <p className={`${HEADING} text-xl italic text-amber-50 sm:text-3xl`}>{WEDDING.displayDate}</p>
        <p className={`${BODY} mt-2 text-sm font-light tracking-[0.2em] text-white/80`}>COLOMBO · SRI LANKA</p>

        <div className="mx-auto mt-12 grid max-w-xl grid-cols-4 gap-2 sm:gap-4" role="timer" aria-label="Countdown to the wedding">
          {units.map(([label, v]) => (
            <div key={label} className="rounded-2xl border border-white/20 bg-white/10 px-1 py-4 backdrop-blur-md sm:py-6">
              <div className={`${HEADING} text-3xl tabular-nums sm:text-5xl`}>{v === undefined ? "––" : String(v).padStart(2, "0")}</div>
              <div className={`${BODY} mt-1 text-[9px] font-medium uppercase tracking-[0.25em] text-amber-100/80 sm:text-[11px]`}>{label}</div>
            </div>
          ))}
        </div>
        {c?.done && <p className={`${HEADING} mt-6 text-2xl italic text-amber-100`}>Today is the day!</p>}

        <a href="#rsvp" className={`${BODY} group mt-12 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium tracking-wide text-slate-800 shadow-xl transition hover:bg-amber-50 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}>
          RSVP Now <Send className="size-4 transition group-hover:translate-x-1" />
        </a>
      </div>
      <a href="#story" aria-label="Scroll to our story" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 transition hover:text-white"><ChevronDown className="size-7 animate-bounce motion-reduce:animate-none" /></a>
    </header>
  );
}

/* ------------------------------------------------------------------ story */
function Story() {
  return (
    <section id="story" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-24 sm:py-32">
      <SectionTitle eyebrow="Our Story" title="How it all began" />
      <ol className="relative">
        <span className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-transparent via-amber-200 to-transparent md:left-1/2" aria-hidden="true" />
        {STORY.map((s, i) => {
          const right = i % 2 === 1;
          return (
            <li key={s.title} className="relative mb-16 last:mb-0 md:mb-24">
              <span className="absolute left-4 top-6 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-amber-200 bg-[#FAF9F6] text-amber-700 shadow-sm md:left-1/2" aria-hidden="true"><Heart className="size-4 fill-amber-100" /></span>
              <Reveal delay={80} className={`grid items-center gap-6 pl-14 md:grid-cols-2 md:gap-20 md:pl-0 ${right ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="group overflow-hidden rounded-3xl shadow-xl shadow-amber-900/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.title} loading="lazy" className="aspect-[4/3] size-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className={right ? "md:text-right" : "md:text-left"}>
                  <p className={`${BODY} text-[11px] font-medium uppercase tracking-[0.3em] text-amber-700`}>{s.date}</p>
                  <h3 className={`${HEADING} mt-2 text-3xl text-slate-800 sm:text-4xl`}>{s.title}</h3>
                  <p className={`${BODY} mt-4 font-light leading-relaxed text-slate-600`}>{s.text}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ events */
function Events() {
  return (
    <section id="details" className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WEDDING.eventsBackdrop} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FAF9F6]/90 via-amber-50/60 to-[#FAF9F6]/90" />
      <div className="mx-auto max-w-5xl px-6">
        <SectionTitle eyebrow="The Celebration" title="Event details" />
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {EVENTS.map((e, i) => (
            <Reveal key={e.name} delay={i * 150}>
              <article className="h-full rounded-3xl border border-white/60 bg-white/50 p-8 shadow-2xl shadow-amber-900/10 ring-1 ring-amber-200/50 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white/70 sm:p-10">
                <span className="flex size-12 items-center justify-center rounded-full border border-amber-200 bg-white/70 text-amber-700"><e.icon className="size-5" /></span>
                <h3 className={`${HEADING} mt-6 text-3xl text-slate-800`}>{e.name}</h3>
                <ul className={`${BODY} mt-6 space-y-4 text-sm font-light text-slate-700`}>
                  <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-amber-700" /><span><b className="font-medium">{e.time}</b><br />{WEDDING.displayDate}</span></li>
                  <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-amber-700" /><span><b className="font-medium">{e.venue}</b><br />{e.address}</span></li>
                  <li className="flex gap-3"><Shirt className="mt-0.5 size-4 shrink-0 text-amber-700" /><span><b className="font-medium">Dress code</b><br />{e.dress}</span></li>
                </ul>
                <a href={e.map} target="_blank" rel="noopener noreferrer" className={`${BODY} group mt-8 inline-flex items-center gap-2 rounded-full border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}>
                  <MapPin className="size-4" /> Get directions <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ rsvp */
type Form = { name: string; email: string; attending: "yes" | "no"; guests: number; meal: string; message: string };
type Errors = Partial<Record<keyof Form, string>>;
const EMPTY: Form = { name: "", email: "", attending: "yes", guests: 1, meal: "", message: "" };

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (f.attending === "yes" && !f.meal) e.meal = "Please choose a meal preference.";
  if (f.message.length > 500) e.message = "Please keep your message under 500 characters.";
  return e;
}

function Rsvp({ onSubmit }: { onSubmit?: (f: Form) => Promise<void> | void }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const errors = validate(form);
  const show = (k: keyof Form) => (touched[k] ? errors[k] : undefined);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: keyof Form) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, meal: true, message: true });
    if (Object.keys(errors).length) return;
    setStatus("sending");
    await (onSubmit ? onSubmit(form) : new Promise((r) => setTimeout(r, 900)));
    setStatus("done");
  };

  const field = (err?: string) =>
    `${BODY} w-full rounded-xl border bg-white/70 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 ${err ? "border-rose-300 focus:ring-rose-200" : "border-amber-200 focus:border-amber-400 focus:ring-amber-100"}`;
  const label = `${BODY} mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-600`;
  const Err = ({ id, msg }: { id: string; msg?: string }) => (msg ? <p id={id} role="alert" className={`${BODY} mt-1.5 text-xs text-rose-600`}>{msg}</p> : null);

  return (
    <section id="rsvp" className="mx-auto max-w-2xl scroll-mt-8 px-6 py-24 sm:py-32">
      <SectionTitle eyebrow="Kindly Reply" title="Join us" />
      <Reveal>
        <div className="rounded-3xl border border-amber-200/70 bg-white/60 p-6 shadow-2xl shadow-amber-900/10 backdrop-blur sm:p-10">
          {status === "done" ? (
            <div role="status" className="py-8 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-700 text-white shadow-lg"><Check className="size-8" /></span>
              <h3 className={`${HEADING} mt-6 text-3xl text-slate-800`}>{form.attending === "yes" ? "We can't wait to celebrate with you!" : "We'll miss you dearly"}</h3>
              <p className={`${BODY} mx-auto mt-3 max-w-sm font-light text-slate-600`}>Thank you, {form.name.split(" ")[0]}. Your response has been recorded and a confirmation is on its way to {form.email}.</p>
              <button type="button" onClick={() => { setForm(EMPTY); setTouched({}); setStatus("idle"); }} className={`${BODY} mt-8 text-sm font-medium text-amber-800 underline-offset-4 hover:underline`}>Submit another response</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="rsvp-name" className={label}>Full name *</label>
                  <input id="rsvp-name" autoComplete="name" className={field(show("name"))} placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} aria-describedby="err-name" />
                  <Err id="err-name" msg={show("name")} />
                </div>
                <div>
                  <label htmlFor="rsvp-email" className={label}>Email *</label>
                  <input id="rsvp-email" type="email" autoComplete="email" className={field(show("email"))} placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} aria-describedby="err-email" />
                  <Err id="err-email" msg={show("email")} />
                </div>
              </div>

              <fieldset>
                <legend className={label}>Will you attend? *</legend>
                <div className="grid grid-cols-2 gap-3">
                  {([["yes", "Joyfully accept"], ["no", "Regretfully decline"]] as const).map(([v, l]) => (
                    <label key={v} className="cursor-pointer">
                      <input type="radio" name="attending" value={v} checked={form.attending === v} onChange={() => set("attending", v)} className="peer sr-only" />
                      <span className={`${BODY} flex min-h-12 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 ${form.attending === v ? "border-amber-700 bg-amber-700 text-white shadow-md" : "border-amber-200 bg-white/70 text-slate-700 hover:border-amber-400"}`}>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.attending === "yes" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rsvp-guests" className={label}><Users className="mr-1.5 inline size-3.5 -translate-y-px" />Number of guests</label>
                    <select id="rsvp-guests" className={field()} value={form.guests} onChange={(e) => set("guests", Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rsvp-meal" className={label}><UtensilsCrossed className="mr-1.5 inline size-3.5 -translate-y-px" />Meal preference *</label>
                    <select id="rsvp-meal" className={field(show("meal"))} value={form.meal} onChange={(e) => set("meal", e.target.value)} onBlur={blur("meal")} aria-invalid={!!show("meal")} aria-describedby="err-meal">
                      <option value="">Select…</option>
                      {MEALS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <Err id="err-meal" msg={show("meal")} />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-end justify-between"><label htmlFor="rsvp-msg" className={label}>A note for the couple</label><span className={`${BODY} mb-2 text-[11px] text-slate-400`}>{form.message.length}/500</span></div>
                <textarea id="rsvp-msg" rows={4} className={`${field(show("message"))} resize-none`} placeholder="Share a wish, a memory or some advice…" value={form.message} onChange={(e) => set("message", e.target.value)} onBlur={blur("message")} aria-invalid={!!show("message")} aria-describedby="err-msg" />
                <Err id="err-msg" msg={show("message")} />
              </div>

              <button type="submit" disabled={status === "sending"} className={`${BODY} group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-4 text-sm font-medium tracking-wide text-white shadow-lg transition hover:bg-amber-800 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70`}>
                {status === "sending" ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <>Send RSVP <Send className="size-4 transition group-hover:translate-x-1" /></>}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ gallery */
function Gallery() {
  return (
    <section id="gallery" className="bg-white/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle eyebrow="Moments" title="Our gallery" />
        <div className="columns-2 gap-3 sm:gap-5 lg:columns-3 [&>*]:mb-3 sm:[&>*]:mb-5">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={(i % 3) * 100} className="break-inside-avoid">
              <figure className={`group relative overflow-hidden rounded-2xl shadow-lg shadow-amber-900/10 ${g.h}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt={g.alt} loading="lazy" className="size-full object-cover transition duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                <figcaption className={`${BODY} absolute bottom-3 left-4 text-xs font-light tracking-wide text-white opacity-0 transition duration-500 group-hover:opacity-100`}>{g.alt}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */
export default function ModernInvitation({ onRsvp }: { onRsvp?: (f: Form) => Promise<void> | void }) {
  return (
    <div className={`${BODY} min-h-screen scroll-smooth bg-[#FAF9F6] text-slate-800 antialiased selection:bg-amber-200/60`}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="stylesheet" href={FONTS_URL} precedence="default" />
      <AudioToggle src={WEDDING.audioSrc} />
      <Hero />
      <main>
        <Story />
        <Events />
        <Rsvp onSubmit={onRsvp} />
        <Gallery />
      </main>
      <footer className="px-6 py-16 text-center">
        <CalendarHeart className="mx-auto size-6 text-amber-700" aria-hidden="true" />
        <p className={`${HEADING} mt-4 text-3xl text-slate-800`}>{WEDDING.partnerA} <span className="italic text-amber-700">&amp;</span> {WEDDING.partnerB}</p>
        <p className="mt-2 text-xs font-light tracking-[0.3em] text-slate-500">{WEDDING.displayDate.toUpperCase()}</p>
      </footer>
    </div>
  );
}
