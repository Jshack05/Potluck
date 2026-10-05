import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  Title,
  Muted,
  Avatar,
  ResourceState,
  Empty,
} from "@/design/system";
import { useResource } from "@/services/client";
import { ListingRow } from "./discovery";
import type { Listing } from "./types";
export default function Profile() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    profile = useResource<{
      id: string;
      name: string;
      createdAt: string;
      listings: Listing[];
    }>("/profiles/" + id);
  return (
    <Shell title="Profile" back blue active="Splitfinder">
      <ResourceState {...profile} retry={profile.reload} />
      {profile.data && (
        <>
          <Avatar name={profile.data.name} size={88} />
          <Title>{profile.data.name}</Title>
          <Muted>
            Joined{" "}
            {new Date(profile.data.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Muted>
          <Title small>Shared by {profile.data.name.split(" ")[0]}</Title>
          {profile.data.listings.map((x) => (
            <ListingRow key={x.id} listing={x} />
          ))}
          {!profile.data.listings.length && (
            <Empty
              title="Nothing listed right now"
              detail="Their public listings will appear here."
              icon="discover"
            />
          )}
        </>
      )}
    </Shell>
  );
}
