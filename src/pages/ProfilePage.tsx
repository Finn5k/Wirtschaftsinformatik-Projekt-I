import { Check, LogOut, Mail, MapPin, Pencil, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/authContext";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { sportDisplayName, sportKeys } from "../data/sports";
import { updateCurrentUser } from "../services/userService";
import type { SportKey } from "../types/session";

// Profil gemäß B1 DLG-08 (UC-12): Anzeigename, Ort, E-Mail (read-only, Auth),
// bevorzugte Sportarten. Zustände: Ansicht / Bearbeiten.
// Level/XP/Rang, Streak, Abzeichen und Avatar-Items sind bewusst entfernt (NG-05).

const allSports: readonly SportKey[] = sportKeys;

export function ProfilePage() {
  // Nur über ProtectedRoute erreichbar (B1.5.2), also stets angemeldet.
  const { user: currentUser, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(currentUser?.name ?? "");
  const [draftCity, setDraftCity] = useState(currentUser?.city ?? "");
  const [draftSports, setDraftSports] = useState<SportKey[]>(
    currentUser?.preferredSports ?? [],
  );
  const [nameError, setNameError] = useState<string | null>(null);
  // Technischer Fehler beim Speichern (A08 8.5.6): allgemeine Meldung mit
  // Wiederholmöglichkeit, ohne interne Details.
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) {
    return null;
  }

  function startEditing() {
    setDraftName(currentUser?.name ?? "");
    setDraftCity(currentUser?.city ?? "");
    setDraftSports(currentUser?.preferredSports ?? []);
    setNameError(null);
    setIsEditing(true);
  }

  function toggleSport(sport: SportKey) {
    setDraftSports((current) =>
      current.includes(sport)
        ? current.filter((entry) => entry !== sport)
        : [...current, sport],
    );
  }

  async function saveChanges() {
    if (!draftName.trim()) {
      setNameError("Bitte gib einen Anzeigenamen ein.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    const result = await updateCurrentUser({
      name: draftName,
      city: draftCity,
      preferredSports: draftSports,
    });
    setIsSaving(false);

    if (result.kind === "failed") {
      setSaveError(
        "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      );
      return;
    }

    await refreshProfile();
    setIsEditing(false);
  }

  return (
    <div className="min-h-[780px] bg-slate-50">
      <section className="rounded-b-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 px-4 pb-8 pt-5 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">Profil</p>
            <h1 className="text-2xl font-extrabold">{currentUser.name}</h1>
          </div>

          {!isEditing && (
            <button
              type="button"
              aria-label="Profil bearbeiten"
              onClick={startEditing}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ProfileAvatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="large"
          />

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
              <MapPin size={14} />
              {currentUser.city || "Kein Ort angegeben"}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-white/85">
              <Mail size={14} />
              {currentUser.email}
            </p>
          </div>
        </div>
      </section>

      {isEditing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveChanges();
          }}
          className="space-y-4 px-4 pt-5"
        >
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="font-extrabold text-slate-950">Profil bearbeiten</h2>

            <label className="mt-4 block">
              <p className="text-xs font-semibold text-slate-500">
                Anzeigename
              </p>
              <input
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "profile-name-error" : undefined}
                value={draftName}
                onChange={(event) => {
                  setDraftName(event.target.value);
                  setNameError(null);
                }}
                className={[
                  "mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-bold text-slate-950 outline-none",
                  nameError ? "border-red-300 bg-red-50" : "border-slate-200",
                ].join(" ")}
              />
              {nameError && (
                <p
                  id="profile-name-error"
                  role="alert"
                  className="mt-2 text-xs font-bold text-red-600"
                >
                  {nameError}
                </p>
              )}
            </label>

            <label className="mt-4 block">
              <p className="text-xs font-semibold text-slate-500">
                Ort (optional)
              </p>
              <input
                value={draftCity}
                onChange={(event) => setDraftCity(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-950 outline-none"
              />
            </label>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500">
                Bevorzugte Sportarten
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allSports.map((sport) => {
                  const isSelected = draftSports.includes(sport);

                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      aria-pressed={isSelected}
                      className={[
                        "rounded-2xl px-4 py-2 text-sm font-bold transition",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {sportDisplayName(sport)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {saveError && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-700"
            >
              {saveError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-slate-700"
            >
              <X size={16} />
              Abbrechen
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold text-white disabled:opacity-60"
            >
              <Check size={16} />
              Speichern
            </button>
          </div>
        </form>
      ) : (
        <section className="px-4 pt-5">
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="font-extrabold text-slate-950">
                Bevorzugte Sportarten
              </h2>
              <p className="text-sm text-slate-500">
                Unterstützen dich bei der Suche
              </p>
            </div>

            {currentUser.preferredSports.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentUser.preferredSports.map((sport) => (
                  <span
                    key={sport}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    {sportDisplayName(sport)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Noch keine Sportarten ausgewählt.
              </p>
            )}
          </div>
        </section>
      )}

      {!isEditing && (
        <section className="px-4 pb-6 pt-5">
          <button
            type="button"
            onClick={() => {
              void signOut().then(() => {
                navigate("/login", { replace: true });
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 font-bold text-red-600 shadow-sm"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </section>
      )}
    </div>
  );
}
