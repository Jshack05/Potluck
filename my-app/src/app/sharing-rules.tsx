import { Shell, Title, Label, Muted, Divider } from "@/design/system";
export default function Rules() {
  return (
    <Shell title="Sharing Rules" back blue active="Splitfinder">
      <Title>Share only what you’re allowed to</Title>
      <Muted>Version 2026-10-04 · Development draft</Muted>
      <Label>
        Check the provider’s current terms for the exact plan and region.
        Household, family, age, location and independent-access requirements can
        apply. A listing on Potluck does not establish eligibility.
      </Label>
      <Divider />
      <Title small>Be clear and honest</Title>
      <Label>
        Describe the service, cost, availability and access accurately. Do not
        misrepresent your relationship to another person or your affiliation
        with a brand. Never share a password or financial credential through a
        listing or conversation.
      </Label>
      <Divider />
      <Title small>Agree before you commit</Title>
      <Label>
        A request opens an introduction. Circle membership and individual Bill
        terms need separate acceptance. Neither an introduction nor Circle
        membership authorizes a payment or grants access to a Card.
      </Label>
      <Divider />
      <Title small>Respect your people</Title>
      <Label>
        Do not post misleading, discriminatory or abusive content. Use report
        and block controls when needed. Confirm cancellation, access and payment
        arrangements with the host before making a commitment.
      </Label>
      <Divider />
      <Muted>
        Potluck is independent of the brands listed. These development rules
        still require legal review before public launch.
      </Muted>
    </Shell>
  );
}
