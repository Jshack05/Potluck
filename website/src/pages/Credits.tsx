import { SkiperLink } from "../components/SkiperLink";
export function Credits() {
  return (
    <section className="credits-page section-wrap">
      <p className="eyebrow">With appreciation</p>
      <h1>
        Thoughtful details.
        <br />
        <span>Talented makers.</span>
      </h1>
      <div className="credits-list">
        <article>
          <span>01</span>
          <div>
            <h2>Potluck design</h2>
            <p>
              Original icons, card artwork and interface designs from the
              Potluck app.
            </p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>Aceternity UI</h2>
            <p>
              Container Scroll Animation, adapted for Potluck with gentle motion
              and reduced-motion support.
            </p>
            <SkiperLink href="https://ui.aceternity.com/components/container-scroll-animation">
              Explore Aceternity UI
            </SkiperLink>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h2>Skiper UI</h2>
            <p>
              Skiper 40 Animated Link by Gurvinder Singh, adapted for this
              website.
            </p>
            <SkiperLink href="https://skiper-ui.com/v1/skiper40">
              Explore Skiper UI
            </SkiperLink>
          </div>
        </article>
        <article>
          <span>04</span>
          <div>
            <h2>Inter</h2>
            <p>
              Inter by Rasmus Andersson. Bundled locally under the SIL Open Font
              License.
            </p>
            <SkiperLink href="https://rsms.me/inter/">Explore Inter</SkiperLink>
          </div>
        </article>
      </div>
      <p className="availability-note">
        Service names and marks belong to their respective owners. Their
        appearance in illustrative listings does not imply a Potluck
        partnership.
      </p>
    </section>
  );
}
