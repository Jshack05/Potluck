import { useState } from "react";
import { View } from "react-native";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import {
  EntryShell,
  EntryLoading,
  Title,
  Muted,
  Field,
  Action,
  Link,
  ErrorText,
  Label,
  theme,
} from "@/design/system";
import { useAction, useClient } from "@/services/client";
import { entryDestination, safeReturnTo } from "@/services/navigation";

export default function SignIn() {
  const { returnTo } = useLocalSearchParams();
  const client = useClient(),
    action = useAction();
  const [register, setRegister] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const submit = () =>
    action.run(() =>
      client.signIn({
        email: email.trim(),
        password,
        ...(register ? { name: name.trim() } : {}),
      }),
    );
  if (!client.ready || client.access === "loading") return <EntryLoading />;
  if (client.user)
    return (
      <Redirect
        href={
          (entryDestination(client.access, returnTo) ??
            safeReturnTo(returnTo)) as Href
        }
      />
    );
  return (
    <EntryShell
      footer={
        <>
          <ErrorText text={action.error} />
          <Action
            label={
              action.busy
                ? "One moment…"
                : register
                  ? "Create account"
                  : "Sign in"
            }
            disabled={
              action.busy ||
              !email.trim() ||
              password.length < 12 ||
              (register && !name.trim())
            }
            onPress={submit}
          />
          <View style={{ alignItems: "center" }}>
            <Link
              onPress={() => {
                setRegister(!register);
                action.setError("");
              }}
            >
              {register
                ? "Already have an account? Sign in"
                : "New to Potluck? Create account"}
            </Link>
          </View>
        </>
      }
    >
      <View style={{ gap: 8 }}>
        <Label
          style={{
            color: theme.teal,
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
          }}
        >
          1 OF 2 · YOUR ACCOUNT
        </Label>
        <Title>{register ? "A place for your people." : "Welcome back"}</Title>
        <Muted>
          {register
            ? "Create your account, then connect your bank to get started with Potluck."
            : "Sign in to Potluck. We'll check your bank connection before you continue."}
        </Muted>
      </View>
      <View style={{ gap: 18, marginTop: 12 }}>
        {register && (
          <Field
            label="Your name"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            maxLength={80}
          />
        )}
        <Field
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={register ? "new-password" : "current-password"}
        />
        <Muted>
          Use at least 12 characters for this local development account.
        </Muted>
      </View>
    </EntryShell>
  );
}
