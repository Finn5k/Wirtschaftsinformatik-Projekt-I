import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { CreateSessionForm } from "../components/sessions/CreateSessionForm";

export function CreateSessionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[780px] bg-slate-50 px-4 py-5">
      <header className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-blue-600">Neue Session</p>
          <h1 className="text-lg font-extrabold text-slate-950">
            Session erstellen
          </h1>
        </div>

        <div className="h-10 w-10" />
      </header>

      <CreateSessionForm />
    </div>
  );
}
