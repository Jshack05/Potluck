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
const duration = 8000;
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
  const complete = elapsed >= duration;
  const playing = animate && inView && visible && !paused && !complete;
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
      () => setElapsed((value) => Math.min(duration, value + 50)),
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
                  <img
                    src="/figma/lucky-celebration.svg"
                    alt=""
                    width="160"
                    height="128"
                  />
                  <span className="family-person-accent" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="family-table" aria-hidden="true" />
        <div className="family-arrangement">
          <div
            className="family-payment-card"
            role="group"
            aria-label="Family card, managed by Jordan"
          >
            <span className="family-wordmark">potluck</span>
            <AppIcon name="circles" />
            <div>
              <strong>Family card</strong>
              <span>Managed by Jordan</span>
            </div>
          </div>
          <div className="family-payment-link">
            <span>Pays this bill</span>
            <i aria-hidden="true" />
          </div>
          <div className="family-phone-bill">
            <div className="family-bill-heading">
              <AppIcon name="phone" />
              <strong>Phone bill</strong>
            </div>
            <p>
              <strong>$120</strong>
              <span>/ month</span>
            </p>
            <span className="family-bill-state">
              {ready ? "Ready to pay" : "Bringing shares together"}
            </span>
          </div>
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
          <p
            className="family-result"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {ready ? (
              <>
                <AppIcon name="check" /> Ready for the phone bill
              </>
            ) : (
              "Three agreed shares. One shared bill."
            )}
          </p>
        </div>
      </div>
      <footer className="family-story-footer">
        <a href="/splitfinder/">
          Find people to share with <span aria-hidden="true">↗</span>
        </a>
        {animate && (
          <div className="family-playback">
            {!complete && (
              <button
                type="button"
                aria-label={`${paused ? "Resume" : "Pause"} family contribution story`}
                onClick={() => setPaused((value) => !value)}
              >
                <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{" "}
                {paused ? "Resume" : "Pause"}
              </button>
            )}
            <button
              type="button"
              aria-label="Replay family contribution story"
              onClick={() => {
                setElapsed(0);
                setPaused(false);
              }}
            >
              <span aria-hidden="true">↻</span> Replay
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
