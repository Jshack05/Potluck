import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import {
  AppIcon,
  BillsPreview,
  CardsPreview,
  CirclePreview,
  DiscoveryPreview,
} from "./AppPreviews";
import { useHydrated } from "./useHydrated";
import "./hero-phone.css";

const screens = ["Circles", "Cards", "Bills", "Splitfinder"] as const;
const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const staticSnapshot = () => true;

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

const visibilitySnapshot = () => document.visibilityState === "visible";
const hiddenSnapshot = () => false;

export function HeroPhone() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const pointerFocus = useRef(false);
  const inView = useInView(phoneRef, { amount: 0.25 });
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
  const [selection, setSelection] = useState({ index: 0, manual: false });
  const [paused, setPaused] = useState(false);
  const motionEnabled = hydrated && !reducedMotion;
  const playing = motionEnabled && inView && documentVisible && !paused;
  const active = screens[selection.index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () =>
        setSelection((current) => ({
          index: (current.index + 1) % screens.length,
          manual: false,
        })),
      selection.manual ? 30_000 : 5_000,
    );
    return () => window.clearTimeout(timer);
  }, [playing, selection]);

  function selectScreen(index: number) {
    setSelection({ index, manual: true });
    setPaused(false);
  }

  function resume() {
    setSelection((current) => ({ ...current, manual: false }));
    setPaused(false);
  }

  return (
    <div
      className="hero-phone"
      ref={phoneRef}
      role="group"
      aria-label="Potluck app screen preview"
      aria-roledescription="carousel"
      data-motion={motionEnabled}
      data-playing={playing}
      onPointerDownCapture={() => {
        pointerFocus.current = true;
      }}
      onPointerUpCapture={() => {
        pointerFocus.current = false;
      }}
      onPointerCancelCapture={() => {
        pointerFocus.current = false;
      }}
      onBlurCapture={() => {
        pointerFocus.current = false;
      }}
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        if (
          target.matches("input") ||
          (!pointerFocus.current &&
            !event.currentTarget.contains(event.relatedTarget) &&
            target.closest(".hero-screen-nav"))
        ) {
          setPaused(true);
        }
      }}
      onChangeCapture={(event) => {
        if ((event.target as HTMLElement).matches("input")) setPaused(true);
      }}
    >
      <div className="hero-phone-shell" data-screen={active.toLowerCase()}>
        <div className="hero-phone-display">
          <div
            key={active}
            className="hero-phone-screen"
            role="region"
            aria-label={`${active} screen preview`}
          >
            {active === "Circles" && <CirclePreview embedded />}
            {active === "Cards" && <CardsPreview />}
            {active === "Bills" && <BillsPreview />}
            {active === "Splitfinder" && <DiscoveryPreview />}
          </div>
        </div>
        <div className="hero-screen-nav" role="group" aria-label="App screens">
          {screens.map((name, index) => (
            <button
              key={name}
              type="button"
              aria-label={`Show ${name} screen`}
              aria-pressed={active === name}
              onClick={() => selectScreen(index)}
            >
              <AppIcon name={name.toLowerCase()} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="hero-phone-playback">
        {motionEnabled && (
          <button
            type="button"
            className="hero-phone-toggle"
            aria-label={
              paused ? "Resume screen cycling" : "Pause screen cycling"
            }
            onClick={() => (paused ? resume() : setPaused(true))}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              {paused ? (
                <path d="m5 3 8 5-8 5V3Z" />
              ) : (
                <path d="M4 3h3v10H4zm5 0h3v10H9z" />
              )}
            </svg>
            <span>{paused ? "Resume preview" : "Pause preview"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
