import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useInView } from "motion/react";
import { useHydrated } from "./useHydrated";
import "./floating-card.css";

const designs = [
  { id: "teal", name: "Deep teal" },
  { id: "mountains", name: "Mountains" },
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
  const [interaction, setInteraction] = useState<
    "idle" | "dragging" | "coasting" | "settling"
  >("idle");
  const [dwell, setDwell] = useState(4450);
  const position = useRef(0);
  const velocity = useRef(0);
  const coastElapsed = useRef(0);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    lastX: number;
    time: number;
    axis: "pending" | "horizontal" | "vertical";
    width: number;
  } | null>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const active =
    ((Math.round(turn) % designs.length) + designs.length) % designs.length;
  const motionEnabled = hydrated && !reducedMotion;
  const playing =
    motionEnabled &&
    inView &&
    documentVisible &&
    !paused &&
    interaction === "idle";

  useEffect(() => {
    if (!playing) return;
    // 650 ms orbit transition, followed by about 3.8 seconds of quiet floating.
    const timer = window.setTimeout(() => {
      position.current = Math.round(position.current) + 1;
      setTurn(position.current);
      setDwell(4450);
    }, dwell);
    return () => window.clearTimeout(timer);
  }, [playing, turn, dwell]);

  // Frame-time damping keeps swipe momentum consistent across refresh rates.
  useEffect(() => {
    if (interaction !== "coasting") return;
    let frame = 0;
    let previous: number | undefined;
    function tick(now: number) {
      if (previous === undefined) previous = now;
      const dt = Math.min(now - previous, 40);
      previous = now;
      if (!motionEnabled) {
        position.current = Math.round(position.current);
        setTurn(position.current);
        setInteraction("idle");
        return;
      }
      const decay = Math.exp(-dt / 420);
      position.current += velocity.current * 420 * (1 - decay);
      velocity.current *= decay;
      coastElapsed.current += dt;
      if (
        coastElapsed.current >= 2000 ||
        Math.abs(velocity.current) < 0.00004
      ) {
        position.current = Math.round(position.current);
        setTurn(position.current);
        setInteraction("settling");
        return;
      }
      setTurn(position.current);
      frame = requestAnimationFrame(tick);
    }
    if (inView && documentVisible) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [interaction, motionEnabled, inView, documentVisible]);

  useEffect(() => {
    if (interaction !== "settling") return;
    const timer = window.setTimeout(
      () => setInteraction("idle"),
      motionEnabled ? 650 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [interaction, motionEnabled]);

  function settle() {
    gesture.current = null;
    velocity.current = 0;
    position.current = Math.round(position.current);
    setTurn(position.current);
    setDwell(3000);
    setInteraction("settling");
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.isPrimary === false || gesture.current)
      return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    // Grab the rendered angle even during an automatic transition.
    if (orbitRef.current && typeof DOMMatrixReadOnly !== "undefined") {
      const matrix = new DOMMatrixReadOnly(
        getComputedStyle(orbitRef.current).transform,
      );
      const rendered =
        (-Math.atan2(matrix.m31, matrix.m11) * 180) / Math.PI / 120;
      position.current =
        rendered + Math.round((position.current - rendered) / 3) * 3;
    }
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: performance.now(),
      axis: "pending",
      width: event.currentTarget.getBoundingClientRect().width || 360,
    };
    velocity.current = 0;
    setTurn(position.current);
    setInteraction("dragging");
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    if (g.axis === "pending") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      if (g.axis === "horizontal")
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (g.axis !== "horizontal") return;
    event.preventDefault();
    const now = performance.now();
    const delta = (-(event.clientX - g.lastX) / g.width) * 1.5;
    velocity.current = Math.max(
      -0.004,
      Math.min(0.004, delta / Math.max(8, now - g.time)),
    );
    position.current += delta;
    g.lastX = event.clientX;
    g.time = now;
    setTurn(position.current);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setDwell(3000);
    if (
      cancelled ||
      g.axis !== "horizontal" ||
      !motionEnabled ||
      performance.now() - g.time > 120
    ) {
      settle();
    } else {
      coastElapsed.current = 0;
      setInteraction("coasting");
    }
  }

  function selectDesign(index: number) {
    gesture.current = null;
    setPaused(true);
    setInteraction("idle");
    // Continue around the same orbit when selecting across the last/first card.
    const nearest = Math.round(position.current);
    position.current =
      nearest +
      ((index - (nearest % designs.length) + designs.length) % designs.length);
    setTurn(position.current);
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
      data-interaction={interaction}
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
        ) {
          settle();
          setPaused(true);
        }
      }}
      onBlurCapture={() => {
        pointerFocus.current = false;
      }}
    >
      <div
        className="floating-card-scene"
        onPointerDown={beginDrag}
        onPointerMove={drag}
        onPointerUp={(event) => endDrag(event)}
        onPointerCancel={(event) => endDrag(event, true)}
        onLostPointerCapture={(event) => endDrag(event, true)}
        onDragStart={(event) => event.preventDefault()}
        role="img"
        aria-label={`${designs[active].name} Potluck virtual card concept`}
      >
        <div className="floating-card-shadow" aria-hidden="true" />
        <div className="card-orbit-stage" aria-hidden="true">
          <div
            className="card-orbit"
            ref={orbitRef}
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
            onClick={() => {
              if (!paused && interaction !== "idle") settle();
              setPaused((value) => !value);
            }}
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
