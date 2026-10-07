import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Action, ErrorText, Field, go, Label, theme } from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import {
  ProfileArt,
  SettingsGroup,
  SettingsNote,
  SettingsPage,
  SettingsRow,
  SettingsSheet,
  SettingsLogoutSheet,
} from "@/features/potluck/settings-ui";
import type { Circle } from "@/features/potluck/types";
const titles: Record<string, string> = {
  profile: "Edit profile",
  banking: "Banking",
  security: "Login & security",
  personal: "Personal details",
  friends: "Friends",
  privacy: "Privacy",
  notifications: "Notifications",
  help: "Help",
};
export default function SettingsDetail() {
  const { section } = useLocalSearchParams<{ section: string }>(),
    client = useClient();
  const action = useAction(),
    command = useCommand();
  const [editingName, setEditingName] = useState(false),
    [name, setName] = useState("");
  const [logout, setLogout] = useState(false);
  const [note, setNote] = useState<{ title: string; detail: string } | null>(
    null,
  );
  const circles = useResource<{ items: Circle[] }>(
    section === "friends" ? "/circles" : null,
  );
  const unavailable = (title: string, detail: string) => () =>
    setNote({ title, detail });
  const localOnly =
    "This local build uses email and password. This account feature is not connected yet; no security setting has been changed.";
  const connect = () =>
    go("/connect-bank?returnTo=" + encodeURIComponent("/settings/banking"));
  return (
    <SettingsPage title={titles[section] ?? "Settings"}>
      {section === "profile" && (
        <>
          <View style={{ alignItems: "center", gap: 18, paddingVertical: 8 }}>
            <ProfileArt size={100} />
            <Label style={{ color: theme.teal, fontSize: 14 }}>
              Your profile
            </Label>
          </View>
          <SettingsGroup title="Profile">
            <SettingsRow
              title="Full name"
              value={client.user?.name}
              onPress={() => {
                setName(client.user?.name ?? "");
                setEditingName(true);
              }}
            />
            <SettingsRow title="Username" value="Not set" />
            <SettingsRow
              title="Profile visibility"
              detail="Your name appears in the Circles you join. Anonymous Circles protect other member names."
              last
            />
          </SettingsGroup>
          <SettingsGroup title="Contact">
            <SettingsRow title="Phone" detail="Not connected in this build" />
            <SettingsRow title="Email" detail={client.user?.email} last />
          </SettingsGroup>
          <SettingsNote>
            Username, contact changes and photo uploads are not connected yet.
          </SettingsNote>
        </>
      )}
      {section === "banking" && (
        <>
          <Label style={{ fontSize: 15, color: theme.muted }}>
            Manage funding sources and transfers.
          </Label>
          <SettingsGroup>
            <SettingsRow
              title="Linked banks"
              detail={
                client.entryStatus?.bankConnection === "confirmed"
                  ? "Connection confirmed"
                  : "No confirmed connection"
              }
              onPress={connect}
            />
            <SettingsRow
              title="Default funding source"
              detail="Choose an eligible account when banking is available"
              onPress={connect}
            />
            <SettingsRow
              title="Add funding source"
              detail="Connect through the bank provider"
              onPress={connect}
              last
            />
          </SettingsGroup>
          <SettingsGroup title="Activity">
            <SettingsRow
              title="Transfer history"
              detail="No transfer service is connected"
              onPress={unavailable(
                "Transfer history",
                "Transfers are unavailable in this build. A saved Bill or accepted contribution is not a completed payment.",
              )}
            />
            <SettingsRow
              title="Verification status"
              value={
                client.entryStatus?.bankConnection === "confirmed"
                  ? "Confirmed"
                  : "Not connected"
              }
              onPress={connect}
              last
            />
          </SettingsGroup>
          <SettingsNote>
            Banking is optional for organizing. Money movement requires separate
            consent and verification.
          </SettingsNote>
        </>
      )}
      {section === "security" && (
        <>
          <SettingsGroup>
            <SettingsRow
              title="Password"
              detail="Email and password sign-in"
              onPress={unavailable("Password", localOnly)}
            />
            <SettingsRow
              title="Passkeys"
              detail="Use device sign-in when available"
              value="Unavailable"
              onPress={unavailable("Passkeys", localOnly)}
            />
            <SettingsRow
              title="Two-step verification"
              value="Unavailable"
              onPress={unavailable("Two-step verification", localOnly)}
            />
            <SettingsRow
              title="Trusted devices"
              detail="Device management is not connected yet"
              onPress={unavailable("Trusted devices", localOnly)}
              last
            />
          </SettingsGroup>
          <SettingsGroup title="Security alerts">
            <SettingsRow
              title="Active sessions"
              detail="Session history is not connected yet"
              onPress={unavailable("Active sessions", localOnly)}
            />
            <SettingsRow
              title="Log out"
              detail="Revoke this session"
              danger
              onPress={() => setLogout(true)}
              last
            />
          </SettingsGroup>
        </>
      )}
      {section === "personal" && (
        <>
          <Label style={{ fontSize: 15, color: theme.muted }}>
            Identity details may be needed for verification.
          </Label>
          <SettingsGroup>
            <SettingsRow title="Account name" detail={client.user?.name} />
            <SettingsRow
              title="Date of birth"
              detail="Only if verification needs it"
            />
            <SettingsRow title="Phone" detail="Not provided" />
            <SettingsRow title="Email" detail={client.user?.email} />
            <SettingsRow
              title="Address"
              detail="Collected only through an approved verification flow"
              last
            />
          </SettingsGroup>
          <SettingsNote>
            No identity-verification provider is connected. Potluck has not
            verified these details.
          </SettingsNote>
        </>
      )}
      {section === "friends" && (
        <>
          <Label style={{ fontSize: 15, color: theme.muted }}>
            Find your people in your Circles.
          </Label>
          <SettingsGroup>
            {circles.data?.items.map((circle, i) => (
              <SettingsRow
                key={circle.id}
                title={circle.name}
                detail="View members"
                onPress={() => go("/circle/" + circle.id + "/members")}
                last={i === circles.data!.items.length - 1}
              />
            ))}
          </SettingsGroup>
          {!circles.data?.items.length && (
            <SettingsNote>
              {circles.error || "Join or create a Circle to see people here."}
            </SettingsNote>
          )}
          <SettingsNote>
            A separate friends list is not connected yet. Circle membership
            always requires acceptance.
          </SettingsNote>
        </>
      )}
      {section === "privacy" && (
        <>
          <SettingsGroup>
            <SettingsRow
              title="Find me by email"
              detail="An exact address can find your account. Name search only finds already visible contacts or public hosts."
            />
            <SettingsRow
              title="Allow Circle invites"
              detail="Invitations require your acceptance."
            />
            <SettingsRow
              title="Anonymous Circle default"
              detail="Choose privacy when creating each Circle."
            />
            <SettingsRow
              title="Blocked people"
              detail="Blocked users cannot interact with you."
              last
            />
          </SettingsGroup>
          <SettingsNote>
            Account-wide privacy controls are not connected yet. Each Circle’s
            privacy and blocking rules remain enforced.
          </SettingsNote>
        </>
      )}
      {section === "notifications" && (
        <>
          <SettingsGroup>
            {[
              ["Circle invites", "View invitations in your inbox"],
              ["Bill reminders", "Delivery is not connected yet"],
              ["Card activity", "Card issuance is not available"],
              ["Payment failures", "Transfers are not available"],
              [
                "Security alerts",
                "External alert delivery is not connected yet",
              ],
            ].map(([title, detail], i) => (
              <SettingsRow
                title={title}
                detail={detail}
                key={title}
                onPress={i === 0 ? () => go("/inbox") : undefined}
                last={i === 4}
              />
            ))}
          </SettingsGroup>
          <SettingsNote>
            Delivery preferences will become available with the notification
            service. No push or email reminder has been scheduled.
          </SettingsNote>
        </>
      )}
      {section === "help" && (
        <SettingsGroup>
          <SettingsRow
            title="FAQ"
            detail="Circles, Cards and Bills"
            onPress={unavailable(
              "How Potluck works",
              "Circles organize people. Cards save a setup for future issuer activation. Bills record obligations and separately accepted shares. You can organize all three before connecting a bank.",
            )}
          />
          <SettingsRow
            title="Contact support"
            detail="Support delivery is not connected yet"
            onPress={unavailable(
              "Contact support",
              "There is no connected support channel in this local build. Send feedback through your development conversation.",
            )}
          />
          <SettingsRow
            title="Report a problem"
            detail="Tell us when something feels wrong"
            onPress={unavailable(
              "Report a problem",
              "Record the screen, action and error without including passwords or financial credentials. Share these in your development conversation; this screen does not submit a report.",
            )}
          />
          <SettingsRow
            title="Safety or payment issue"
            detail="Get help with a financial issue"
            onPress={unavailable(
              "Safety or payment issue",
              "This build cannot send funds or issue a card. For an external bank or service issue, contact that provider through its official channel.",
            )}
          />
          <SettingsRow
            title="Legal & disclosures"
            detail="Sharing rules and required notices"
            onPress={() => go("/sharing-rules")}
            last
          />
        </SettingsGroup>
      )}
      {note && <SettingsSheet {...note} onClose={() => setNote(null)} />}
      {logout && <SettingsLogoutSheet onClose={() => setLogout(false)} />}
      {editingName && (
        <SettingsSheet
          title="Full name"
          detail="The name people see in your Circles."
          onClose={() => setEditingName(false)}
          action={
            <>
              <Field
                label="Full name"
                value={name}
                onChangeText={setName}
                maxLength={80}
                autoComplete="name"
              />
              <ErrorText text={action.error} />
              <Action
                label={action.busy ? "Saving…" : "Save name"}
                disabled={action.busy || !name.trim()}
                onPress={() =>
                  action.run(async () => {
                    await command("/settings/profile", { name: name.trim() });
                    await client.refreshProfile();
                    setEditingName(false);
                  })
                }
              />
            </>
          }
        />
      )}
    </SettingsPage>
  );
}
