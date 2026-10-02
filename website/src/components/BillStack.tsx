import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useInView } from "motion/react";
import { AppIcon } from "./AppPreviews";
import { useHydrated } from "./useHydrated";
import "./bill-stack.css";

// Illustrative totals and people, not service prices or active agreements.
const examples = [
  {
    name: "Netflix",
    icon: "netflix",
    amount: "$24",
    period: "Monthly total",
    people: 3,
  },
  {
    name: "Sam’s Club",
    icon: "cards",
    amount: "$60",
    period: "Yearly total",
    people: 2,
  },
  {
    name: "Phone bill",
    icon: "phone",
    amount: "$120",
    period: "Monthly total",
    people: 4,
  },
];
const people = [
  { name: "Jordan", image: "bill-person-jordan.png", initial: "" },
  { name: "Maya", image: "avatar-mint.svg", initial: "M" },
  { name: "Taylor", image: "avatar-peach.svg", initial: "T" },
  { name: "Sam", image: "avatar-lilac.svg", initial: "S" },
];
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
const staticSnapshot = () => true;
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const visibleSnapshot = () => document.visibilityState === "visible";
const hiddenSnapshot = () => false;

export function BillStack() {
  const container = useRef<HTMLDivElement>(null);
  const pointerFocus = useRef(false);
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
  const [head, setHead] = useState(0);
  const [paused, setPaused] = useState(false);
  const motionEnabled = hydrated && !reduced;
  const playing = motionEnabled && visible && inView && !paused;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setHead((value) => value + 1), 4400);
    return () => window.clearTimeout(timer);
  }, [playing, head]);

  return (
    <div
      className="bill-stack"
      ref={container}
      role="group"
      aria-label="Example shared bills"
      aria-roledescription="carousel"
      data-motion={motionEnabled}
      data-playing={playing}
      onPointerDownCapture={() => {
        pointerFocus.current = true;
      }}
      onPointerUpCapture={() => {
        pointerFocus.current = false;
      }}
      onPointerCancel={() => {
        pointerFocus.current = false;
      }}
      onFocusCapture={(event) => {
        if (
          !pointerFocus.current &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setPaused(true);
      }}
      onBlurCapture={() => {
        pointerFocus.current = false;
      }}
    >
      <div className="bill-stack-heading">
        <AppIcon name="circles" />
        <span>Shared bills</span>
        <span>3 examples</span>
      </div>
      <div className="bill-stack-window" aria-live="off">
        {[-1, 0, 1, 2].map((position) => {
          const index = head + position;
          const bill =
            examples[
              ((index % examples.length) + examples.length) % examples.length
            ];
          const shown = position === 0 || position === 1;
          return (
            <article
              className="showcase-bill"
              key={index}
              aria-label={`${bill.name} example bill`}
              aria-hidden={!shown}
              data-shown={shown}
              style={{ "--bill-position": position } as CSSProperties}
            >
              <div className="showcase-bill-identity">
                <span className={`bill-icon example-icon-${bill.icon}`}>
                  <AppIcon name={bill.icon} />
                </span>
                <strong>{bill.name}</strong>
                <span className="showcase-bill-total">
                  <b>{bill.amount}</b>
                  <small>{bill.period}</small>
                </span>
              </div>
              <div
                className="showcase-bill-people"
                role="group"
                aria-label={`${bill.people} people sharing ${bill.name}`}
              >
                <div className="bill-avatar-stack">
                  {people.slice(0, bill.people).map((person) => (
                    <span className="bill-avatar" key={person.name}>
                      <img
                        src={`/figma/${person.image}`}
                        alt=""
                        width="34"
                        height="34"
                      />
                      {person.initial && (
                        <b aria-hidden="true">{person.initial}</b>
                      )}
                    </span>
                  ))}
                </div>
                <span>{bill.people} people</span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="bill-stack-controls">
        <span>Illustrative totals</span>
        {motionEnabled && (
          <button
            type="button"
            aria-label={paused ? "Play bill animation" : "Pause bill animation"}
            onClick={() => setPaused((value) => !value)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              {paused ? (
                <path d="M5 3.5 12 8l-7 4.5Z" fill="currentColor" />
              ) : (
                <path
                  d="M5.5 3.5v9m5-9v9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
            </svg>
          </button>
        )}
        <button
          type="button"
          aria-label="Show next bills"
          onClick={() => {
            setPaused(true);
            setHead((value) => value + 1);
          }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path
              d="m4 6 4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
