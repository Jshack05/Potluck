import { AppIcon } from "../components/AppPreviews";
import { AceternityScroll } from "../components/AceternityScroll";
import { HeroPhone } from "../components/HeroPhone";
import { FamilyStory } from "../components/FamilyStory";
import { ProductVisual } from "../components/ProductVisuals";
import { Arrow, SkiperLink } from "../components/SkiperLink";
import { financialNotice, type Feature } from "../pages";

const products: { id: Feature; name: string; line: string; accent: string }[] =
  [
    {
      id: "splitfinder",
      name: "Splitfinder",
      line: "People to",
      accent: "split with.",
    },
    {
      id: "cards",
      name: "Cards",
      line: "Shared plans.",
      accent: "Purposeful spending.",
    },
    {
      id: "bills",
      name: "Bills",
      line: "Less chasing.",
      accent: "More clarity.",
    },
    {
      id: "circles",
      name: "Circles",
      line: "Your people.",
      accent: "All together.",
    },
  ];

export function Home() {
  return (
    <>
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
          <a className="primary-button" href="#product">
            Explore Potluck <Arrow />
          </a>
          <p className="hero-status">In development. Made for sharing.</p>
        </div>
        <figure className="hero-figure">
          <div className="hero-halo" aria-hidden="true" />
          <AceternityScroll>
            <HeroPhone />
          </AceternityScroll>
          <figcaption>App preview · Financial features planned</figcaption>
        </figure>
      </section>
      <section
        className="product-section section-wrap"
        id="product"
        aria-labelledby="product-heading"
      >
        <div className="section-heading">
          <h2 id="product-heading">
            A little more <span>together.</span>
          </h2>
          <span>Explore Potluck</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className={`product-tile ${product.id}`} key={product.id}>
              <div className="tile-copy">
                <div className="product-name">
                  <AppIcon name={product.id} />
                  <h3>{product.name}</h3>
                </div>
                <p className="tile-promise">
                  {product.line}
                  <br />
                  <span>{product.accent}</span>
                </p>
                {product.id === "bills" && (
                  <p className="tile-import-line">
                    Bring your current bills with you.
                  </p>
                )}
                <SkiperLink href={`/${product.id}/`}>
                  Explore {product.name}
                </SkiperLink>
              </div>
              <div className="tile-art">
                <ProductVisual feature={product.id} />
              </div>
              <p className="tile-status">
                {product.id === "splitfinder"
                  ? "Illustrative listings · Sharing rules apply"
                  : "Planned experience"}
              </p>
            </article>
          ))}
        </div>
        <p className="availability-note">
          {financialNotice} All app visuals use illustrative data.
        </p>
      </section>
      <FamilyStory />
      <section
        className="partner-section section-wrap"
        id="partners"
        aria-labelledby="partners-heading"
      >
        <div className="partner-icons" aria-hidden="true">
          {["circles", "bills", "cards"].map((icon) => (
            <span key={icon}>
              <AppIcon name={icon} />
            </span>
          ))}
        </div>
        <p className="eyebrow">Building with partners</p>
        <h2 id="partners-heading">
          A shared vision.
          <br />
          <span>The right partners.</span>
        </h2>
        <p className="partner-intro">
          Let’s bring people, bills and purposeful spending together.
        </p>
        <a
          className="primary-button light-button"
          href="mailto:joseph@getpotluck.app?subject=Potluck%20partnership"
        >
          Start a conversation <Arrow diagonal />
        </a>
        <details className="partner-details">
          <summary>
            For card, banking & payment partners{" "}
            <span aria-hidden="true">+</span>
          </summary>
          <div>
            <p>
              Our intended flow: contributors accept their terms → an approved
              provider transfers funds to a host-owned arrangement → a
              host-controlled card pays the bill.
            </p>
            <p>
              We’re seeking support for bank-account funding, virtual cards and
              card controls. Stripe is our preferred financial platform where
              supported and approved; no partnership or approval is claimed.
            </p>
            <p>
              Financial features are not yet available. Program eligibility,
              ownership, permissions and the funds flow require provider
              approval.
            </p>
          </div>
        </details>
      </section>
    </>
  );
}
