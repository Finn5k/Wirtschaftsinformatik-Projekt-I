export function CreateSessionPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold text-slate-950">
        Session erstellen
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Plane eine kurzfristige oder langfristige Sport-Session.
      </p>

      <form className="mt-6 space-y-4">
        <Input label="Titel" placeholder="z.B. Basketball 5v5" />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Sportart
          </label>
          <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Laufen</option>
            <option>Radfahren</option>
            <option>Fußball</option>
            <option>Basketball</option>
            <option>Badminton</option>
            <option>Schwimmen</option>
          </select>
        </div>

        <Input label="Datum" type="date" />
        <Input label="Uhrzeit" type="time" />
        <Input label="Location" placeholder="z.B. Campus Court Friedberg" />
        <Input label="Teilnehmerlimit" type="number" placeholder="10" />
        <Input label="Distanz optional" placeholder="z.B. 5 km" />

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Beschreibung
          </label>
          <textarea
            rows={4}
            placeholder="Beschreibe kurz, worum es geht..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white"
        >
          Session speichern
        </button>
      </form>
    </div>
  );
}

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
}

function Input({ label, placeholder, type = "text" }: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}