import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useInView } from "motion/react";
import { useHydrated } from "./useHydrated";
import "./floating-card.css";

const designs = [
  { id: "teal", name: "Deep teal" },
  { id: "mint", name: "Mint" },
  { id: "ivory", name: "Ivory" },
] as const;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const motionSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
const staticSnapshot = () => true;

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const visibilitySnapshot = () => document.visibilityState === "visible";
const hiddenSnapshot = () => false;

/** Decorative virtual-card designs; no account or card credentials are created. */
export function FloatingCard() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pointerFocus = useRef(false);
  const inView = useInView(sceneRef, { amount: 0.25 });
  const hydrated = useHydrated();
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    staticSnapshot,
  );
  const documentVisible = useSyncExternalStore(
    subscribeVisibility,
    visibilitySnapshot,
    hiddenSnapshot,
  );
  const [turn, setTurn] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = turn % designs.length;
  const motionEnabled = hydrated && !reducedMotion;
  const playing = motionEnabled && inView && documentVisible && !paused;

  useEffect(() => {
    if (!playing) return;
    // 650 ms orbit transition, followed by about 3.8 seconds of quiet floating.
    const timer = window.setTimeout(() => setTurn((value) => value + 1), 4450);
    return () => window.clearTimeout(timer);
  }, [playing, turn]);

  function selectDesign(index: number) {
    setPaused(true);
    // Continue around the same orbit when selecting across the last/first card.
    setTurn(
      (value) =>
        value +
        ((index - (value % designs.length) + designs.length) % designs.length),
    );
  }

  return (
    <div
      className="card-carousel"
      ref={sceneRef}
      role="group"
      aria-label="Virtual card designs"
      aria-roledescription="carousel"
      data-playing={playing}
      data-motion={motionEnabled}
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
      <div
        className="floating-card-scene"
        role="img"
        aria-label={`${designs[active].name} Potluck virtual card concept`}
      >
        <div className="floating-card-shadow" aria-hidden="true" />
        <div className="card-orbit-stage" aria-hidden="true">
          <div
            className="card-orbit"
            style={{ "--orbit-angle": `${turn * -120}deg` } as CSSProperties}
          >
            {designs.map((design, index) => (
              <div
                key={design.id}
                className={`card-orbit-slot card-design-${design.id}`}
                data-active={index === active}
                style={{ "--slot-angle": `${index * 120}deg` } as CSSProperties}
              >
                <div className="floating-card">
                  <div className="floating-card-back" />
                  {Array.from({ length: 10 }, (_, edge) => (
                    <div
                      className="floating-card-edge"
                      key={edge}
                      style={{ transform: `translateZ(${-edge * 0.5}px)` }}
                    />
                  ))}
                  <div className="floating-card-front">
                    <span className="floating-card-wordmark">potluck</span>
                    <div className="floating-card-name">
                      <span>Apartment crew</span>
                      <span>Virtual card concept</span>
                    </div>
                    <img
                      className="floating-card-mark"
                      src="/figma/circles.svg"
                      alt=""
                      width="32"
                      height="32"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card-design-controls">
        {designs.map((design, index) => (
          <button
            type="button"
            key={design.id}
            className={`card-design-choice choice-${design.id}`}
            aria-label={`Show ${design.name} card`}
            aria-pressed={index === active}
            onClick={() => selectDesign(index)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
        {motionEnabled && (
          <button
            type="button"
            className="card-motion-toggle"
            aria-label={paused ? "Play card animation" : "Pause card animation"}
            onClick={() => setPaused((value) => !value)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" width="14" height="14">
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
      </div>
    </div>
  );
}
