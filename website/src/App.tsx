import { MotionConfig } from "motion/react";
import { SkiperLink } from "./components/SkiperLink";
import { features, normalizePath, type Feature } from "./pages";
import { Home } from "./pages/Home";
import { FeaturePage } from "./pages/FeaturePage";
import { Credits } from "./pages/Credits";

export default function App({ pathname = "/" }: { pathname?: string }) {
  const path = normalizePath(pathname);
  const feature = path.split("/")[1] as Feature;
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header section-wrap" id="top">
        <a className="wordmark" href="/" aria-label="Potluck home">
          potluck
        </a>
        <nav aria-label="Main navigation">
          {features.map((name) => (
            <a
              key={name}
              href={`/${name}/`}
              aria-current={feature === name ? "page" : undefined}
            >
              {name === "splitfinder"
                ? "Splitfinder"
                : name[0].toUpperCase() + name.slice(1)}
            </a>
          ))}
        </nav>
        <SkiperLink href="/#partners" className="header-contact">
          Partner with us
        </SkiperLink>
      </header>
      <main id="main">
        {path === "/" ? (
          <Home />
        ) : features.includes(feature) ? (
          <FeaturePage feature={feature} />
        ) : path === "/credits/" ? (
          <Credits />
        ) : (
          <section className="not-found section-wrap">
            <p className="eyebrow">404 · Page not found</p>
            <h1>Let’s get you home.</h1>
            <SkiperLink href="/">Explore Potluck</SkiperLink>
          </section>
        )}
      </main>
      <footer className="site-footer section-wrap">
        <div className="footer-top">
          <a className="wordmark" href="/">
            potluck
          </a>
          <p>Your bills. Your people. All together.</p>
          <SkiperLink href="mailto:joseph@getpotluck.app">Say hello</SkiperLink>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Potluck · In development</span>
          <div>
            <a href="/credits/">Credits</a>
            <span className="source-credit">
              Motion: <a href="https://skiper-ui.com/v1/skiper40">Skiper UI</a>
            </span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
