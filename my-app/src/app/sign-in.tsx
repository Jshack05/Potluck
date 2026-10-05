import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  Title,
  Muted,
  Field,
  Action,
  Link,
  ErrorText,
  Icon,
  theme,
} from "@/design/system";
import { useAction, useClient } from "@/services/client";
import { safeReturnTo } from "@/services/navigation";
export default function SignIn() {
  const { returnTo } = useLocalSearchParams();
  const client = useClient(),
    action = useAction();
  const [register, setRegister] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const submit = () =>
    action.run(async () => {
      await client.signIn({
        email: email.trim(),
        password,
        ...(register ? { name: name.trim() } : {}),
      });
      router.replace(safeReturnTo(returnTo) as Href);
    });
  return (
    <Shell
      title={register ? "Create your account" : "Welcome back"}
      back
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
        </>
      }
    >
      <View style={{ alignItems: "center", marginVertical: 22 }}>
        <View
          style={{ backgroundColor: theme.mint, borderRadius: 52, padding: 24 }}
        >
          <Icon name="circles" size={52} />
        </View>
      </View>
      <Title>Your people, together.</Title>
      <Muted>Pick up your conversation or bring a Circle together.</Muted>
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
        label="Email"
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
      <Link
        onPress={() => {
          setRegister(!register);
          action.setError("");
        }}
      >
        {register
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </Link>
    </Shell>
  );
}
