import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import { sportTypes } from "../../data/sports";
import { createCourt, getCourts } from "../../services/courtService";
import { reverseGeocode } from "../../services/geocodingService";
import { createSession } from "../../services/sessionService";
import { getCurrentUser } from "../../services/userService";
import type { Court, SportSession, SportType } from "../../types/session";
import { CheckInQrCode } from "./CheckInQrCode";
import {
  CourtLocationPicker,
  type CourtCoordinates,
} from "./CourtLocationPicker";

// Feldliste gemäß B1 DLG-05 (normativ): Sportart, Titel, Beschreibung (Kann),
// Datum, Uhrzeit, Dauer, Court (Auswahl oder Neuerfassung, UC-10), Teilnehmerlimit.
// "Empfohlener Rang" und "Sichtbarkeit" sind bewusst entfernt (B1.6, NG-05).

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

type FormErrors = Partial<
  Record<keyof FormState | "duration" | "newCourtLocation", string>
>;

// "rejected" und "failed" trennen die beiden Fehlerklassen aus A08 8.5.2:
// eine technisch erfolgreiche Antwort ohne verwertbaren Ort gegenüber einem
// technisch fehlgeschlagenen Aufruf. A08 8.5.6 verlangt dafür unterschiedliche
// Darstellung — kontextbezogener Hinweis gegenüber Wiederholen-Meldung.
type GeocodingStatus =
  | "idle"
  | "loading"
  | "success"
  | "rejected"
  | "failed";

function isStartInPast(date: string, time: string) {
  const startAt = new Date(`${date}T${time}`);
  return Number.isFinite(startAt.getTime()) && startAt.getTime() < Date.now();
}

export function CreateSessionForm() {
  const currentUser = getCurrentUser();
  const [participantLimit, setParticipantLimit] = useState(10);
  const [durationMin, setDurationMin] = useState(60);
  const [createdSession, setCreatedSession] = useState<SportSession | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [courtCoordinates, setCourtCoordinates] =
    useState<CourtCoordinates | null>(null);
  const [geocodingStatus, setGeocodingStatus] =
    useState<GeocodingStatus>("idle");
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [mapTilesUnavailable, setMapTilesUnavailable] = useState(false);
  const geocodingAbortController = useRef<AbortController | null>(null);

  const [form, setForm] = useState<FormState>({
    sportType: currentUser.preferredSports[0] ?? sportTypes[0],
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
  const courts = getCourts();

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
    setParticipantLimit((current) => Math.max(1, current + delta));
  }

  function changeDuration(delta: number) {
    setDurationMin((current) => Math.max(1, current + delta));
  }

  async function lookupCourtLocation(coordinates: CourtCoordinates) {
    geocodingAbortController.current?.abort();
    const abortController = new AbortController();
    geocodingAbortController.current = abortController;

    setCourtCoordinates(coordinates);
    setGeocodingStatus("loading");
    setGeocodingError(null);
    setForm((current) => ({
      ...current,
      newCourtCity: "",
      newCourtAddress: "",
    }));
    setErrors((current) => ({ ...current, newCourtLocation: undefined }));

    let result;

    try {
      result = await reverseGeocode(
        coordinates.latitude,
        coordinates.longitude,
        abortController.signal,
      );
    } catch (error) {
      // Abbruch durch einen neueren Pin — kein Fehlerfall nach A08 8.5.2.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      throw error;
    }

    if (result.kind === "ok") {
      setForm((current) => ({
        ...current,
        newCourtCity: result.data.city,
        newCourtAddress: result.data.address ?? "",
      }));
      setGeocodingStatus("success");
      return;
    }

    if (result.kind === "rejected") {
      // GEOCODING_NO_CITY: fachlich nicht verwertbares Ergebnis. Wiederholen
      // hilft hier nicht, ein versetzter Pin schon (A08 8.5.6).
      setGeocodingStatus("rejected");
      setGeocodingError(
        "Zu diesem Punkt gibt es keinen bekannten Ort. Bitte setze den Pin etwas versetzt, zum Beispiel näher an einer Straße.",
      );
      return;
    }

    // Technischer Fehler: keine internen Details anzeigen (A08 8.5.6).
    setGeocodingStatus("failed");
    setGeocodingError(
      "Der Ort konnte gerade nicht ermittelt werden. Bitte versuche es erneut.",
    );
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Bitte gib einen Titel ein.";
    }

    if (!form.date) {
      nextErrors.date = "Bitte wähle ein Datum aus.";
    } else if (form.time && isStartInPast(form.date, form.time)) {
      nextErrors.date = "Der Zeitpunkt muss in der Zukunft liegen.";
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
      if (
        !courtCoordinates ||
        geocodingStatus !== "success" ||
        !form.newCourtCity.trim()
      ) {
        nextErrors.newCourtLocation =
          "Bitte setze einen Kartenpin und warte auf die Ortsbestimmung.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleCreateSession() {
    if (!validateForm()) {
      return;
    }

    const selectedCourt = courts.find((entry) => entry.id === form.courtId);
    let court: Court;

    if (selectedCourt) {
      court = selectedCourt;
    } else {
      if (!courtCoordinates || !form.newCourtCity.trim()) {
        return;
      }

      court = createCourt({
        id: `mock-court-${crypto.randomUUID()}`,
        name: form.newCourtName.trim(),
        city: form.newCourtCity.trim(),
        address: form.newCourtAddress.trim() || undefined,
        latitude: courtCoordinates.latitude,
        longitude: courtCoordinates.longitude,
      });
    }

    const session = createSession({
      sportType: form.sportType,
      title: form.title,
      description: form.description,
      startAt: new Date(`${form.date}T${form.time}`).toISOString(),
      durationMin,
      maxParticipants: participantLimit,
      court,
    });

    setCreatedSession(session);
  }

  if (createdSession) {
    const courtLabel = `${createdSession.locationName}, ${createdSession.city}`;

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
              <CheckInQrCode
                sessionId={createdSession.id}
                pin={createdSession.pin}
                size={80}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-emerald-300">
                Check-in-Code (nur für dich als Organisator:in)
              </p>

              <div className="mt-3 flex items-center gap-2">
                <KeyRound size={18} className="text-emerald-300" />
                <span className="text-3xl font-extrabold tracking-[0.3em]">
                  {createdSession.pin}
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
          onClick={() => setCreatedSession(null)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 font-bold text-blue-600"
        >
          Weitere Session erstellen
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleCreateSession();
      }}
      className="space-y-4"
    >
      <FormSelect
        icon={<Zap size={18} />}
        label="Sportart"
        value={form.sportType}
        options={sportTypes.map((sport) => ({ value: sport, label: sport }))}
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
          ...courts.map((court) => ({
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

          <CourtLocationPicker
            coordinates={courtCoordinates}
            onSelect={lookupCourtLocation}
            onTileError={() => setMapTilesUnavailable(true)}
          />

          {mapTilesUnavailable && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800">
              Die Kartenkacheln konnten nicht vollständig geladen werden. Prüfe
              deine Verbindung und versuche es erneut.
            </p>
          )}

          {geocodingStatus === "loading" && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-blue-700"
            >
              <LoaderCircle className="animate-spin" size={16} />
              Ort und Adresse werden ermittelt …
            </p>
          )}

          {geocodingStatus === "success" && (
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-700">
                Standort ermittelt
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-950">
                {form.newCourtCity}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {form.newCourtAddress || "Keine genaue Adresse verfügbar"}
              </p>
              {courtCoordinates && (
                <p className="mt-2 text-[11px] text-slate-500">
                  {courtCoordinates.latitude.toFixed(6)}, {" "}
                  {courtCoordinates.longitude.toFixed(6)}
                </p>
              )}
            </section>
          )}

          {(geocodingStatus === "rejected" ||
            geocodingStatus === "failed") && (
            <section
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 p-4"
            >
              <p className="text-xs font-bold leading-5 text-red-700">
                {geocodingError}
              </p>
              {geocodingStatus === "failed" && courtCoordinates && (
                <button
                  type="button"
                  onClick={() => lookupCourtLocation(courtCoordinates)}
                  className="mt-3 flex items-center gap-2 text-xs font-extrabold text-red-700"
                >
                  <RefreshCw size={14} />
                  Erneut versuchen
                </button>
              )}
            </section>
          )}

          {errors.newCourtLocation && (
            <p role="alert" className="px-1 text-xs font-bold text-red-600">
              {errors.newCourtLocation}
            </p>
          )}
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
        type="submit"
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
  const inputId = useId();
  const errorId = `${inputId}-error`;

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
            id={inputId}
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="mt-1 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-xs font-bold text-red-600"
        >
          {error}
        </p>
      )}
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
  const inputId = useId();

  return (
    <label className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <textarea
            id={inputId}
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
  const inputId = useId();
  const errorId = `${inputId}-error`;

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
            id={inputId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
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

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-xs font-bold text-red-600"
        >
          {error}
        </p>
      )}
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
            aria-label={`${label} verringern`}
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
            aria-label={`${label} erhöhen`}
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
