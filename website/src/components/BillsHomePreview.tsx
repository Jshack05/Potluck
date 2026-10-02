import { useLayoutEffect, useRef, useState } from "react";
import { AppIcon } from "./AppPreviews";
import { BillImportDemo, type ImportBill } from "./BillImportDemo";
import "./bills-home-preview.css";

type SavedBill = ImportBill & { shared: boolean };
const initialBills: SavedBill[] = [
  {
    id: "internet",
    name: "Internet bill",
    icon: "import-internet",
    amount: "$84",
    cadence: "Monthly total",
    shared: true,
  },
  {
    id: "electric",
    name: "Electric",
    icon: "import-electric",
    amount: "$46",
    cadence: "Monthly total",
    shared: true,
  },
];

export function BillsHomePreview({ onInteract }: { onInteract?: () => void }) {
  const [view, setView] = useState<"home" | "import">("home");
  const [collection, setCollection] = useState<"All bills" | "Shared">(
    "Shared",
  );
  const [bills, setBills] = useState(initialBills);
  const [saved, setSaved] = useState(false);
  const importButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (view === "home" && restoreFocus.current) {
      importButton.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [view]);

  function closeImport() {
    restoreFocus.current = true;
    setView("home");
  }
  function saveImports(imports: ImportBill[]) {
    setBills((current) => [
      ...current,
      ...imports
        .filter((bill) => !current.some((existing) => existing.id === bill.id))
        .map((bill) => ({ ...bill, shared: false })),
    ]);
    setSaved(true);
    setCollection("All bills");
    closeImport();
  }

  return (
    <div className="bills-home-preview app-preview" data-figma-node="714:2708">
      {view === "import" ? (
        <BillImportDemo compact onDone={saveImports} onClose={closeImport} />
      ) : (
        <>
          <header className="bills-home-heading">
            <h3>Bills</h3>
            <button
              ref={importButton}
              type="button"
              onClick={() => {
                onInteract?.();
                setView("import");
              }}
            >
              <img src="/figma/import.svg" alt="" width="18" height="18" />{" "}
              Import bills
            </button>
          </header>
          <div
            className="bills-collection-switch"
            role="group"
            aria-label="Bill collections"
            data-figma-node="1122:4981"
          >
            {(["All bills", "Shared"] as const).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={collection === name}
                onClick={() => {
                  onInteract?.();
                  setCollection(name);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="bills-home-intro">
            <span className="bills-home-symbol">
              <AppIcon name="bills" />
            </span>
            <h4>
              Your bills.
              <br />
              <em>Room to share.</em>
            </h4>
          </div>
          <p className="bills-home-caption" role={saved ? "status" : undefined}>
            {saved
              ? "Saved in this preview. Share when you’re ready."
              : collection === "Shared"
                ? "Shared with Apartment crew"
                : "Every saved bill, together."}
          </p>
          <ul className="bills-home-list" aria-label={`${collection} preview`}>
            {bills
              .filter((bill) => collection === "All bills" || bill.shared)
              .map((bill) => (
                <li key={bill.id} className="bills-home-row">
                  <div className="bills-home-row-title">
                    <span className="bills-home-row-icon">
                      <img src={`/figma/${bill.icon}.svg`} alt="" />
                    </span>
                    <strong>{bill.name}</strong>
                    <b>{bill.amount}</b>
                  </div>
                  <div className="bills-home-row-detail">
                    {bill.shared ? (
                      <div
                        className="bills-home-people"
                        aria-label="4 people sharing this bill"
                      >
                        {["J", "M", "T", "S"].map((letter, index) => (
                          <span
                            key={letter}
                            style={{
                              backgroundImage: `url(/figma/avatar-${["mint", "peach", "lilac", "mint"][index]}.svg)`,
                            }}
                          >
                            {letter}
                          </span>
                        ))}
                        <small>4 people</small>
                      </div>
                    ) : (
                      <a href="/bills/#sharing">
                        Share bill <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <small>{bill.cadence}</small>
                  </div>
                </li>
              ))}
          </ul>
          <p className="bills-home-footnote">
            Interactive preview · Illustrative bills
          </p>
        </>
      )}
    </div>
  );
}
