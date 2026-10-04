import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useInView } from "motion/react";
import { useHydrated } from "./useHydrated";
import { AppIcon } from "./AppPreviews";
import "./family-story.css";

// Marketing fixtures in minor units. This illustration never initiates a transfer.
const people = [
  { name: "Jordan", amount: 6000, color: "mint", x: "20%", arrival: 3000 },
  { name: "Maya", amount: 4000, color: "peach", x: "50%", arrival: 4500 },
  { name: "Sam", amount: 2000, color: "lilac", x: "80%", arrival: 6000 },
] as const;
const goal = 12000;
const duration = 10000;
const query = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", cb);
  return () => media.removeEventListener("change", cb);
}
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}
const motionSnapshot = () => window.matchMedia(query).matches;
const staticSnapshot = () => true;
const visibilitySnapshot = () => document.visibilityState === "visible";
const hiddenSnapshot = () => false;

// Derived from the approved Lucky face (Figma 1340:11945), without confetti.
function FamilyLucky({ person }: { person: string }) {
  return (
    <svg viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <path
        d="M80 129C110.376 129 135 104.376 135 74C135 43.6243 110.376 19 80 19C49.6243 19 25 43.6243 25 74C25 104.376 49.6243 129 80 129Z"
        fill="var(--lucky-fill)"
      />
      <g
        fill="none"
        stroke="#203737"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M52 71C53 62 62 62 65 70M94 70C96 62 104 62 107 71M67 84C73 97 88 98 95 84" />
        {person === "Jordan" && (
          <g strokeWidth="3.4">
            <circle cx="58" cy="69" r="16" />
            <circle cx="101" cy="69" r="16" />
            <path d="M74 68Q79 64 85 68M42 65L29 60M117 65L130 60" />
          </g>
        )}
        {person === "Maya" && (
          <path
            d="M68 26C59 5 81 5 83 23C89 1 107 11 91 29"
            fill="#82B6A1"
            stroke="#397466"
            strokeWidth="3.5"
          />
        )}
      </g>
    </svg>
  );
}

export function FamilyStory() {
  const scene = useRef<HTMLDivElement>(null);
  const inView = useInView(scene, { amount: 0.55 });
  const hydrated = useHydrated();
  const reduced = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    staticSnapshot,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    visibilitySnapshot,
    hiddenSnapshot,
  );
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const animate = hydrated && !reduced;
  const time = animate ? elapsed : duration;
  const playing = animate && inView && visible && !paused;
  const total = people.reduce(
    (sum, person) => sum + (time >= person.arrival ? person.amount : 0),
    0,
  );
  const ready = total === goal;

  useEffect(() => {
    if (!playing) return;
    // One clock drives tokens, character gestures and totals together. Pauses
    // preserve elapsed time; background/offscreen time cannot advance the story.
    const timer = window.setInterval(
      () => setElapsed((value) => (value + 50) % duration),
      50,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <section
      className="family-story section-wrap"
      id="together"
      aria-labelledby="family-story-heading"
    >
      <header className="family-story-heading">
        <p className="family-eyebrow">A little from each of us.</p>
        <h2 id="family-story-heading">
          Everyone brings <span>their part.</span>
        </h2>
        <p>Your people contribute toward the bills you share.</p>
      </header>
      <div
        className="family-scene"
        ref={scene}
        data-playing={playing}
        data-ready={ready}
      >
        <div className="family-circle-label">
          <AppIcon name="circles" /> Family Circle
        </div>
        <div
          className="family-people"
          role="group"
          aria-label="Illustrative agreed contributions"
        >
          {people.map((person) => {
            const progress = Math.max(
              0,
              Math.min(1, (time - (person.arrival - 1350)) / 1350),
            );
            const lean = Math.sin(progress * Math.PI);
            return (
              <div
                className={`family-person family-${person.color}`}
                key={person.name}
              >
                <div className="family-share">
                  <span>{person.name}</span>
                  <strong>${person.amount / 100}</strong>
                </div>
                <div
                  className="family-lucky"
                  style={{
                    transform: `translateY(${lean * 7}px) rotate(${lean * -4}deg)`,
                  }}
                >
                  <FamilyLucky person={person.name} />
                </div>
              </div>
            );
          })}
        </div>
        {animate && (
          <div className="family-token-layer" aria-hidden="true">
            {people.map((person) => {
              const travel = Math.max(
                0,
                Math.min(1, (time - (person.arrival - 1350)) / 1350),
              );
              return (
                <span
                  key={person.name}
                  className={`family-token family-${person.color}`}
                  style={
                    {
                      "--from-x": person.x,
                      "--travel": travel,
                      opacity: travel > 0 && travel < 1 ? 1 : 0,
                    } as CSSProperties
                  }
                >
                  ${person.amount / 100}
                </span>
              );
            })}
          </div>
        )}
        <div className="family-phone-bill">
          <div className="family-bill-top">
            <div className="family-bill-heading">
              <span className="family-phone-icon">
                <AppIcon name="phone" />
              </span>
              <div>
                <strong>Phone bill</strong>
                <span>Shared by your Family Circle</span>
              </div>
            </div>
            <p className="family-bill-amount">
              <strong>$120</strong>
              <span>/ month</span>
            </p>
          </div>
          <div className="family-funding">
            <div className="family-funding-copy">
              <span>Set aside for this bill</span>
              <strong>
                ${total / 100} <span>of $120</span>
              </strong>
            </div>
            <div
              className="family-meter"
              role="progressbar"
              aria-label="Set aside for the phone bill"
              aria-valuemin={0}
              aria-valuemax={120}
              aria-valuenow={total / 100}
              aria-valuetext={`$${total / 100} of $120 set aside for the phone bill`}
            >
              {people.map((person) => (
                <span
                  key={person.name}
                  className={`family-${person.color}`}
                  style={{ width: `${(person.amount / goal) * 100}%` }}
                  data-funded={time >= person.arrival}
                />
              ))}
            </div>
            <p className="family-result">
              {ready ? (
                <>
                  <AppIcon name="check" /> Ready for the phone bill
                </>
              ) : (
                "Three agreed shares. One shared bill."
              )}
            </p>
          </div>
          <div
            className="family-payment-card"
            role="group"
            aria-label="Family card, managed by Jordan"
          >
            <div className="family-mini-card" aria-hidden="true">
              <span>potluck</span>
              <AppIcon name="circles" />
            </div>
            <div className="family-card-copy">
              <span>Payment card</span>
              <strong>Family card</strong>
              <span>Managed by Jordan</span>
            </div>
          </div>
        </div>
      </div>
      <footer className="family-story-footer">
        <a href="/splitfinder/">
          Find people to share with <span aria-hidden="true">↗</span>
        </a>
        {animate && (
          <div className="family-playback">
            <button
              type="button"
              aria-label={`${paused ? "Resume" : "Pause"} family contribution story`}
              onClick={() => setPaused((value) => !value)}
            >
              <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{" "}
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        )}
        <p>
          Illustrative contributions · Planned financial experience, subject to
          provider approval.
        </p>
      </footer>
    </section>
  );
}
