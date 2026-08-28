import { useCallback, useEffect, useState } from "react";
import type { Failed, Ok } from "../types/result";

// Lade- und Fehlerzustand für lesende Servicezugriffe (B1.5.4).
//
// B1.5.4 verlangt für jede Anfrage eine Ladeanzeige und bei einem Netzwerk-
// oder Serverfehler eine nicht-blockierende Meldung mit Wiederholmöglichkeit,
// wobei der Datenstand unverändert bleibt. Diese Regel gilt für alle
// Dialogseiten gleich; sie hier einmal zu fassen verhindert, dass jede Seite
// ihre eigene Variante bekommt.
//
// Unterschieden werden nur Laden, Erfolg und technischer Fehler. Eine fachliche
// Ablehnung kommt auf dem Lesepfad nicht vor — sie entsteht erst bei den
// Fachoperationen (A08 8.5.2) und wird dort von der jeweiligen Seite behandelt.

export type LoadState<TData> =
  | { status: "loading" }
  | { status: "ok"; data: TData }
  | { status: "failed" };

export interface LoadedData<TData> {
  state: LoadState<TData>;
  /** Erneut laden — die Wiederholmöglichkeit aus B1.5.4. */
  reload: () => void;
}

export function useLoadedData<TData>(
  load: () => Promise<Ok<TData> | Failed>,
  dependencies: readonly unknown[],
): LoadedData<TData> {
  const [versuch, setVersuch] = useState(0);
  const schluessel = `${JSON.stringify(dependencies)}#${versuch}`;

  // Das Ergebnis wird zusammen mit dem Schlüssel abgelegt, zu dem es gehört.
  // Der Ladezustand ergibt sich daraus, dass noch kein Ergebnis zum aktuellen
  // Schlüssel vorliegt — er muss deshalb nicht im Effekt gesetzt werden, was
  // eine zusätzliche Renderrunde je Abhängigkeitswechsel spart.
  const [eintrag, setEintrag] = useState<{
    schluessel: string;
    state: LoadState<TData>;
  } | null>(null);

  const reload = useCallback(() => {
    setVersuch((current) => current + 1);
  }, []);

  useEffect(() => {
    let aktiv = true;

    void load().then((result) => {
      if (!aktiv) {
        return;
      }

      setEintrag({
        schluessel,
        state:
          result.kind === "ok"
            ? { status: "ok", data: result.data }
            : { status: "failed" },
      });
    });

    return () => {
      aktiv = false;
    };
    // Die Ladefunktion wird von den Seiten als Inline-Funktion übergeben und
    // entsteht bei jedem Rendern neu; als Abhängigkeit würde sie eine
    // Endlosschleife auslösen. Maßgeblich ist der Schlüssel aus den fachlichen
    // Abhängigkeiten, die der Aufrufer nennt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel]);

  return {
    state:
      eintrag?.schluessel === schluessel ? eintrag.state : { status: "loading" },
    reload,
  };
}
