import { Image } from "expo-image";
import { router } from "expo-router";
import { type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Listing, money, planSavings } from "./model";
export const colors = {
  canvas: "#F2F9FD",
  ink: "#273432",
  secondary: "#596562",
  blue: "#287AAA",
  pale: "#E4F1FC",
  green: "#006D67",
  mint: "#DDF3E9",
  line: "#DCE7EC",
};
export const artwork = {
  service: require("../../../assets/splitfinder/service.png"),
  groupArrow: require("../../../assets/splitfinder/group-arrow.png"),
  statusDot: require("../../../assets/splitfinder/status-dot.png"),
  savings: require("../../../assets/splitfinder/savings.png"),
  backdrop: require("../../../assets/splitfinder/backdrop.svg"),
  welcome: require("../../../assets/splitfinder/welcome.svg"),
  lucky: require("../../../assets/splitfinder/lucky.svg"),
  inbox: require("../../../assets/splitfinder/inbox.svg"),
  back: require("../../../assets/splitfinder/back.svg"),
  discover: require("../../../assets/splitfinder/discover.svg"),
  check: require("../../../assets/splitfinder/check.svg"),
  apartment: require("../../../assets/splitfinder/apartment.png"),
  fitness: require("../../../assets/splitfinder/fitness.png"),
  jordan: require("../../../assets/splitfinder/jordan.png"),
};
export function Txt({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[s.text, style]}>
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondaryButton,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Txt style={[s.buttonText, secondary && { color: colors.blue }]}>
        {label}
      </Txt>
    </Pressable>
  );
}
export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.panel, style]}>{children}</View>;
}
export function Heading({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Txt accessibilityRole="header" style={[s.heading, style]}>
      {children}
    </Txt>
  );
}
export function Note({ children }: { children: ReactNode }) {
  return <Txt style={s.note}>{children}</Txt>;
}
export function Avatar({
  name,
  photo = false,
  size = 44,
}: {
  name: string;
  photo?: boolean;
  size?: number;
}) {
  return photo ? (
    <Image
      source={artwork.jordan}
      accessibilityLabel={`${name} sample portrait`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <View
      style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Txt
        style={{
          color: colors.green,
          fontWeight: "700",
          fontSize: size > 60 ? 40 : 16,
        }}
      >
        {name[0]}
      </Txt>
    </View>
  );
}
export function Screen({
  children,
  title,
  back = true,
  hero = false,
  headerContent,
  scroll = true,
  footer,
}: {
  children: ReactNode;
  title: string;
  back?: boolean;
  hero?: boolean;
  headerContent?: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.outer}>
      <View style={s.shell}>
        <View
          style={[
            s.header,
            { paddingTop: Math.max(insets.top, 18) + 6 },
            hero && { paddingBottom: 18 },
          ]}
        >
          {!hero && (
            <Image
              source={artwork.backdrop}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={s.row}>
            {back && (
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/discover")
                }
                style={s.back}
              >
                <Image
                  source={artwork.back}
                  style={{ width: 12, height: 20 }}
                  contentFit="contain"
                />
              </Pressable>
            )}
            <Heading style={[{ flex: 1 }, hero && s.wordmark]}>{title}</Heading>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open inquiry inbox"
              onPress={() => router.push("/inbox")}
              style={s.round}
            >
              <Image
                source={artwork.inbox}
                style={{ width: 22, height: 22 }}
                contentFit="contain"
              />
            </Pressable>
          </View>
          {headerContent && (
            <View style={{ marginTop: 17 }}>{headerContent}</View>
          )}
        </View>
        {scroll ? (
          <ScrollView
            style={hero && s.discoverySurface}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              s.content,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>{children}</View>
        )}
        {footer && (
          <View
            style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
          >
            {footer}
          </View>
        )}
      </View>
    </View>
  );
}
export function ListingCard({ listing }: { listing: Listing }) {
  if (listing.image === "service") return <ServiceCard listing={listing} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${listing.title}`}
      onPress={() =>
        router.push({ pathname: "/listing/[id]", params: { id: listing.id } })
      }
      style={({ pressed }) => [s.listingCard, pressed && { opacity: 0.8 }]}
    >
      <Image
        source={artwork[listing.image]}
        style={s.listingImage}
        contentFit="cover"
        accessibilityLabel={
          listing.category === "housing"
            ? "Illustrative apartment interior"
            : "Illustrative fitness studio"
        }
      />
      <View style={{ gap: 8 }}>
        <Heading style={{ fontSize: 19 }}>{listing.title}</Heading>
        <Txt style={s.price}>{money(listing.shareMinor)} / person / month</Txt>
        {listing.moveIn && (
          <Txt style={{ color: colors.blue, fontWeight: "600", fontSize: 13 }}>
            Move in {listing.moveIn}
          </Txt>
        )}
        <Note>
          {listing.totalMinor ? `${money(listing.totalMinor)} total · ` : ""}
          {listing.facts}
        </Note>
        <Note>{listing.availability}</Note>
      </View>
    </Pressable>
  );
}
function ServiceCard({ listing }: { listing: Listing }) {
  const savings = planSavings(listing);
  const compact = useWindowDimensions().width < 410;
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        padding: 9,
        gap: 10,
      }}
    >
      <View style={{ padding: 7, gap: 10 }}>
        <View style={[s.row, { alignItems: "flex-start", gap: 10 }]}>
          <Image
            source={artwork.service}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Heading style={{ fontSize: 18, lineHeight: 22, color: "#172B3D" }}>
              {listing.title}
            </Heading>
            <Txt style={{ fontSize: 12, lineHeight: 16, color: "#657386" }}>
              {listing.subcategory}
            </Txt>
          </View>
          {listing.status && (
            <View style={[s.row, { gap: 4, paddingTop: 3 }]}>
              <Txt
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: "#168346",
                  fontWeight: "600",
                }}
              >
                {listing.status}
              </Txt>
              <Image
                source={artwork.statusDot}
                style={{ width: 8, height: 8 }}
              />
            </View>
          )}
        </View>
        <View
          style={[s.row, { gap: 5, alignItems: "baseline", flexWrap: "wrap" }]}
        >
          <Txt
            style={{
              fontSize: 34,
              lineHeight: 41,
              fontWeight: "700",
              color: colors.blue,
            }}
          >
            {money(listing.shareMinor)}
          </Txt>
          <Txt style={{ color: colors.blue }}>/ person / month</Txt>
        </View>
        <View
          style={[
            s.row,
            {
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 5,
            },
          ]}
        >
          <View style={{ gap: 3 }}>
            {listing.status === "Active" && (
              <Txt style={cardStyles.small}>Currently being paid</Txt>
            )}
            {listing.totalMinor !== undefined && (
              <Txt style={cardStyles.small}>
                Full plan: {money(listing.totalMinor)}/month
              </Txt>
            )}
          </View>
          <Txt style={[cardStyles.small, { color: "#172B3D" }]}>
            {listing.availability}
          </Txt>
        </View>
      </View>
      <View style={cardStyles.savings}>
        {savings && (
          <>
            <Image
              source={artwork.savings}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
            />
            <View style={{ flex: 1, minWidth: 125, gap: 2 }}>
              <Txt
                style={{
                  fontSize: compact ? 15 : 17,
                  lineHeight: 21,
                  fontWeight: "700",
                  color: "#006D46",
                }}
              >
                Save {money(savings.monthly)}/month
              </Txt>
              <Txt style={{ fontSize: 14, lineHeight: 17, color: "#006D46" }}>
                {money(savings.annual)}/year*
              </Txt>
              <Txt style={{ fontSize: 8.5, lineHeight: 11, color: "#657386" }}>
                *At the same prices for 12 months.
              </Txt>
            </View>
          </>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${listing.title} group`}
          onPress={() =>
            router.push({
              pathname: "/listing/[id]",
              params: { id: listing.id },
            })
          }
          style={cardStyles.action}
        >
          <Txt style={{ color: colors.blue, fontSize: 14, fontWeight: "600" }}>
            View group
          </Txt>
          <Image
            source={artwork.groupArrow}
            style={{ width: 16, height: 16 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
const cardStyles = StyleSheet.create({
  small: { fontSize: 12, lineHeight: 16, color: "#657386" },
  savings: {
    backgroundColor: "#EAF8F1",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
  },
  action: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#DEEDFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
});
export function MissingListing() {
  return (
    <Screen title="Listing unavailable">
      <Heading>This listing isn’t here.</Heading>
      <Note>Return to discovery to choose a sample listing.</Note>
      <Button
        label="Back to discovery"
        onPress={() => router.replace("/discover")}
      />
    </Screen>
  );
}
export const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#E7EFF3" },
  shell: {
    flex: 1,
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    backgroundColor: colors.canvas,
  },
  text: { fontSize: 16, lineHeight: 23, color: colors.ink },
  heading: { fontSize: 26, lineHeight: 33, fontWeight: "700" },
  wordmark: { color: "#172B3D", fontSize: 34, lineHeight: 42 },
  header: { paddingHorizontal: 20, paddingBottom: 18, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  round: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  discoverySurface: {
    backgroundColor: colors.canvas,
    overflow: "hidden",
  },
  content: { padding: 20, gap: 20 },
  panel: { backgroundColor: "white", borderRadius: 24, padding: 20, gap: 10 },
  button: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  secondaryButton: { backgroundColor: "white" },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  note: { color: colors.secondary, fontSize: 14, lineHeight: 20 },
  price: {
    color: colors.blue,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  avatar: {
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  listingCard: {
    padding: 16,
    gap: 12,
    borderRadius: 24,
    backgroundColor: "white",
  },
  listingImage: { width: "100%", height: 165, borderRadius: 16 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.canvas,
    gap: 10,
  },
  input: {
    minHeight: 52,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
});
