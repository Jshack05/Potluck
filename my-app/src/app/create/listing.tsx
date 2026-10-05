import { useEffect, useState, useRef } from "react";
import { creationPath } from "@/services/navigation";
import * as Crypto from "expo-crypto";
import {
  runListingWorkflow,
  type ListingWorkflow,
} from "@/services/listing-workflow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { useLocalSearchParams, router, type Href } from "expo-router";
import {
  Shell,
  Title,
  Label,
  Muted,
  Field,
  Action,
  Link,
  Row,
  AuthGate,
  ErrorText,
  ResourceState,
  go,
  styles,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import { Calendar } from "@/features/potluck/calendar";
import { moneyInput } from "@/features/potluck/calendar-model";
import type { Listing } from "@/features/potluck/types";
const types = ["subscriptions", "memberships", "plans", "housing"] as const;
type ListingParams = { brand?: string; category?: string; id?: string };
export default function CreateListing() {
  const params = useLocalSearchParams<ListingParams>(),
    { user } = useClient(),
    existing = useResource<Listing>(
      user && params.id ? "/listings/" + params.id : null,
    );
  if (!user || (params.id && !existing.data))
    return (
      <Shell title="Create listing" back blue>
        <AuthGate returnTo={creationPath("/create/listing", params)}>
          <ResourceState {...existing} retry={existing.reload} />
        </AuthGate>
      </Shell>
    );
  return (
    <ListingEditor
      key={user.id + ":" + (params.id ?? "new")}
      params={params}
      original={existing.data}
    />
  );
}
function ListingEditor({
  params,
  original,
}: {
  params: ListingParams;
  original: Listing | null;
}) {
  const { user } = useClient(),
    act = useAction(),
    command = useCommand();
  const { setError } = act;
  const [initial] = useState(() =>
    original
      ? {
          category: original.category,
          serviceKind: original.serviceKind,
          brand: original.brand,
          title: original.title,
          description: original.description,
          share: String(original.shareMinor / 100),
          total:
            original.totalMinor === null
              ? ""
              : String(original.totalMinor / 100),
          capacity: String(original.capacity),
          filled: String(original.filled),
          location: original.location,
          moveIn:
            original.moveIn?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10),
        }
      : {
          category: (types.includes(params.category as any)
            ? params.category
            : "subscriptions") as Listing["category"],
          brand: params.brand ?? "",
          serviceKind: "other" as Listing["serviceKind"],
          title: "",
          description: "",
          share: "",
          total: "",
          capacity: "4",
          filled: "1",
          location: "",
          moveIn: new Date().toISOString().slice(0, 10),
        },
  );
  const [changeCategory, setChangeCategory] = useState(
    !params.category && !original,
  );
  const [form, setForm] = useState(initial),
    [step, setStep] = useState(0),
    [loaded, setLoaded] = useState(false),
    [attempt, setAttempt] = useState(0);
  const workflow = useRef<ListingWorkflow<Listing>>({
      workflowId: Crypto.randomUUID(),
      listing: original,
      savedBody: null,
      phase: "editing",
      pending: null,
    }),
    completed = useRef(false);
  const draftKey = user
    ? "potluck.draft.listing." + user.id + "." + (params.id ?? "new")
    : null;
  useEffect(() => {
    let active = true;
    if (!draftKey) return;
    void Promise.all([
      AsyncStorage.getItem(draftKey),
      AsyncStorage.getItem(draftKey + ".workflow"),
    ])
      .then(([value, storedWorkflow]) => {
        if (!active) return;
        if (value) setForm({ ...initial, ...JSON.parse(value) });
        if (storedWorkflow) workflow.current = JSON.parse(storedWorkflow);
        setError("");
        setLoaded(true);
      })
      .catch(() => {
        if (active)
          setError(
            "Your draft could not be restored. Retry before continuing.",
          );
      });
    return () => {
      active = false;
    };
  }, [draftKey, initial, setError, attempt]);
  useEffect(() => {
    if (!draftKey || !loaded || completed.current) return;
    const timer = setTimeout(
      () =>
        !completed.current &&
        void AsyncStorage.setItem(draftKey, JSON.stringify(form)).catch(() =>
          setError("This draft could not be saved on your device."),
        ),
      400,
    );
    return () => clearTimeout(timer);
  }, [draftKey, loaded, form, setError]);
  function change(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  const body = () => ({
    title: form.title,
    brand: form.brand,
    category: form.category,
    serviceKind: form.serviceKind,
    description: form.description,
    shareMinor: moneyInput(form.share),
    totalMinor: form.total ? moneyInput(form.total) : null,
    capacity: Number(form.capacity),
    filled: Number(form.filled),
    location: form.location,
    moveIn: form.category === "housing" ? form.moveIn : null,
  });
  async function save(publish: boolean) {
    await act.run(async () => {
      const data = body();
      if (!draftKey || !loaded)
        throw new Error("Restore the saved draft first.");
      await AsyncStorage.setItem(draftKey, JSON.stringify(form));
      const listing = await runListingWorkflow(
        workflow.current,
        data,
        publish,
        (path, payload, identity) => command<Listing>(path, payload, identity),
        async (state) => {
          await AsyncStorage.setItem(
            draftKey + ".workflow",
            JSON.stringify(state),
          );
          workflow.current = state;
        },
      );
      completed.current = true;
      await AsyncStorage.multiRemove([draftKey, draftKey + ".workflow"]);
      router.replace(("/my-listings?updated=" + listing.id) as Href);
    });
  }
  return (
    <Shell
      title="Create listing"
      back
      blue
      active="Splitfinder"
      footer={
        user ? (
          <>
            <ErrorText text={act.error} />
            {!loaded && act.error && (
              <Link onPress={() => setAttempt((n) => n + 1)}>Retry draft</Link>
            )}
            {step > 0 && (
              <Link onPress={() => setStep(step - 1)}>Previous step</Link>
            )}
            <Action
              label={
                step === 3
                  ? form.category === "housing"
                    ? "Save for verification"
                    : "Publish listing"
                  : "Continue"
              }
              disabled={act.busy || !loaded}
              onPress={() => (step < 3 ? setStep(step + 1) : save(true))}
            />
            {step === 3 && (
              <Link onPress={() => !act.busy && loaded && save(false)}>
                Save as draft
              </Link>
            )}
          </>
        ) : undefined
      }
    >
      <AuthGate
        returnTo={
          "/create/listing?category=" +
          form.category +
          "&brand=" +
          encodeURIComponent(form.brand)
        }
      >
        <Muted>
          Step {step + 1} of 4 ·{" "}
          {["The offer", "The arrangement", "Availability", "Review"][step]}
        </Muted>
        {step === 0 && (
          <>
            <Title>What are you sharing?</Title>
            <Muted>Give people a clear idea of what you can offer.</Muted>
            {!changeCategory && (
              <Row
                title={form.category}
                subtitle="Change type"
                onPress={() => setChangeCategory(true)}
              />
            )}
            {changeCategory &&
              types.map((type) => (
                <Row
                  key={type}
                  title={type[0].toUpperCase() + type.slice(1)}
                  right={<Label>{form.category === type ? "✓" : ""}</Label>}
                  onPress={() => change("category", type)}
                />
              ))}
            <Field
              label="Brand (optional)"
              value={form.brand}
              onChangeText={(v) => change("brand", v)}
              maxLength={60}
            />
            <Field
              label="Listing title"
              value={form.title}
              onChangeText={(v) => change("title", v)}
              placeholder="e.g. Netflix Premium for our household"
              maxLength={80}
            />
          </>
        )}
        {step === 1 && (
          <>
            <Title>Make it clear</Title>
            <Field
              label="What does each person get?"
              value={form.description}
              onChangeText={(v) => change("description", v)}
              multiline
              maxLength={2000}
            />
            <Field
              label="Monthly share per person ($)"
              value={form.share}
              onChangeText={(v) => change("share", v)}
              keyboardType="decimal-pad"
            />
            {form.category !== "housing" && (
              <Field
                label="Full plan price per month ($, optional)"
                value={form.total}
                onChangeText={(v) => change("total", v)}
                keyboardType="decimal-pad"
              />
            )}
            <Muted>
              The full plan price is used to explain savings. Enter a current,
              accurate amount.
            </Muted>
          </>
        )}
        {step === 2 && (
          <>
            <Title>Leave room for your people</Title>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Total places"
                  value={form.capacity}
                  onChangeText={(v) => change("capacity", v)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Places filled"
                  value={form.filled}
                  onChangeText={(v) => change("filled", v)}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <Field
              label="Location (optional)"
              value={form.location}
              onChangeText={(v) => change("location", v)}
              maxLength={100}
            />
            {form.category === "housing" && (
              <>
                <Title small>Available from</Title>
                <Calendar
                  value={form.moveIn}
                  onChange={(v) => change("moveIn", v)}
                />
                <Muted>
                  Housing publication requires identity verification. You can
                  save your listing while that service is being connected.
                </Muted>
              </>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <Title>{form.title || "Your listing"}</Title>
            <Muted>
              {form.brand || "Community service"} · {form.category}
            </Muted>
            <Label>{form.description}</Label>
            <Title>
              {form.share ? "$" + form.share : "Set your price"} / month
            </Title>
            <Muted>
              {Number(form.capacity) - Number(form.filled)} open · {form.filled}{" "}
              of {form.capacity} filled
            </Muted>
            <Muted>
              Posting confirms that you can offer this arrangement under the
              provider’s terms. Do not imply brand affiliation.
            </Muted>
            <Link onPress={() => go("/sharing-rules")}>
              Review the Sharing Rules
            </Link>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
