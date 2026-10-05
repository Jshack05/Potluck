import { Shell, AuthGate, ResourceState, Empty } from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Listing, Collection } from "./types";
import { ListingRow } from "./discovery";
export default function Saved() {
  const { user } = useClient(),
    list = useResource<Collection<Listing>>(user ? "/saved" : null);
  return (
    <Shell title="Saved" back blue active="Splitfinder">
      <AuthGate returnTo="/saved">
        <ResourceState {...list} retry={list.reload} />
        {list.data?.items.map((x) => (
          <ListingRow key={x.id} listing={x} />
        ))}
        {list.data?.items.length === 0 && (
          <Empty
            title="Keep a good find close"
            detail="Save listings to return to them when you’re ready to reach out."
            icon="discover"
          />
        )}
      </AuthGate>
    </Shell>
  );
}
