import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  MapPin,
  Minus,
  Plus,
  QrCode,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { mockCourts } from "../../data/mockCourts";
import type { SportType } from "../../types/session";

// Feldliste gemäß B1 DLG-05 (normativ): Sportart, Titel, Beschreibung (Kann),
// Datum, Uhrzeit, Dauer, Court (Auswahl oder Neuerfassung, UC-10), Teilnehmerlimit.
// "Empfohlener Rang" und "Sichtbarkeit" sind bewusst entfernt (B1.6, NG-05).

const sports: SportType[] = [
  "Laufen",
  "Radfahren",
  "Fußball",
  "Basketball",
  "Badminton",
  "Schwimmen",
];

const NEW_COURT_VALUE = "__new__";

interface FormState {
  sportType: SportType;
  title: string;
  description: string;
  date: string;
  time: string;
  courtId: string;
  newCourtName: string;
  newCourtCity: string;
  newCourtAddress: string;
}

type FormErrors = Partial<Record<keyof FormState | "duration", string>>;

function generatePin(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

export function CreateSessionForm() {
  const [participantLimit, setParticipantLimit] = useState(10);
  const [durationMin, setDurationMin] = useState(60);
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    sportType: "Laufen",
    title: "",
    description: "",
    date: "",
    time: "",
    courtId: "",
    newCourtName: "",
    newCourtCity: "",
    newCourtAddress: "",
  });

  const isNewCourt = form.courtId === NEW_COURT_VALUE;

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

  function changeLimit(delta: number) {
    setParticipantLimit((current) => Math.min(99, Math.max(1, current + delta)));
  }

  function changeDuration(delta: number) {
    setDurationMin((current) => Math.min(480, Math.max(15, current + delta)));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Bitte gib einen Titel ein.";
    }

    if (!form.date) {
      nextErrors.date = "Bitte wähle ein Datum aus.";
    } else if (form.time) {
      const startAt = new Date(`${form.date}T${form.time}`);
      if (Number.isFinite(startAt.getTime()) && startAt.getTime() < Date.now()) {
        nextErrors.date = "Der Zeitpunkt muss in der Zukunft liegen.";
      }
    }

    if (!form.time) {
      nextErrors.time = "Bitte wähle eine Uhrzeit aus.";
    }

    if (!form.courtId) {
      nextErrors.courtId = "Bitte wähle einen Sportort aus.";
    }

    if (isNewCourt) {
      if (!form.newCourtName.trim()) {
        nextErrors.newCourtName = "Bitte gib einen Namen für den Sportort ein.";
      }
      if (!form.newCourtCity.trim()) {
        nextErrors.newCourtCity = "Bitte gib einen Ort an.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleCreateSession() {
    if (!validateForm()) {
      return;
    }

    // Im finalen System: Session speichern (UC-06), Status "scheduled" (AF-03),
    // PIN/QR erzeugen (AF-04), Organisator als Teilnehmer erfassen (AF-01).
    setCreatedPin(generatePin());
  }

  if (createdPin) {
    const courtLabel = isNewCourt
      ? `${form.newCourtName}, ${form.newCourtCity}`
      : (() => {
          const court = mockCourts.find((entry) => entry.id === form.courtId);
          return court ? `${court.name}, ${court.city}` : "—";
        })();

    return (
      <div className="space-y-4">
        <section className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-5 text-white shadow-lg shadow-blue-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <CheckCircle2 size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold">Session erstellt</h2>

          <p className="mt-2 text-sm leading-6 text-white/85">
            Deine Session ist geplant. Teile QR-Code oder PIN mit deinen
            Teilnehmern für den Check-in vor Ort.
          </p>
        </section>

        <section className="rounded-3xl bg-slate-950 p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
              <QrCode size={64} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-300">
                Check-in-Code (nur für dich als Organisator:in)
              </p>

              <div className="mt-3 flex items-center gap-2">
                <KeyRound size={18} className="text-emerald-300" />
                <span className="text-3xl font-extrabold tracking-[0.3em]">
                  {createdPin}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-300">
                QR-Code und PIN bleiben für die gesamte Session gültig.
              </p>
            </div>
          </div>
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
            <PreviewItem label="Dauer" value={`${durationMin} Min.`} />
            <PreviewItem label="Sportort" value={courtLabel} />
            <PreviewItem label="Teilnehmerlimit" value={`${participantLimit}`} />
          </div>
        </section>

        <Link
          to="/discover"
          className="block w-full rounded-2xl bg-blue-600 py-3 text-center font-bold text-white"
        >
          Zum Entdecken
        </Link>

        <button
          type="button"
          onClick={() => setCreatedPin(null)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 font-bold text-blue-600"
        >
          Weitere Session erstellen
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
        options={sports.map((sport) => ({ value: sport, label: sport }))}
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
        label="Beschreibung (optional)"
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

      <StepperField
        icon={<Timer size={18} />}
        label="Dauer"
        description="Bestimmt das Session-Ende und den Check-in-Zeitraum"
        value={`${durationMin} Min.`}
        onDecrease={() => changeDuration(-15)}
        onIncrease={() => changeDuration(15)}
      />

      <FormSelect
        icon={<MapPin size={18} />}
        label="Court / Sportort"
        value={form.courtId}
        error={errors.courtId}
        placeholder="Sportort auswählen ..."
        options={[
          ...mockCourts.map((court) => ({
            value: court.id,
            label: `${court.name}, ${court.city}`,
          })),
          { value: NEW_COURT_VALUE, label: "+ Neuen Sportort anlegen" },
        ]}
        onChange={(value) => updateForm("courtId", value)}
      />

      {isNewCourt && (
        <div className="space-y-3 rounded-3xl border border-blue-100 bg-blue-50/50 p-3">
          <p className="px-1 text-xs font-bold text-blue-700">
            Neuer Sportort
          </p>

          <FormInput
            icon={<MapPin size={18} />}
            label="Name des Sportorts"
            value={form.newCourtName}
            onChange={(value) => updateForm("newCourtName", value)}
            error={errors.newCourtName}
            placeholder="z.B. Bolzplatz Nordstadt"
          />

          <FormInput
            icon={<MapPin size={18} />}
            label="Ort / Stadt"
            value={form.newCourtCity}
            onChange={(value) => updateForm("newCourtCity", value)}
            error={errors.newCourtCity}
            placeholder="z.B. Gießen"
          />

          <FormInput
            icon={<MapPin size={18} />}
            label="Adresse (optional)"
            value={form.newCourtAddress}
            onChange={(value) => updateForm("newCourtAddress", value)}
            placeholder="z.B. Nordstadtstraße 12"
          />
        </div>
      )}

      <StepperField
        icon={<Users size={18} />}
        label="Teilnehmerlimit"
        description="Du belegst als Organisator:in einen der Plätze"
        value={`${participantLimit}`}
        onDecrease={() => changeLimit(-1)}
        onIncrease={() => changeLimit(1)}
      />

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

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  icon: ReactNode;
  label: string;
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

function FormSelect({
  icon,
  label,
  value,
  options,
  onChange,
  error,
  placeholder,
}: FormSelectProps) {
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
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none"
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}

interface StepperFieldProps {
  icon: ReactNode;
  label: string;
  description: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

function StepperField({
  icon,
  label,
  description,
  value,
  onDecrease,
  onIncrease,
}: StepperFieldProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="text-sm font-bold text-slate-950">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecrease}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
          >
            <Minus size={16} />
          </button>

          <span className="w-16 text-center font-bold text-slate-950">
            {value}
          </span>

          <button
            type="button"
            onClick={onIncrease}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
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
