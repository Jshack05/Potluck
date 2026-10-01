import {
  AppIcon,
  BillsPreview,
  CirclePreview,
  DiscoveryPreview,
} from "../components/AppPreviews";
import { AceternityScroll } from "../components/AceternityScroll";
import {
  AgreementVisual,
  BillStack,
  CircleCluster,
  JoinVisual,
  ProductVisual,
  RolesVisual,
  SpotsVisual,
} from "../components/ProductVisuals";
import { SkiperLink } from "../components/SkiperLink";
import {
  features,
  financialNotice,
  sampleNotice,
  type Feature,
} from "../pages";

const copy = {
  splitfinder: {
    name: "Splitfinder",
    first: "People to",
    last: "split with.",
    sub: "Find people for the things you want to share.",
  },
  cards: {
    name: "Cards",
    first: "Shared plans.",
    last: "Purposeful spending.",
    sub: "A planned virtual card, connected to your shared life.",
  },
  bills: {
    name: "Bills",
    first: "Less chasing.",
    last: "More clarity.",
    sub: "The bill. The people. The agreement. All in one place.",
  },
  circles: {
    name: "Circles",
    first: "Your people.",
    last: "All together.",
    sub: "A place for the groups you share life with.",
  },
};

function FeatureHeroVisual({ feature }: { feature: Feature }) {
  if (feature === "splitfinder")
    return (
      <div className="discovery-hero">
        <span className="floating-category category-left">
          <AppIcon name="onboarding-house" /> Spaces
        </span>
        <AceternityScroll>
          <DiscoveryPreview />
        </AceternityScroll>
        <span className="floating-category category-right">
          <AppIcon name="membership-gym" /> Memberships
        </span>
      </div>
    );
  if (feature === "circles")
    return (
      <AceternityScroll>
        <CirclePreview />
      </AceternityScroll>
    );
  if (feature === "bills")
    return (
      <AceternityScroll>
        <BillsPreview />
      </AceternityScroll>
    );
  return (
    <AceternityScroll>
      <ProductVisual feature="cards" />
    </AceternityScroll>
  );
}

export function FeaturePage({ feature }: { feature: Feature }) {
  const content = copy[feature];
  return (
    <div className={`feature-page feature-${feature}`}>
      <section
        className="feature-hero section-wrap"
        aria-labelledby="feature-heading"
      >
        <p className="feature-label">
          <AppIcon name={feature} />
          {content.name}
        </p>
        <h1 id="feature-heading">
          {content.first}
          <br />
          <span>{content.last}</span>
        </h1>
        <p className="feature-subtitle">{content.sub}</p>
        <p className="feature-status">
          {feature === "splitfinder"
            ? "In development · Interactive sample below"
            : financialNotice}
        </p>
        <div className="feature-stage">
          <FeatureHeroVisual feature={feature} />
        </div>
        <p className="availability-note">
          {feature === "splitfinder"
            ? sampleNotice
            : "App preview with illustrative data. No accounts, cards or payments are created here."}
        </p>
      </section>
      {feature === "splitfinder" ? (
        <SplitfinderStory />
      ) : (
        <SharedStory feature={feature} />
      )}
      <nav
        className="feature-next section-wrap"
        aria-label="Explore more features"
      >
        <p>More ways to come together.</p>
        <div>
          {features
            .filter((item) => item !== feature)
            .map((item) => (
              <SkiperLink key={item} href={`/${item}/`}>
                <AppIcon name={item} />
                {copy[item].name}
              </SkiperLink>
            ))}
        </div>
      </nav>
    </div>
  );
}

function SplitfinderStory() {
  return (
    <>
      <section
        className="category-section section-wrap"
        aria-labelledby="category-heading"
      >
        <h2 id="category-heading">
          What brings <span>you together?</span>
        </h2>
        <div
          className="category-rail"
          tabIndex={0}
          role="region"
          aria-label="Sharing categories; scroll horizontally on small screens"
        >
          {[
            {
              icon: "onboarding-house",
              name: "Spaces",
              detail: "Room for your next chapter.",
            },
            {
              icon: "onboarding-phone",
              name: "Plans",
              detail: "A plan with room for more.",
            },
            {
              icon: "subscription-play",
              name: "Subscriptions",
              detail: "Find a group that fits.",
            },
            {
              icon: "membership-gym",
              name: "Memberships",
              detail: "More reasons to team up.",
            },
          ].map((category) => (
            <div className="category-card" key={category.name}>
              <span className="category-art">
                <AppIcon name={category.icon} />
                {category.name === "Subscriptions" && (
                  <img
                    className="play-triangle"
                    src="/figma/subscription-triangle.svg"
                    alt=""
                    width="16"
                    height="19"
                  />
                )}
              </span>
              <h3>{category.name}</h3>
              <p>{category.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="story-grid section-wrap"
        aria-label="How Splitfinder works"
      >
        <article className="story-card blue">
          <div className="story-title">
            <span>01 · FIND YOUR FIT</span>
            <h2>
              There’s room.
              <br />
              <em>Find your spot.</em>
            </h2>
          </div>
          <SpotsVisual />
        </article>
        <article className="story-card white">
          <div className="story-title">
            <span>02 · COME TOGETHER</span>
            <h2>
              A shared interest.
              <br />
              <em>A simple next step.</em>
            </h2>
          </div>
          <JoinVisual />
        </article>
      </section>
      <div className="feature-details section-wrap">
        <details>
          <summary>
            A little more about sharing <span aria-hidden="true">+</span>
          </summary>
          <p>
            Check each service’s household, location and independent-access
            rules before requesting to join. A listing is not permission to
            share credentials or bypass a service’s terms. Spaces use listing
            inquiries to discuss housing; joining a subscription or membership
            group follows its own eligibility flow.
          </p>
          <p>
            This website demonstrates the planned experience. Sample search only
            filters the three illustrative subscriptions above; it does not
            search a live marketplace or send a request.
          </p>
        </details>
      </div>
    </>
  );
}

function SharedStory({
  feature,
}: {
  feature: Exclude<Feature, "splitfinder">;
}) {
  const isCards = feature === "cards",
    isBills = feature === "bills";
  return (
    <>
      <section
        className="story-grid section-wrap"
        aria-label={`${copy[feature].name} at a glance`}
      >
        <article className="story-card white">
          <div className="story-title">
            <span>
              {isCards
                ? "PEOPLE & PERMISSIONS"
                : isBills
                  ? "AGREEMENT COMES FIRST"
                  : "YOUR PEOPLE"}
            </span>
            <h2>
              {isCards
                ? "One host."
                : isBills
                  ? "Everyone’s share."
                  : "A familiar group."}
              <br />
              <em>
                {isCards
                  ? "Clear roles."
                  : isBills
                    ? "Agreed together."
                    : "A shared purpose."}
              </em>
            </h2>
          </div>
          {isCards ? (
            <RolesVisual />
          ) : isBills ? (
            <AgreementVisual />
          ) : (
            <CircleCluster />
          )}
        </article>
        <article className="story-card mint">
          <div className="story-title">
            <span>
              {isBills ? "THE BIGGER PICTURE" : "CONNECTED BY DESIGN"}
            </span>
            <h2>
              {isBills ? "Keep the people." : "The people. The bills."}
              <br />
              <em>{isBills ? "And the plan." : "The whole picture."}</em>
            </h2>
          </div>
          {isBills ? <CircleCluster /> : <BillStack />}
        </article>
      </section>
      <div className="feature-details section-wrap">
        <p className="consent-note">
          {isCards
            ? "Contributing does not grant spending rights. Spending access requires a separate, issuer-approved role."
            : isBills
              ? "Contributors accept their terms before collection. Material changes require renewed acceptance."
              : "Circle membership does not create a financial obligation or grant spending access."}
        </p>
        <details>
          <summary>
            {isCards
              ? "About planned Cards"
              : isBills
                ? "About planned Bills"
                : "About Circles & permissions"}
            <span aria-hidden="true">+</span>
          </summary>
          <p>
            {isCards
              ? "The host owns the provider account and controls the arrangement. Card issuance, controls and any additional spending access depend on the approved provider program."
              : isBills
                ? "Each contribution agreement includes the amount or calculation method, schedule, funding source and any maximum. A proposed change stays a proposal until accepted; a Circle or Card connection does not activate collection."
                : "Circles are reusable, consent-based groups. Cards and Bills keep their own hosts, permissions and individual acceptance. Circle administration does not confer ownership of every attached Card or Bill."}
          </p>
          <p>{financialNotice}</p>
        </details>
      </div>
    </>
  );
}
