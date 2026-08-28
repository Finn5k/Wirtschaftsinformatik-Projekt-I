import { KeyRound, Mail, User } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../auth/authContext";

// Anmelden / Registrieren gemäß B1 DLG-01 (UC-01) über NB-02 Supabase Auth (S1.3).
type Mode = "login" | "register";

interface FormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  // Fachliche Ablehnung bzw. technischer Fehler des Anmeldedienstes; beide
  // werden nach A08 8.5.6 unterschiedlich formuliert, aber an derselben
  // Stelle angezeigt, weil sie nicht zu einem einzelnen Feld gehören.
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit() {
    const nextErrors: FormErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
    }

    if (!password) {
      nextErrors.password = "Bitte gib ein Passwort ein.";
    } else if (isRegister && password.length < 8) {
      nextErrors.password = "Das Passwort braucht mindestens 8 Zeichen.";
    }

    if (isRegister && !displayName.trim()) {
      nextErrors.displayName = "Bitte gib einen Anzeigenamen ein.";
    }

    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = isRegister
      ? await signUp(email, password, displayName)
      : await signIn(email, password);
    setIsSubmitting(false);

    if (result.kind === "rejected") {
      // Fachliche Ablehnung: kontextbezogene Meldung, aus der hervorgeht,
      // welche Eingabe oder Aktion sie ausgelöst hat (A08 8.5.6, B1.5.3).
      if (result.code === "WEAK_PASSWORD") {
        setErrors({ password: "Das Passwort ist zu schwach. Wähle ein längeres." });
        return;
      }

      if (result.code === "INVALID_EMAIL") {
        setErrors({ email: "Diese E-Mail-Adresse wird nicht akzeptiert." });
        return;
      }

      setFormError(rejectionMessage(result.code));
      return;
    }

    if (result.kind === "failed") {
      // Technischer Fehler: allgemein verständlich, ohne interne Details,
      // mit der Möglichkeit, es erneut zu versuchen (A08 8.5.6, B1.5.4).
      setFormError(
        "Die Anmeldung ist gerade nicht möglich. Bitte versuche es erneut.",
      );
      return;
    }

    const requestedPath = searchParams.get("redirect");
    const safeRedirect =
      requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/discover";
    navigate(safeRedirect, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-200">
            LC
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-950">
            LocalCourt
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sport-Sessions in deiner Nähe finden und organisieren
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => switchMode("login")}
              className={[
                "rounded-xl py-2.5 text-sm font-bold transition",
                mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
              ].join(" ")}
            >
              Anmelden
            </button>
            <button
              type="button"
              aria-pressed={isRegister}
              onClick={() => switchMode("register")}
              className={[
                "rounded-xl py-2.5 text-sm font-bold transition",
                isRegister ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
              ].join(" ")}
            >
              Registrieren
            </button>
          </div>

          <div className="space-y-3">
            {isRegister && (
              <AuthInput
                id="display-name"
                icon={<User size={18} />}
                label="Anzeigename"
                value={displayName}
                onChange={(value) => {
                  setDisplayName(value);
                  setErrors((current) => ({ ...current, displayName: undefined }));
                }}
                error={errors.displayName}
                placeholder="z.B. Lena Aktiv"
              />
            )}

            <AuthInput
              id="email"
              icon={<Mail size={18} />}
              label="E-Mail"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              error={errors.email}
              placeholder="du@example.com"
              type="email"
            />

            <AuthInput
              id="password"
              icon={<KeyRound size={18} />}
              label="Passwort"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              error={errors.password}
              placeholder={isRegister ? "Mindestens 8 Zeichen" : "Dein Passwort"}
              type="password"
            />
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 py-3.5 font-extrabold text-white shadow-lg shadow-blue-100 disabled:opacity-60"
          >
            {isSubmitting
              ? "Einen Moment …"
              : isRegister
                ? "Konto erstellen"
                : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}

function rejectionMessage(code: string): string {
  switch (code) {
    case "INVALID_CREDENTIALS":
      // Bewusst ohne Hinweis darauf, welcher der beiden Werte falsch war.
      return "E-Mail-Adresse oder Passwort stimmt nicht.";
    case "EMAIL_ALREADY_REGISTERED":
      return "Für diese E-Mail-Adresse gibt es bereits ein Konto. Melde dich stattdessen an.";
    case "EMAIL_NOT_CONFIRMED":
      return "Dieses Konto ist noch nicht bestätigt. Öffne dazu den Link in der E-Mail, die wir dir geschickt haben.";
    default:
      return "Die Anmeldung war nicht erfolgreich.";
  }
}

interface AuthInputProps {
  id: string;
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}

function AuthInput({
  id,
  icon,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: AuthInputProps) {
  const errorId = `${id}-error`;

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
            id={id}
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
