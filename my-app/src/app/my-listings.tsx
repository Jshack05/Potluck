import { View } from "react-native";
import {
  Shell,
  Title,
  Muted,
  Action,
  Link,
  ResourceState,
  AuthGate,
  Empty,
  ErrorText,
  go,
  money,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import type { Listing, Collection } from "@/features/potluck/types";
export default function MyListings() {
  const { user } = useClient(),
    list = useResource<Collection<Listing>>(user ? "/my-listings" : null),
    act = useAction(),
    command = useCommand();
  return (
    <Shell
      title="Your listings"
      back
      blue
      active="Splitfinder"
      footer={
        user && (
          <Action
            label="Create a listing"
            onPress={() => go("/create/listing")}
          />
        )
      }
    >
      <AuthGate returnTo="/my-listings">
        <ResourceState {...list} retry={list.reload} />
        <ErrorText text={act.error} />
        {list.data?.items.map((x) => (
          <View key={x.id} style={{ paddingVertical: 14, gap: 10 }}>
            <Title small>{x.title}</Title>
            <Muted>
              {money(x.shareMinor)} / month · {x.status.replaceAll("_", " ")}
            </Muted>
            {x.status === "verification_required" && (
              <Muted>
                Your draft is saved. Publishing needs housing verification,
                which is not connected yet.
              </Muted>
            )}
            {x.status !== "closed" && (
              <>
                <Link onPress={() => go("/create/listing?id=" + x.id)}>
                  Edit listing
                </Link>
                {x.status === "draft" && (
                  <Link
                    onPress={() =>
                      act.run(async () => {
                        await command("/listings/" + x.id + "/publish", {
                          expectedVersion: x.version,
                        });
                        await list.reload();
                      })
                    }
                  >
                    Publish listing
                  </Link>
                )}
                <Link
                  danger
                  onPress={() =>
                    act.run(async () => {
                      await command("/listings/" + x.id + "/close", {
                        expectedVersion: x.version,
                      });
                      await list.reload();
                    })
                  }
                >
                  Close listing
                </Link>
              </>
            )}
          </View>
        ))}
        {list.data?.items.length === 0 && (
          <Empty
            title="Make space for someone"
            detail="Create your first listing. People can introduce themselves before either of you commits."
            icon="discover"
          />
        )}
      </AuthGate>
    </Shell>
  );
}
