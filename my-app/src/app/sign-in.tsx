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
import { ApiError, useAction, useClient } from "@/services/client";
import { entryDestination, safeReturnTo } from "@/services/navigation";

export default function SignIn() {
  const { returnTo } = useLocalSearchParams();
  const client = useClient(),
    action = useAction();
  const [register, setRegister] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
    action.setError("");
  };
  const submit = () => {
    setFieldErrors({});
    return action.run(async () => {
      try {
        await client.signIn({
          email: email.trim(),
          password,
          ...(register ? { name: name.trim() } : {}),
        });
      } catch (error) {
        if (error instanceof ApiError) setFieldErrors(error.fields);
        throw error;
      }
    });
  };
  if (!client.ready) return <EntryLoading />;
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
            disabled={action.busy}
            onPress={submit}
          />
          <View style={{ alignItems: "center" }}>
            <Link
              onPress={() => {
                if (action.busy) return;
                setRegister(!register);
                setFieldErrors({});
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
          YOUR POTLUCK ACCOUNT
        </Label>
        <Title>{register ? "A place for your people." : "Welcome back"}</Title>
        <Muted>
          {register
            ? "Find something to share. Bring your people together."
            : "Your people and shared plans are right here."}
        </Muted>
      </View>
      <View style={{ gap: 18, marginTop: 12 }}>
        {register && (
          <Field
            label="Your name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              clearFieldError("name");
            }}
            error={fieldErrors.name}
            editable={!action.busy}
            autoComplete="name"
            maxLength={80}
          />
        )}
        <Field
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
          error={fieldErrors.email}
          editable={!action.busy}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          error={fieldErrors.password}
          editable={!action.busy}
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
