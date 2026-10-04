import { AppIcon } from "../components/AppPreviews";
import { Arrow, SkiperLink } from "../components/SkiperLink";
import "./contact.css";

export function Contact() {
  return (
    <section
      className="contact-page section-wrap"
      aria-labelledby="contact-heading"
    >
      <div className="contact-intro">
        <p className="eyebrow">
          <span className="status-dot" /> Let’s build together
        </p>
        <h1 id="contact-heading">
          Good things start with <span>a conversation.</span>
        </h1>
        <p className="contact-lede">
          Have a shared vision? Tell us a little about yourself and where
          Potluck fits in.
        </p>
        <div className="contact-art" aria-hidden="true">
          <div className="contact-art-icons">
            <span>
              <AppIcon name="circles" />
            </span>
            <i />
            <span>
              <AppIcon name="bills" />
            </span>
            <i />
            <span>
              <AppIcon name="cards" />
            </span>
          </div>
          <p>
            A shared vision.
            <br />
            <strong>The right partners.</strong>
          </p>
          <span className="contact-art-caption">
            People. Plans. Possibility.
          </span>
        </div>
        <div className="contact-direct">
          <p>Prefer a simple hello?</p>
          <SkiperLink href="mailto:joseph@getpotluck.app">
            joseph@getpotluck.app
          </SkiperLink>
        </div>
      </div>
      <div className="contact-panel">
        <div className="contact-panel-heading">
          <h2>Start a conversation</h2>
          <p>A little context goes a long way.</p>
        </div>
        <form
          className="contact-form"
          aria-label="Partnership inquiry"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="contact-fields">
            <label htmlFor="contact-name">
              Full name
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Your name"
              />
            </label>
            <label htmlFor="contact-email">
              Business email
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@company.com"
              />
            </label>
            <label htmlFor="contact-company">
              Company
              <input
                id="contact-company"
                name="company"
                autoComplete="organization"
                required
                maxLength={120}
                placeholder="Company name"
              />
            </label>
            <label htmlFor="contact-role">
              Your role <span>(optional)</span>
              <input
                id="contact-role"
                name="role"
                autoComplete="organization-title"
                maxLength={100}
                placeholder="What you do"
              />
            </label>
            <label className="contact-field-wide" htmlFor="contact-website">
              Company website <span>(optional)</span>
              <input
                id="contact-website"
                name="website"
                type="url"
                autoComplete="url"
                maxLength={300}
                placeholder="https://company.com"
              />
            </label>
            <label className="contact-field-wide" htmlFor="contact-interest">
              I’m interested in <span>(optional)</span>
              <select id="contact-interest" name="interest" defaultValue="">
                <option value="">Select a topic</option>
                <option>Cards & issuing</option>
                <option>Banking & payments</option>
                <option>Business partnerships</option>
                <option>Investment</option>
                <option>Press & media</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="contact-field-wide" htmlFor="contact-message">
              How can we work together?
              <textarea
                id="contact-message"
                name="message"
                required
                maxLength={1500}
                rows={4}
                placeholder="Tell us what you have in mind…"
              />
            </label>
          </div>
          <p className="contact-form-note">
            Name, email, company and message are required.
          </p>
          <button
            type="submit"
            className="primary-button contact-submit"
            disabled
          >
            Send your message <Arrow />
          </button>
          <p className="contact-delivery-note">
            Form delivery is being connected. You can email us directly above.
          </p>
        </form>
      </div>
    </section>
  );
}
