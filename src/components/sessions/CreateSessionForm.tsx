import {
  Calendar,
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

export function CreateSessionForm() {
  const [participantLimit, setParticipantLimit] = useState(15);

  function decreaseLimit() {
    setParticipantLimit((current: number) => Math.max(1, current - 1));
  }

  function increaseLimit() {
    setParticipantLimit((current: number) => Math.min(99, current + 1));
  }

  return (
    <form className="space-y-4">
      <FormSelect icon={<Zap size={18} />} label="Sportart" options={sports} />

      <FormInput
        icon={<FileText size={18} />}
        label="Titel"
        placeholder="z.B. Morning Run"
      />

      <FormTextarea
        icon={<FileText size={18} />}
        label="Beschreibung"
        placeholder="Beschreibe kurz, worum es bei der Session geht..."
      />

      <FormInput icon={<Calendar size={18} />} label="Datum" type="date" />

      <FormInput icon={<Clock size={18} />} label="Uhrzeit" type="time" />

      <FormInput
        icon={<MapPin size={18} />}
        label="Ort / Treffpunkt"
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
        options={ranks}
      />

      <FormSelect
        icon={<Eye size={18} />}
        label="Sichtbarkeit"
        options={visibilityOptions}
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
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 py-3.5 font-extrabold text-white shadow-lg shadow-blue-100"
      >
        Session erstellen
      </button>
    </form>
  );
}

interface FormInputProps {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
  type?: string;
}

function FormInput({
  icon,
  label,
  placeholder,
  type = "text",
}: FormInputProps) {
  return (
    <label className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <input
            type={type}
            placeholder={placeholder}
            className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </label>
  );
}

interface FormTextareaProps {
  icon: React.ReactNode;
  label: string;
  placeholder?: string;
}

function FormTextarea({ icon, label, placeholder }: FormTextareaProps) {
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
            placeholder={placeholder}
            className="mt-1 w-full resize-none bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>
    </label>
  );
}

interface FormSelectProps {
  icon: React.ReactNode;
  label: string;
  options: string[];
}

function FormSelect({ icon, label, options }: FormSelectProps) {
  return (
    <label className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <select className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none">
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </label>
  );
}