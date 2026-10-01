import { useRef, useState } from "react";

export function AppIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <img
      className={`app-icon ${className}`}
      src={`/figma/${name}.svg`}
      alt=""
      width="24"
      height="24"
    />
  );
}

const members = [
  { name: "Jordan", initial: "J", color: "mint" },
  { name: "Maya", initial: "M", color: "mint" },
  { name: "Taylor", initial: "T", color: "peach" },
  { name: "Sam", initial: "S", color: "lilac" },
];

export function People() {
  return (
    <div className="people-surface" data-figma-node="224:360">
      {members.map(({ name, initial, color }) => (
        <div className="person" key={name}>
          <span className="person-avatar">
            <img
              src={`/figma/avatar-${color}.svg`}
              alt=""
              width="46"
              height="46"
            />
            <b>{initial}</b>
          </span>
          <span>{name}</span>
        </div>
      ))}
      <div className="person">
        <span className="add-avatar" aria-hidden="true">
          +
        </span>
        <span>Add</span>
      </div>
    </div>
  );
}

function BillRow({ electric = false }: { electric?: boolean }) {
  return (
    <div className="bill-row" data-figma-node="224:387">
      <span className="bill-icon">
        <AppIcon name={electric ? "electric" : "internet"} />
      </span>
      <span className="bill-label">
        <strong>{electric ? "Electric" : "Internet bill"}</strong>
        <small>
          {electric
            ? "On track for next cycle"
            : "Waiting for Maya’s acceptance"}
        </small>
      </span>
      <b className="bill-amount">{electric ? "$46" : "$84"}</b>
    </div>
  );
}

export function AuroraCard({ full = false }: { full?: boolean }) {
  return (
    <div
      className={`aurora-card ${full ? "large" : ""}`}
      data-figma-node="1592:19292"
    >
      <img
        src="/figma/aurora-card.png"
        className="aurora-art"
        alt=""
        width="660"
        height="352"
      />
      <div className="aurora-content">
        <div className="card-heading">
          <strong>Apartment card</strong>
          <span>Host</span>
        </div>
        <small>Available to spend</small>
        <b className="card-balance">$357.89</b>
        <div className="card-reserve">
          <span>
            <AppIcon name="internet" />
          </span>
          <span>
            <AppIcon name="electric" />
          </span>
          <b>
            $130.00 reserved for bills <span aria-hidden="true">›</span>
          </b>
        </div>
      </div>
    </div>
  );
}

function AppNav() {
  return (
    <div className="app-navigation" aria-hidden="true">
      {["Circles", "Cards", "Bills", "Splitfinder"].map((name, i) => (
        <span key={name} className={i === 0 ? "selected" : ""}>
          <AppIcon name={name.toLowerCase()} />
          <span>{name}</span>
        </span>
      ))}
    </div>
  );
}

export function CirclePreview() {
  return (
    <div className="circle-preview app-preview" data-figma-node="218:314">
      <div className="circle-title">
        <div>
          <h3>Apartment crew</h3>
          <p>4 people · 1 card · 2 bills</p>
        </div>
        <img
          src="/figma/health.svg"
          alt="Needs attention"
          width="44"
          height="44"
        />
      </div>
      <div className="app-section">
        <h4>People</h4>
        <People />
      </div>
      <div className="app-section">
        <h4>
          Bills <span aria-hidden="true">+</span>
        </h4>
        <BillRow />
        <BillRow electric />
      </div>
      <div className="app-section">
        <h4>
          Cards <span aria-hidden="true">+</span>
        </h4>
        <AuroraCard />
      </div>
      <AppNav />
    </div>
  );
}

const subscriptions = [
  {
    name: "Netflix",
    price: "$10",
    capacity: "1 open · 3 of 4 filled",
    category: "TV & movies",
    icon: "netflix",
  },
  {
    name: "Spotify",
    price: "$6",
    capacity: "2 open · 4 of 6 filled",
    category: "Music",
    icon: "spotify",
  },
  {
    name: "Dropbox",
    price: "$10",
    capacity: "1 open · 5 of 6 filled",
    category: "Software",
    icon: "dropbox",
  },
];

export function DiscoveryPreview() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = subscriptions.filter((item) =>
    `${item.name} ${item.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="discovery-preview app-preview" data-figma-node="1763:24097">
      <h3>Splitfinder</h3>
      <div className="sample-search">
        <AppIcon name="search" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search sample listings"
          placeholder="Search subscriptions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>
      <div className="preview-subheading">
        <h4>Subscriptions</h4>
        <span>Monthly · per person</span>
      </div>
      <ul className="sample-listings" aria-label="Sample subscriptions">
        {filtered.map((item) => (
          <li key={item.name} className="subscription-card">
            <div className="subscription-top">
              <AppIcon name={item.icon} />
              <strong>{item.name}</strong>
              <span className="active-listing">
                <i />
                Active
              </span>
            </div>
            <div className="subscription-meta">
              <span>{item.capacity}</span>
              <b>
                {item.price}
                <small> / month</small>
              </b>
            </div>
          </li>
        ))}
      </ul>
      <p className="search-result-status" role="status">
        {filtered.length
          ? `${filtered.length} sample listings`
          : "No sample listings match."}
      </p>
    </div>
  );
}

export function BillsPreview() {
  return (
    <div className="bills-preview app-preview">
      <div className="preview-heading">
        <span className="bill-icon">
          <AppIcon name="bills" />
        </span>
        <span>Apartment crew</span>
      </div>
      <h3>Make the plan clear.</h3>
      <People />
      <div className="pending-agreement" data-figma-node="1555:19224">
        <div className="pending-body">
          <h4>
            Internet bill <AppIcon name="clock" />
          </h4>
          <p>Waiting for Maya to accept her updated share.</p>
          <p>Current terms stay in place.</p>
        </div>
        <div className="proposal-footer">
          Awaiting agreement <span aria-hidden="true">↗</span>
        </div>
      </div>
      <BillRow />
      <p className="preview-note">
        A proposed change is not an accepted contribution.
      </p>
    </div>
  );
}

export function CardsPreview() {
  return (
    <div className="cards-preview app-preview">
      <div className="preview-heading">
        <span className="bill-icon">
          <AppIcon name="cards" />
        </span>
        <span>Apartment crew</span>
      </div>
      <h3>Make spending purposeful.</h3>
      <AuroraCard full />
      <div className="card-principles">
        <div>
          <AppIcon name="circles" />
          <p>
            <strong>One host. Clear roles.</strong>
            <span>Contributing and spending are separate permissions.</span>
          </p>
        </div>
        <div>
          <AppIcon name="bills" />
          <p>
            <strong>Connected to the plan.</strong>
            <span>Keep the people, bills and card in context.</span>
          </p>
        </div>
      </div>
      <p className="preview-note">
        Illustrative card design. No card is issued here.
      </p>
    </div>
  );
}
