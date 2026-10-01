import { useRef, useState, type KeyboardEvent } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { AceternityScroll } from "./components/AceternityScroll";
import { useHydrated } from "./components/useHydrated";
import { Arrow, SkiperLink } from "./components/SkiperLink";
import {
  AppIcon,
  BillsPreview,
  CardsPreview,
  CirclePreview,
  DiscoveryPreview,
} from "./components/AppPreviews";

const tours = [
  {
    id: "splitfinder",
    name: "Splitfinder",
    number: "01",
    title: "People to\nsplit with.",
    description:
      "Find people for the spaces, subscriptions and memberships you want to share.",
    detail:
      "Start with a shared interest. See the open spots, explore the details, and find your people.",
    note: "Illustrative listings. Service eligibility and sharing rules apply. Potluck is not affiliated with the services shown.",
  },
  {
    id: "bills",
    name: "Bills",
    number: "02",
    title: "Less chasing.\nMore clarity.",
    description: "Bring the bill, the people and the agreement into one place.",
    detail:
      "The planned experience keeps everyone’s share clear. Changes that affect a contributor’s obligation need their acceptance.",
    note: "Planned financial experience, subject to provider approval and implementation. Not yet available.",
  },
  {
    id: "cards",
    name: "Cards",
    number: "03",
    title: "Shared plans.\nPurposeful spending.",
    description:
      "A planned host-controlled virtual card, connected to the people and bills it belongs to.",
    detail:
      "Contributing does not grant spending rights. Any spending access requires a separate, issuer-approved role.",
    note: "Planned financial experience, subject to provider approval and implementation. Not yet available.",
  },
];

function ProductTour() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const current = tours[active];
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tours.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + tours.length) % tours.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tours.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section
      className="product-section section-wrap"
      id="product"
      aria-labelledby="product-heading"
    >
      <div className="section-top">
        <p className="eyebrow">The Potluck experience</p>
        <span className="section-index">01 — PRODUCT</span>
      </div>
      <div className="product-title-row">
        <h2 id="product-heading">
          One place for the people
          <br />
          and plans you share.
        </h2>
        <p>
          From finding your people
          <br />
          to figuring it out together.
        </p>
      </div>
      <div
        className="product-tabs"
        role="tablist"
        aria-label="Explore Potluck features"
      >
        {tours.map((tour, index) => (
          <button
            key={tour.id}
            role="tab"
            id={`tab-${tour.id}`}
            aria-controls="product-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onTabKey(event, index)}
          >
            <AppIcon name={tour.id} />
            {tour.name}
            <span className="tab-number" aria-hidden="true">
              0{index + 1}
            </span>
          </button>
        ))}
      </div>
      <div
        id="product-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`tab-${current.id}`}
        className={`product-panel ${current.id}`}
      >
        <div className="tour-copy">
          <span className="tour-index">/{current.number}</span>
          <h3>{current.title}</h3>
          <p className="tour-description">{current.description}</p>
          <p className="tour-detail">{current.detail}</p>
          <p className="tour-note">{current.note}</p>
        </div>
        <div className="tour-stage">
          <motion.div
            key={current.id}
            initial={hydrated && !reduceMotion ? { opacity: 1, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {active === 0 ? (
              <DiscoveryPreview />
            ) : active === 1 ? (
              <BillsPreview />
            ) : (
              <CardsPreview />
            )}
          </motion.div>
          <span className="stage-caption">
            From the Potluck app · Illustrative data
          </span>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header section-wrap" id="top">
        <a className="wordmark" href="#top" aria-label="Potluck home">
          potluck
        </a>
        <nav aria-label="Main navigation">
          <a href="#product">The app</a>
          <a href="#approach">Our approach</a>
        </nav>
        <SkiperLink href="#partners" className="header-contact">
          Partner with us
        </SkiperLink>
      </header>
      <main id="main">
        <section className="hero section-wrap" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> Shared bills, made simple.
            </p>
            <h1 id="hero-heading">
              Your bills.
              <br />
              Your people.
              <br />
              <span>All together.</span>
            </h1>
            <p className="hero-description">
              Made for the people
              <br className="desktop-break" /> you share life with.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#product">
                Explore Potluck <Arrow />
              </a>
              <SkiperLink href="#partners">Building with partners</SkiperLink>
            </div>
            <div className="hero-meta">
              <span>Thoughtfully connected.</span>
              <span>Currently in development</span>
            </div>
          </div>
          <figure className="hero-figure">
            <div className="hero-halo" aria-hidden="true" />
            <AceternityScroll>
              <CirclePreview />
            </AceternityScroll>
            <figcaption>
              Potluck app preview <span>Financial features planned</span>
            </figcaption>
          </figure>
        </section>
        <div className="intro-line section-wrap">
          <p>
            Shared expenses are about <span>people first.</span>
          </p>
          <a href="#product" aria-label="Explore the Potluck product">
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <ProductTour />
        <section
          className="approach-section section-wrap"
          id="approach"
          aria-labelledby="approach-heading"
        >
          <div className="section-top">
            <p className="eyebrow">Built around people</p>
            <span className="section-index">02 — APPROACH</span>
          </div>
          <div className="approach-content">
            <h2 id="approach-heading">
              Start with your people.
              <br />
              <span>Make the plan clear.</span>
            </h2>
            <div className="approach-points">
              <div>
                <span>01</span>
                <h3>A Circle is a group.</h3>
                <p>
                  Being in a Circle does not create a financial obligation or
                  spending right.
                </p>
              </div>
              <div>
                <span>02</span>
                <h3>Agreement comes first.</h3>
                <p>
                  Contributors explicitly accept their terms. A proposed change
                  stays a proposal until accepted.
                </p>
              </div>
              <div>
                <span>03</span>
                <h3>Roles stay clear.</h3>
                <p>
                  The host controls the shared arrangement. Contributions and
                  approved spending access remain separate.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="partner-section"
          id="partners"
          aria-labelledby="partners-heading"
        >
          <div className="section-wrap">
            <div className="section-top">
              <p className="eyebrow">
                <span className="status-dot" /> Building the next chapter
              </p>
              <span className="section-index">03 — PARTNERS</span>
            </div>
            <div className="partner-main">
              <div>
                <h2 id="partners-heading">
                  A shared vision.
                  <br />
                  <span>The right partners.</span>
                </h2>
                <p>
                  We’re bringing people, shared bills and purposeful spending
                  together. We’re looking for financial partners to help make
                  that experience possible.
                </p>
                <a
                  className="primary-button light-button"
                  href="mailto:joseph@getpotluck.app?subject=Potluck%20partnership"
                >
                  Start a conversation <Arrow diagonal />
                </a>
                <span className="contact-address">joseph@getpotluck.app</span>
              </div>
              <div className="partner-details">
                <p className="partner-details-label">
                  THE INTENDED FINANCIAL FLOW
                </p>
                <ol>
                  <li>
                    <span>01</span>
                    <div>
                      <h3>Contributors agree.</h3>
                      <p>
                        Each person accepts the amount, schedule and funding
                        source.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <h3>An approved provider moves funds.</h3>
                      <p>
                        Transfers would support a host-owned arrangement under
                        the approved program.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <h3>A host-controlled card pays the bill.</h3>
                      <p>
                        Issuance, spending permissions and controls depend on
                        the issuing partner.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            <div className="provider-note">
              <span>Product status</span>
              <p>
                Potluck is in development. Financial features are not yet
                available and depend on provider and program approval. Stripe is
                our preferred financial platform where supported and approved;
                no partnership or approval is being claimed.
              </p>
            </div>
          </div>
        </section>
        <section
          className="faq-section section-wrap"
          aria-labelledby="questions-heading"
        >
          <h2 id="questions-heading">A little more clarity.</h2>
          <div className="faq-list">
            <details>
              <summary>
                Can I use Potluck today?<span aria-hidden="true">+</span>
              </summary>
              <p>
                The app is in development. The screens on this site show the
                intended experience with illustrative data. They do not open an
                account, issue a card or move money.
              </p>
            </details>
            <details>
              <summary>
                Where does Splitfinder fit?<span aria-hidden="true">+</span>
              </summary>
              <p>
                Splitfinder helps people discover others for housing,
                subscriptions and memberships. The broader vision connects
                discovery with shared bills and cards, subject to financial
                partner approval and readiness.
              </p>
            </details>
            <details>
              <summary>
                What kind of partners are you looking for?
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                We’re seeking support for approved bank-account funding,
                host-owned financial accounts, virtual card issuance and card
                controls. Eligibility, role permissions and the exact funds flow
                need to be agreed with each provider.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer section-wrap">
        <div className="footer-top">
          <a className="wordmark" href="#top">
            potluck
          </a>
          <p>Shared bills, made simple.</p>
          <SkiperLink href="mailto:joseph@getpotluck.app">Say hello</SkiperLink>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Potluck</span>
          <span>
            Motion with{" "}
            <a href="https://ui.aceternity.com/components/container-scroll-animation">
              Aceternity UI
            </a>{" "}
            & <a href="https://skiper-ui.com/v1/skiper40">Skiper UI</a>
          </span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </MotionConfig>
  );
}
