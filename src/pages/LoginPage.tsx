import { KeyRound, Mail, User } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

// Anmelden / Registrieren gemäß B1 DLG-01 (UC-01).
// UI-Prototyp: Die Prüfung übernimmt im finalen System Supabase Auth (S1, NB-02);
// hier wird nach erfolgreicher Validierung direkt weitergeleitet.
type Mode = "login" | "register";

interface FormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

export function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isRegister = mode === "register";

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setErrors({});
  }

  function handleSubmit() {
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    navigate("/discover");
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

        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
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

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 py-3.5 font-extrabold text-white shadow-lg shadow-blue-100"
          >
            {isRegister ? "Konto erstellen" : "Anmelden"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            UI-Prototyp: Die Anmeldung erfolgt im finalen System über
            Supabase Auth.
          </p>
        </div>
      </div>
    </div>
  );
}

interface AuthInputProps {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}

function AuthInput({
  icon,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: AuthInputProps) {
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
