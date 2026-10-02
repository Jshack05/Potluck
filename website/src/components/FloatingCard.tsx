import "./floating-card.css";

/** A decorative 3D treatment of the existing virtual-card artwork. */
export function FloatingCard() {
  return (
    <div
      className="floating-card-scene"
      role="img"
      aria-label="Floating three-dimensional Potluck virtual card concept with Aurora artwork"
    >
      <div className="floating-card-shadow" aria-hidden="true" />
      <div className="floating-card" aria-hidden="true">
        <div className="floating-card-back" />
        {Array.from({ length: 10 }, (_, index) => (
          <div
            className="floating-card-edge"
            key={index}
            style={{ transform: `translateZ(${-index * 0.5}px)` }}
          />
        ))}
        <div className="floating-card-front">
          <img
            src="/figma/aurora-card.png"
            className="floating-card-art"
            alt=""
            width="1716"
            height="916"
          />
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
  );
}
