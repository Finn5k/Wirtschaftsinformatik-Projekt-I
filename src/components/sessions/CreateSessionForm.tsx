import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const sports = [
  "Laufen",
  "Radfahren",
  "Fußball",
  "Basketball",
  "Badminton",
  "Schwimmen",
];

const ranks = [
  "Alle Level",
  "Beginner 1+",
  "Beginner 2+",
  "Beginner 3+",
  "Amateur 1+",
];

const visibilityOptions = ["Öffentlich", "Nur mit Link", "Privat"];

interface FormState {
  sportType: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  recommendedRank: string;
  visibility: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export function CreateSessionForm() {
  const [participantLimit, setParticipantLimit] = useState(15);
  const [isCreated, setIsCreated] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    sportType: "Laufen",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    recommendedRank: "Alle Level",
    visibility: "Öffentlich",
  });

  function updateForm(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function decreaseLimit() {
    setParticipantLimit((current: number) => Math.max(1, current - 1));
  }

  function increaseLimit() {
    setParticipantLimit((current: number) => Math.min(99, current + 1));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Bitte gib einen Titel ein.";
    }

    if (!form.date) {
      nextErrors.date = "Bitte wähle ein Datum aus.";
    }

    if (!form.time) {
      nextErrors.time = "Bitte wähle eine Uhrzeit aus.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Bitte gib einen Ort oder Treffpunkt an.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleCreateSession() {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsCreated(true);
  }

  if (isCreated) {
    return (
      <div className="space-y-4">
        <section className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-5 text-white shadow-lg shadow-blue-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <CheckCircle2 size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold">Session erstellt</h2>

          <p className="mt-2 text-sm leading-6 text-white/85">
            Deine Session wurde im UI-Prototyp erfolgreich erstellt. Im finalen
            System würde sie jetzt über die API gespeichert werden.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-blue-600">Vorschau</p>
          <h3 className="mt-1 text-xl font-extrabold text-slate-950">
            {form.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {form.description || "Keine Beschreibung angegeben."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <PreviewItem label="Sportart" value={form.sportType} />
            <PreviewItem label="Datum" value={form.date} />
            <PreviewItem label="Uhrzeit" value={form.time} />
            <PreviewItem label="Ort" value={form.location} />
            <PreviewItem label="Teilnehmer" value={`${participantLimit}`} />
            <PreviewItem label="Rang" value={form.recommendedRank} />
          </div>
        </section>

        <button
          type="button"
          onClick={() => setIsCreated(false)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 font-bold text-blue-600"
        >
          Zurück zum Formular
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      <FormSelect
        icon={<Zap size={18} />}
        label="Sportart"
        value={form.sportType}
        options={sports}
        onChange={(value) => updateForm("sportType", value)}
      />

      <FormInput
        icon={<FileText size={18} />}
        label="Titel"
        value={form.title}
        onChange={(value) => updateForm("title", value)}
        error={errors.title}
        placeholder="z.B. Morning Run"
      />

      <FormTextarea
        icon={<FileText size={18} />}
        label="Beschreibung"
        value={form.description}
        onChange={(value) => updateForm("description", value)}
        placeholder="Beschreibe kurz, worum es bei der Session geht..."
      />

      <FormInput
        icon={<Calendar size={18} />}
        label="Datum"
        value={form.date}
        onChange={(value) => updateForm("date", value)}
        error={errors.date}
        type="date"
      />

      <FormInput
        icon={<Clock size={18} />}
        label="Uhrzeit"
        value={form.time}
        onChange={(value) => updateForm("time", value)}
        error={errors.time}
        type="time"
      />

      <FormInput
        icon={<MapPin size={18} />}
        label="Ort / Treffpunkt"
        value={form.location}
        onChange={(value) => updateForm("location", value)}
        error={errors.location}
        placeholder="z.B. Treptower Park, Berlin"
      />

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500">
              Teilnehmerlimit
            </p>
            <p className="text-sm font-bold text-slate-950">
              Maximale Anzahl der Teilnehmer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decreaseLimit}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
            >
              <Minus size={16} />
            </button>

            <span className="w-6 text-center font-bold text-slate-950">
              {participantLimit}
            </span>

            <button
              type="button"
              onClick={increaseLimit}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <FormSelect
        icon={<Trophy size={18} />}
        label="Empfohlener Rang"
        value={form.recommendedRank}
        options={ranks}
        onChange={(value) => updateForm("recommendedRank", value)}
      />

      <FormSelect
        icon={<Eye size={18} />}
        label="Sichtbarkeit"
        value={form.visibility}
        options={visibilityOptions}
        onChange={(value) => updateForm("visibility", value)}
      />

      <div className="rounded-3xl bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">
              Hinweis zum MVP
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Die Session wird vorerst lokal als UI-Prototyp dargestellt. Die
              Backend-Anbindung folgt später über die API.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCreateSession}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 py-3.5 font-extrabold text-white shadow-lg shadow-blue-100"
      >
        Session erstellen
      </button>
    </form>
  );
}

interface FormInputProps {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}

function FormInput({
  icon,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: FormInputProps) {
  return (
    <label
      className={[
        "block rounded-3xl border bg-white p-4 shadow-sm",
        error ? "border-red-200" : "border-slate-100",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-2xl",
            error ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}

interface FormTextareaProps {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function FormTextarea({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: FormTextareaProps) {
  return (
    <label className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <textarea
            rows={3}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full resize-none bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </label>
  );
}

interface FormSelectProps {
  icon: ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FormSelect({ icon, label, value, options, onChange }: FormSelectProps) {
  return (
    <label className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none"
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </label>
  );
}

interface PreviewItemProps {
  label: string;
  value: string;
}

function PreviewItem({ label, value }: PreviewItemProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
    </div>
  );
}