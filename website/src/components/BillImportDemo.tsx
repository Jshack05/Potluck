import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useInView } from "motion/react";
import { useHydrated } from "./useHydrated";
import "./bill-import.css";

export type ImportBill = {
  id: string;
  name: string;
  icon: string;
  amount: string;
  cadence: string;
};

type Props = {
  compact?: boolean;
  onDone?: (bills: ImportBill[]) => void;
  onClose?: () => void;
  autoPlay?: boolean;
};
type ImportStep = "import" | "choose" | "review" | "saved";
type ImportState = { step: ImportStep; selected: string[] };

// Figma's illustrative suggestions. These are never fetched bank records.
const bills: ImportBill[] = [
  {
    id: "internet",
    name: "Internet bill",
    icon: "import-internet",
    amount: "$84",
    cadence: "Likely monthly",
  },
  {
    id: "electric",
    name: "Electric",
    icon: "import-electric",
    amount: "$65–$110",
    cadence: "Likely monthly",
  },
  {
    id: "streaming",
    name: "Streaming",
    icon: "import-streaming",
    amount: "$15.99",
    cadence: "Likely monthly",
  },
];
const steps = [
  { id: "import", title: "Import", caption: "Start with your bank activity." },
  { id: "choose", title: "Choose", caption: "The bills you want to bring." },
  { id: "review", title: "Review", caption: "A moment to make sure." },
];
const initialState: ImportState = { step: "import", selected: [] };
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
const staticSnapshot = () => true;
const visibleSnapshot = () => document.visibilityState === "visible";
const hiddenSnapshot = () => false;

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="m5 10 3.3 3.3L15.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BillIdentity({ bill }: { bill: ImportBill }) {
  return (
    <>
      <span className="import-bill-icon">
        <img src={`/figma/${bill.icon}.svg`} alt="" width="28" height="28" />
      </span>
      <span className="import-bill-name">
        <strong>{bill.name}</strong>
        <small>{bill.cadence}</small>
      </span>
      <span className="import-bill-amount">
        <strong>{bill.amount}</strong>
        <small>{bill.id === "electric" ? "Observed range" : "Usually"}</small>
      </span>
    </>
  );
}

export function BillImportDemo({
  compact = false,
  onDone,
  onClose,
  autoPlay = false,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusNextStep = useRef(false);
  const headingId = useId();
  const inView = useInView(container, { amount: 0.25 });
  const hydrated = useHydrated();
  const reduced = useSyncExternalStore(
    subscribeMotion,
    reducedSnapshot,
    staticSnapshot,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    visibleSnapshot,
    hiddenSnapshot,
  );
  const [state, setState] = useState<ImportState>(() =>
    compact ? { step: "choose", selected: [] } : initialState,
  );
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const motionEnabled = hydrated && !reduced;
  const canAutoPlay = autoPlay && !compact && motionEnabled;
  const playing = canAutoPlay && !paused && inView && visible;
  const selectedBills = bills.filter((bill) =>
    state.selected.includes(bill.id),
  );

  useEffect(() => {
    if (compact) heading.current?.focus({ preventScroll: true });
  }, [compact]);

  useEffect(() => {
    if (!playing) return;
    const delay =
      state.step === "import"
        ? 4400
        : state.step === "saved"
          ? 3600
          : state.step === "review"
            ? 3000
            : state.selected.length === 0
              ? 900
              : state.selected.length === 1
                ? 700
                : 2200;
    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.step === "import") return { ...current, step: "choose" };
        if (current.step === "saved") return initialState;
        if (current.step === "review") return { ...current, step: "saved" };
        if (current.selected.length === 0)
          return { ...current, selected: ["internet"] };
        if (current.selected.length === 1)
          return { ...current, selected: ["internet", "streaming"] };
        return { ...current, step: "review" };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [playing, state]);

  useEffect(() => {
    if (!focusNextStep.current) return;
    focusNextStep.current = false;
    heading.current?.focus({ preventScroll: true });
  }, [state.step]);

  function moveTo(step: ImportStep) {
    if ((step === "review" || step === "saved") && state.selected.length === 0)
      return;
    setPaused(true);
    focusNextStep.current = true;
    setState((current) => ({ ...current, step }));
  }

  function save() {
    if (state.step !== "review" || selectedBills.length === 0) return;
    moveTo("saved");
    // Only the visitor's explicit compact save can change the surrounding demo.
    if (compact) onDone?.(selectedBills);
  }

  function reset(replay: boolean) {
    setReplay((value) => value + 1);
    focusNextStep.current = !replay;
    setState(compact ? { step: "choose", selected: [] } : initialState);
    setPaused(!replay);
  }

  const title =
    state.step === "import"
      ? "Start with your bank."
      : state.step === "choose"
        ? "Recurring charges"
        : state.step === "review"
          ? "Confirm bills"
          : "All bills";
  return (
    <div
      className={`bill-import-demo${compact ? " is-compact" : ""}`}
      ref={container}
      role="group"
      aria-label="Bill import preview"
      data-motion={motionEnabled}
      data-drop-motion={canAutoPlay}
      data-playing={playing}
      data-step={state.step}
      onPointerDownCapture={(event) => {
        if (!(
          event.target instanceof Element &&
          event.target.closest("[data-import-replay]")
        ))
          setPaused(true);
      }}
      onFocusCapture={(event) => {
        if (!(
          event.target instanceof HTMLElement &&
          event.target.dataset.importReplay
        ))
          setPaused(true);
      }}
    >
      {!compact && (
        <ol className="import-story-steps" aria-label="Import steps">
          {steps.map((step, index) => (
            <li
              key={step.id}
              aria-current={
                (state.step === "saved" ? "review" : state.step) === step.id
                  ? "step"
                  : undefined
              }
            >
              <span className="import-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.caption}</small>
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="import-demo-main">
        <div className="import-demo-toolbar">
          <span>Interactive preview · Illustrative bills</span>
          {onClose && (
            <button
              className="import-icon-button"
              type="button"
              aria-label="Close bill import"
              onClick={onClose}
            >
              <svg
                viewBox="0 0 20 20"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          {!compact && canAutoPlay && (
            <button
              className="import-icon-button"
              type="button"
              data-import-replay="true"
              aria-label={
                paused ? "Replay import preview" : "Pause import preview"
              }
              onClick={() => (paused ? reset(true) : setPaused(true))}
            >
              <svg
                viewBox="0 0 20 20"
                width="17"
                height="17"
                aria-hidden="true"
              >
                {paused ? (
                  <path d="m7 4 9 6-9 6Z" fill="currentColor" />
                ) : (
                  <path
                    d="M7 4v12m6-12v12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
        <div
          className="import-demo-surface"
          data-figma-node={
            state.step === "choose"
              ? "1052:5014"
              : state.step === "review"
                ? "1052:5015"
                : undefined
          }
        >
          <div className="import-stage" key={`${state.step}-${replay}`}>
            <div className="import-stage-heading">
              {state.step === "saved" && (
                <span className="import-success-icon">
                  <Check />
                </span>
              )}
              <h3 id={headingId} ref={heading} tabIndex={-1}>
                {title}
              </h3>
              <p>
                {state.step === "import"
                  ? "Bring your recurring bills into view."
                  : state.step === "choose"
                    ? "Choose the bills you’d like to add."
                    : state.step === "review"
                      ? "Save these bills now. Share them when you’re ready."
                      : `${selectedBills.length} ${selectedBills.length === 1 ? "bill" : "bills"} saved in this preview.`}
              </p>
            </div>
            {state.step === "import" ? (
              <div
                className="import-bank-scene"
                role="img"
                aria-label="Illustration of Internet, Electric and Streaming bills arriving from bank activity"
              >
                <div className="import-bank-source">
                  <img src="/figma/bank.svg" alt="" width="32" height="32" />
                  <div>
                    <strong>Your bank account</strong>
                    <small>Recurring activity</small>
                  </div>
                </div>
                <div className="import-drop-track" aria-hidden="true">
                  <span className="import-drop-guide" />
                  {bills.map((bill, index) => (
                    <div
                      key={bill.id}
                      className={`import-dropping-bill drop-${index}`}
                    >
                      <span className="import-bill-icon">
                        <img
                          src={`/figma/${bill.icon}.svg`}
                          alt=""
                          width="28"
                          height="28"
                        />
                      </span>
                      <strong>{bill.name}</strong>
                      <span className="import-drop-receipt" />
                    </div>
                  ))}
                </div>
                <p className="import-bank-caption">
                  Bill information, ready to choose.
                </p>
              </div>
            ) : state.step === "choose" ? (
              <fieldset className="import-bill-list">
                <legend className="import-visually-hidden">
                  Choose recurring charges
                </legend>
                {bills.map((bill) => (
                  <label
                    className="import-bill-row import-selectable"
                    key={bill.id}
                    data-selected={state.selected.includes(bill.id)}
                  >
                    <input
                      type="checkbox"
                      checked={state.selected.includes(bill.id)}
                      onChange={() => {
                        setPaused(true);
                        setState((current) => ({
                          ...current,
                          selected: current.selected.includes(bill.id)
                            ? current.selected.filter((id) => id !== bill.id)
                            : [...current.selected, bill.id],
                        }));
                      }}
                    />
                    <BillIdentity bill={bill} />
                    <span className="import-selection-mark" aria-hidden="true">
                      <Check />
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : (
              <ul
                className="import-bill-list"
                aria-label={
                  state.step === "review" ? "Selected bills" : "Saved bills"
                }
              >
                {selectedBills.map((bill) => (
                  <li className="import-bill-row" key={bill.id}>
                    <BillIdentity bill={bill} />
                    {state.step === "saved" && (
                      <span className="import-saved-mark" aria-label="Saved">
                        <Check />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="import-stage-footer">
              {state.step === "import" && (
                <button
                  className="import-primary-button"
                  type="button"
                  onClick={() => moveTo("choose")}
                >
                  Choose bills <span aria-hidden="true">→</span>
                </button>
              )}
              {state.step === "choose" && (
                <>
                  <span className="import-selection-count">
                    {state.selected.length} selected
                  </span>
                  <button
                    className="import-primary-button"
                    type="button"
                    disabled={state.selected.length === 0}
                    onClick={() => moveTo("review")}
                  >
                    Review selected <span aria-hidden="true">→</span>
                  </button>
                </>
              )}
              {state.step === "review" && (
                <>
                  <button
                    className="import-primary-button"
                    type="button"
                    onClick={save}
                  >
                    Save to All bills <span aria-hidden="true">→</span>
                  </button>
                  <button
                    className="import-text-button"
                    type="button"
                    onClick={() => moveTo("choose")}
                  >
                    Change selection
                  </button>
                </>
              )}
              {state.step === "saved" && (
                <>
                  <div className="import-share-later">
                    <strong>Share when you’re ready.</strong>
                    <span>
                      Your bills are saved. Sharing is a separate step.
                    </span>
                  </div>
                  <button
                    className="import-text-button"
                    type="button"
                    onClick={() => reset(false)}
                  >
                    Try another selection
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillImportStory() {
  const headingId = useId();
  return (
    <section
      id="import"
      className="bill-import-story section-wrap"
      aria-labelledby={headingId}
    >
      <div className="import-story-heading">
        <p className="eyebrow">A familiar place to start</p>
        <h2 id={headingId}>
          Bring your bills
          <br />
          <span>with you.</span>
        </h2>
        <p>Review your recurring charges. Choose what to add.</p>
      </div>
      <BillImportDemo autoPlay />
    </section>
  );
}
