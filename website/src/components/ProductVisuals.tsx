import { AppIcon, AuroraCard, People } from "./AppPreviews";
import type { Feature } from "../pages";

export function ListingStack() {
  return (
    <div
      className="listing-stack"
      aria-label="Illustrative subscription listings"
    >
      {[
        {
          name: "Netflix",
          icon: "netflix",
          spots: "1 open spot",
          filled: 3,
          total: 4,
          price: "$10",
        },
        {
          name: "Spotify",
          icon: "spotify",
          spots: "2 open spots",
          filled: 4,
          total: 6,
          price: "$6",
        },
        {
          name: "Dropbox",
          icon: "dropbox",
          spots: "1 open spot",
          filled: 5,
          total: 6,
          price: "$10",
        },
      ].map((item) => (
        <div className="showcase-listing" key={item.icon}>
          <div className="listing-identity">
            <AppIcon name={item.icon} />
            <strong>{item.name}</strong>
            <span>{item.spots}</span>
          </div>
          <div className="listing-availability">
            <span
              className="spot-dots"
              aria-label={`${item.filled} of ${item.total} spots filled`}
            >
              {Array.from({ length: item.total }, (_, i) => (
                <i key={i} className={i < item.filled ? "filled" : ""} />
              ))}
            </span>
            <b>
              {item.price}
              <small> / person / month</small>
            </b>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillStack() {
  return (
    <div className="bill-stack">
      <div className="mini-circle">
        <AppIcon name="circles" />
        <span>Apartment crew</span>
        <span>2 bills</span>
      </div>
      {[
        {
          icon: "internet",
          name: "Internet bill",
          amount: "$84",
          status: "Awaiting agreement",
        },
        {
          icon: "electric",
          name: "Electric",
          amount: "$46",
          status: "On track",
        },
      ].map((item) => (
        <div className="showcase-bill" key={item.icon}>
          <div className="bill-identity">
            <span className="bill-icon">
              <AppIcon name={item.icon} />
            </span>
            <strong>{item.name}</strong>
            <b>{item.amount}</b>
          </div>
          <div className="bill-bottom">
            <span>Monthly total</span>
            <span
              className={`pill ${item.icon === "internet" ? "pending" : ""}`}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CircleCluster() {
  return (
    <div className="circle-cluster">
      <div className="circle-orbit" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="group-card">
        <div className="group-symbol">
          <AppIcon name="circles" />
        </div>
        <h3>Apartment crew</h3>
        <p>Your people. One place.</p>
        <People />
      </div>
      <div className="connected-pills">
        <span>
          <AppIcon name="cards" /> 1 Card
        </span>
        <span>
          <AppIcon name="bills" /> 2 Bills
        </span>
      </div>
    </div>
  );
}

export function ProductVisual({ feature }: { feature: Feature }) {
  if (feature === "splitfinder") return <ListingStack />;
  if (feature === "bills") return <BillStack />;
  if (feature === "circles") return <CircleCluster />;
  return (
    <div className="card-showcase">
      <AuroraCard full />
      <div className="card-connection">
        <AppIcon name="bills" />
        <span>Connected to your shared bills</span>
      </div>
    </div>
  );
}

export function SpotsVisual() {
  return (
    <div className="spots-visual">
      <AppIcon name="spotify" />
      <span className="visual-label">Illustrative group</span>
      <div className="large-spots" aria-label="4 of 6 spots filled">
        {Array.from({ length: 6 }, (_, i) => (
          <span className={i < 4 ? "filled" : ""} key={i}>
            {i < 4 ? "✓" : "+"}
          </span>
        ))}
      </div>
      <strong>
        4 filled. <span>2 open.</span>
      </strong>
      <p>See where there’s room for you.</p>
    </div>
  );
}

export function JoinVisual() {
  return (
    <div className="join-visual">
      <span className="visual-label">Planned joining flow</span>
      <div className="join-step">
        <span>1</span>
        <p>Check the sharing rules</p>
        <AppIcon name="search" />
      </div>
      <div className="join-step">
        <span>2</span>
        <p>Confirm you’re eligible</p>
        <AppIcon name="check" />
      </div>
      <div className="join-step">
        <span>3</span>
        <p>Request to join</p>
        <AppIcon name="splitfinder" />
      </div>
      <span className="request-status">
        Request pending <AppIcon name="clock" />
      </span>
    </div>
  );
}

export function RolesVisual() {
  return (
    <div className="roles-visual">
      <div className="role-card">
        <AppIcon name="cards" />
        <strong>Host</strong>
        <span>Owns & controls the card</span>
      </div>
      <div className="role-card">
        <AppIcon name="circles" />
        <strong>Contributor</strong>
        <span>Agrees to a contribution</span>
      </div>
      <p>Spending access is a separate, issuer-approved role.</p>
    </div>
  );
}

export function AgreementVisual() {
  return (
    <div className="agreement-visual">
      <span className="bill-icon">
        <AppIcon name="internet" />
      </span>
      <h3>Internet bill</h3>
      <p>Proposed monthly share</p>
      <strong>
        $21<span> / person</span>
      </strong>
      <div className="agreement-line">
        <span>4 people</span>
        <span>$84 monthly total</span>
      </div>
      <span className="pill pending">Awaiting agreement</span>
      <p>Nothing changes until accepted.</p>
    </div>
  );
}
