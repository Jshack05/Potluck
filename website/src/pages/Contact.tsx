import { AppIcon } from "../components/AppPreviews";
import { Arrow, SkiperLink } from "../components/SkiperLink";
import "./contact.css";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactInterests, parseInquiry } from "../contact-data";

export function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "accepted" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state === "accepted" || state === "error") feedback.current?.focus();
  }, [state]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const inquiry = parseInquiry(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!inquiry) {
      setError("Please check your details and complete the required fields.");
      setState("error");
      return;
    }
    inFlight.current = true;
    setState("sending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
        signal: controller.signal,
      });
      const result = await response.json();
      if (response.status === 202 && result.status === "accepted") {
        setState("accepted");
      } else {
        setError(
          response.status === 429
            ? "A few messages came through at once. Please wait a minute before trying again."
            : response.status === 400
              ? "Please check your details and try again."
              : "We couldn’t confirm delivery. Your message is still here. Please wait before trying again, or email Joseph directly.",
        );
        setState("error");
      }
    } catch {
      setError(
        "We couldn’t confirm delivery. Your message is still here. Please wait before trying again, or email Joseph directly.",
      );
      setState("error");
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
    }
  }
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
        {state === "accepted" ? (
          <div
            className="contact-success"
            role="status"
            tabIndex={-1}
            ref={feedback}
          >
            <span className="contact-success-icon" aria-hidden="true">
              <AppIcon name="check" />
            </span>
            <h2>Thanks for reaching out.</h2>
            <p>
              Your message is on its way to Joseph. We’ll use the email you
              provided to continue the conversation.
            </p>
            <SkiperLink href="/">Back to Potluck</SkiperLink>
          </div>
        ) : (
          <>
            <div className="contact-panel-heading">
              <h2>Start a conversation</h2>
              <p>A little context goes a long way.</p>
            </div>
            <form
              className="contact-form"
              aria-label="Partnership inquiry"
              onSubmit={submit}
              aria-busy={state === "sending"}
            >
              <fieldset
                className="contact-fields"
                disabled={state === "sending"}
              >
                <legend className="sr-only">Your partnership inquiry</legend>
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
                <label
                  className="contact-field-wide"
                  htmlFor="contact-interest"
                >
                  I’m interested in <span>(optional)</span>
                  <select id="contact-interest" name="interest" defaultValue="">
                    <option value="">Select a topic</option>
                    {contactInterests.map((interest) => (
                      <option key={interest}>{interest}</option>
                    ))}
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
                <label className="contact-trap" aria-hidden="true">
                  Company fax
                  <input name="companyFax" tabIndex={-1} autoComplete="off" />
                </label>
              </fieldset>
              <p className="contact-form-note">
                Name, email, company and message are required.
              </p>
              <button
                type="submit"
                className="primary-button contact-submit"
                disabled={state === "sending"}
              >
                {state === "sending" ? "Sending…" : "Send your message"}{" "}
                <Arrow />
              </button>
              <p className="contact-delivery-note">
                Your details are sent to Potluck to respond to your inquiry.
                This won’t sign you up for marketing emails.
              </p>
              {state === "error" && (
                <div
                  className="contact-error"
                  role="alert"
                  ref={feedback}
                  tabIndex={-1}
                >
                  {error}
                </div>
              )}
              <noscript>
                <p className="contact-delivery-note">
                  Please enable JavaScript to submit this form, or email
                  joseph@getpotluck.app directly.
                </p>
              </noscript>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
