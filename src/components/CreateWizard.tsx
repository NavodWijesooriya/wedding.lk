"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Loader2, Wand2 } from "lucide-react";
import { z } from "zod";
import { infoSchema } from "@/lib/site/schema";
import { buildDoc, emptyInfo } from "@/lib/site/defaults";
import type { Info, Lang } from "@/lib/site/types";
import { createSiteAction } from "@/app/actions/wedding";
import { TemplateGallery } from "@/components/TemplateGallery";
import { ScaledSite } from "@/components/site/ScaledSite";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";

const wizardSchema = infoSchema
  .refine((v) => !!(v.bride.en.trim() || v.bride.si.trim()), { path: ["bride", "en"], message: "bride" })
  .refine((v) => !!(v.groom.en.trim() || v.groom.si.trim()), { path: ["groom", "en"], message: "groom" })
  .refine((v) => !!v.date, { path: ["date"], message: "date" });

type L10nKey = "bride" | "groom" | "venueName" | "venueAddress" | "receptionName" | "receptionAddress" | "brideParents" | "groomParents" | "message" | "story";

export function CreateWizard({ initialTemplate }: { initialTemplate: string }) {
  const { t, lang: uiLang } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [tpl, setTpl] = useState(initialTemplate);
  const [cl, setCl] = useState<Lang>(uiLang); // content language being typed
  const [busy, setBusy] = useState(false);
  const form = useForm<Info>({ defaultValues: emptyInfo(), resolver: zodResolver(wizardSchema as any), mode: "onTouched" });
  const { register, handleSubmit, watch, formState: { errors } } = form;
  const values = watch();
  const draft = useMemo(() => buildDoc(JSON.parse(JSON.stringify(values)), tpl, cl), [values, tpl, cl]);

  const L = (key: L10nKey, label: string, opts: { multiline?: boolean; placeholder?: string; hint?: string } = {}) => {
    const name = `${key}.${cl}` as FieldPath<Info>;
    const other = (values as any)[key]?.[cl === "en" ? "si" : "en"];
    return (
      <div key={`${key}-${cl}`}>
        <label className="label" htmlFor={`f-${key}`}>{label}</label>
        {opts.multiline ? (
          <textarea id={`f-${key}`} rows={4} className="input" lang={cl} placeholder={opts.placeholder} {...register(name)} />
        ) : (
          <input id={`f-${key}`} className="input" lang={cl} placeholder={opts.placeholder} {...register(name)} />
        )}
        {opts.hint && <p className="hint">{opts.hint}</p>}
        {!(values as any)[key]?.[cl] && other && <p className="hint">{cl === "en" ? t("Sinhala version saved — guests who pick English will see it until you add English.", "සිංහල අනුවාදය සුරැකිණි.") : t("English version saved — guests who pick Sinhala will see it until you add Sinhala.", "ඉංග්‍රීසි අනුවාදය සුරැකිණි.")}</p>}
      </div>
    );
  };
  const needs = (k: "bride" | "groom" | "date") => (errors as any)[k] && <p className="err">{k === "date" ? t("Please choose the wedding date.", "කරුණාකර විවාහ දිනය තෝරන්න.") : t("Please enter a name (in either language).", "කරුණාකර නමක් ඇතුළත් කරන්න (ඕනෑම භාෂාවකින්).")}</p>;

  const next = handleSubmit(() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }, () => {
    toast("error", t("A few details need your attention.", "විස්තර කිහිපයක් පරීක්ෂා කරන්න."));
    document.querySelector<HTMLElement>('[aria-invalid="true"],.err')?.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  const create = async (id: string) => {
    setTpl(id);
    setBusy(true);
    const r = await createSiteAction({ info: JSON.parse(JSON.stringify(values)), template: id, lang: cl });
    if (!r.ok) { setBusy(false); return toast("error", r.error); }
    router.push("/editor");
  };

  return (
    <div>
      <ol className="mb-8 flex items-center gap-3 text-sm font-semibold" aria-label="Progress">
        {[t("Wedding details", "විවාහ විස්තර"), t("Choose a design", "සැලසුමක් තෝරන්න")].map((l, i) => (
          <li key={l} className="flex items-center gap-3" aria-current={step === i + 1 ? "step" : undefined}>
            <span className={`flex size-7 items-center justify-center rounded-full text-xs ${step > i + 1 ? "bg-sage-600 text-white" : step === i + 1 ? "bg-maroon-600 text-white" : "bg-ink-200 text-ink-500"}`}>{step > i + 1 ? <Check className="size-4" /> : i + 1}</span>
            <span className={step === i + 1 ? "text-ink-900" : "text-ink-500"}>{l}</span>
            {i === 0 && <span className="h-px w-8 bg-ink-300 sm:w-16" />}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={next} noValidate className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("Tell us about your wedding", "ඔබේ විවාහය ගැන කියන්න")}</h1>
              <p className="mt-2 text-ink-700">{t("Just the essentials — you can change everything later.", "අත්‍යවශ්‍ය දේවල් පමණක් — සියල්ල පසුව වෙනස් කළ හැක.")}</p>
            </div>
            <div className="panel-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold">{t("Typing in", "ටයිප් කරන භාෂාව")}</p>
                <p className="text-xs text-ink-500">{t("Fill in either language, or both — guests can switch.", "ඕනෑම භාෂාවකින් හෝ දෙකෙන්ම පුරවන්න — අමුත්තන්ට මාරු කළ හැක.")}</p>
              </div>
              <div className="inline-flex rounded-full border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label="Content language">
                {(["en", "si"] as const).map((l) => <button key={l} type="button" aria-pressed={cl === l} onClick={() => setCl(l)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cl === l ? "bg-maroon-600 text-white" : "text-ink-700"}`}>{l === "en" ? "English" : "සිංහල"}</button>)}
              </div>
            </div>

            <Group title={t("The couple", "යුවළ")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>{L("bride", t("Bride's name", "මනාලියගේ නම"), { placeholder: cl === "si" ? "සඳුනි" : "Sanduni" })}{needs("bride")}</div>
                <div>{L("groom", t("Groom's name", "මනාලයාගේ නම"), { placeholder: cl === "si" ? "කවීන්දු" : "Kavindu" })}{needs("groom")}</div>
              </div>
            </Group>

            <Group title={t("Date & place", "දිනය සහ ස්ථානය")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="f-date">{t("Wedding date", "විවාහ දිනය")}</label><input id="f-date" type="date" className="input" aria-invalid={!!errors.date} {...register("date")} />{needs("date")}</div>
                <div><label className="label" htmlFor="f-time">{t("Wedding time", "විවාහ වේලාව")}</label><input id="f-time" type="time" className="input" {...register("time")} /></div>
                {L("venueName", t("Wedding venue", "විවාහ ස්ථානය"), { placeholder: cl === "si" ? "මවුන්ට් ලැවීනියා හෝටලය" : "Mount Lavinia Hotel" })}
                {L("venueAddress", t("Venue address", "ලිපිනය"), { placeholder: cl === "si" ? "හෝටල් පාර, ගල්කිස්ස" : "Hotel Rd, Mount Lavinia" })}
                {L("receptionName", t("Reception venue", "සත්කාර ස්ථානය"), { hint: t("Leave empty if it's the same place.", "එම ස්ථානයමනම් හිස්ව තබන්න.") })}
                <div><label className="label" htmlFor="f-rtime">{t("Reception time", "සත්කාර වේලාව")}</label><input id="f-rtime" type="time" className="input" {...register("receptionTime")} /></div>
              </div>
            </Group>

            <Group title={t("Families", "පවුල්")}>
              <div className="grid gap-4 sm:grid-cols-2">
                {L("brideParents", t("Bride's parents", "මනාලියගේ දෙමාපියන්"), { placeholder: cl === "si" ? "ශ්‍රීමත් සහ ශ්‍රීමතී පෙරේරා" : "Mr. & Mrs. Perera" })}
                {L("groomParents", t("Groom's parents", "මනාලයාගේ දෙමාපියන්"), { placeholder: cl === "si" ? "ශ්‍රීමත් සහ ශ්‍රීමතී ප්‍රනාන්දු" : "Mr. & Mrs. Fernando" })}
              </div>
            </Group>

            <Group title={t("Your words", "ඔබේ වචන")}>
              <div className="space-y-4">
                {L("message", t("Invitation message", "ආරාධනා පණිවිඩය"), { multiline: true })}
                {L("story", t("Your love story (optional)", "ඔබේ ආදර කතාව (විකල්ප)"), { multiline: true, placeholder: cl === "si" ? "අපි මුණගැසුණු ආකාරය..." : "How you met, in a few lines…" })}
              </div>
            </Group>

            <Group title={t("Contact (optional)", "සම්බන්ධතා (විකල්ප)")}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label" htmlFor="f-phone">{t("Phone", "දුරකථන")}</label><input id="f-phone" type="tel" className="input" placeholder="+94 77 123 4567" {...register("phone")} /></div>
                <div><label className="label" htmlFor="f-wa">WhatsApp</label><input id="f-wa" type="tel" className="input" placeholder="+94771234567" {...register("whatsapp")} /><p className="hint">{t("Guests can RSVP to this number.", "අමුත්තන්ට මෙම අංකයට පිළිතුරු දිය හැක.")}</p></div>
                <div><label className="label" htmlFor="f-email">{t("Email", "ඊමේල්")}</label><input id="f-email" type="email" className="input" aria-invalid={!!errors.email} {...register("email")} />{errors.email && <p className="err">{t("Enter a valid email.", "වලංගු ඊමේල් එකක් ඇතුළත් කරන්න.")}</p>}</div>
              </div>
            </Group>

            <div className="flex justify-end">
              <button className="btn-primary btn-lg">{t("Continue to designs", "සැලසුම් වෙත")} <ArrowRight className="size-5" /></button>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-500">{t("Live preview", "සජීවී පෙරදසුන")}</p>
              <div className="mx-auto w-[260px] overflow-hidden rounded-[2rem] border-[6px] border-ink-900 bg-ink-900 shadow-lift">
                <ScaledSite doc={draft} lang={cl} width={390} ratio={1.9} maxSections={1} />
              </div>
            </div>
          </aside>
        </form>
      )}

      {step === 2 && (
        <div>
          <button className="btn-ghost mb-4 -ml-2" onClick={() => setStep(1)} disabled={busy}><ArrowLeft className="size-4" /> {t("Back to details", "විස්තර වෙත ආපසු")}</button>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("Choose your design", "ඔබේ සැලසුම තෝරන්න")}</h1>
          <p className="mb-8 mt-2 max-w-2xl text-ink-700">{t("These previews already use your names. Pick one — you can switch designs any time without losing your details.", "මෙම පෙරදසුන් දැනටමත් ඔබේ නම් භාවිතා කරයි. එකක් තෝරන්න — ඔබේ විස්තර නොගිලිහී ඕනෑම වේලාවක සැලසුම මාරු කළ හැක.")}</p>
          <div className={busy ? "pointer-events-none opacity-60" : ""}><TemplateGallery selected={tpl} base={draft} onSelect={create} /></div>
          {busy && <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-cream-50/90 backdrop-blur" role="status"><Wand2 className="size-8 text-maroon-600" /><p className="font-display text-3xl font-bold">{t("Creating your website…", "ඔබේ වෙබ් අඩවිය සාදමින්…")}</p><Loader2 className="size-5 animate-spin text-ink-500" /></div>}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="panel-card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="mb-4 font-display text-2xl font-bold text-maroon-700" aria-hidden="true">{title}</h2>
      {children}
    </fieldset>
  );
}
