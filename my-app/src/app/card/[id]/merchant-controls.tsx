import type { MerchantControlsState } from "@potluck/contracts";
import { AuthGate, ErrorText, ResourceState, Shell } from "@/design/system";
import { useResource } from "@/services/client";
import { useCard } from "@/features/potluck/card-scene";
import { MerchantControlsEditor } from "@/features/potluck/merchant-controls-editor";

export default function MerchantControls() {
  const card = useCard();
  const editable = card.data?.role === "host" && card.data.status !== "closed";
  const controls = useResource<MerchantControlsState>(
    editable ? `/cards/${card.id}/merchant-controls` : null,
  );
  if (card.user && card.data && editable && controls.data)
    return (
      <MerchantControlsEditor
        key={card.user.id + ":" + card.id}
        card={card.data}
        user={card.user}
        saved={controls.data}
      />
    );
  return (
    <Shell
      title="Spending controls"
      headerTitleSize={28}
      back
      active="Cards"
      returnTo={`/card/${card.id}/setup`}
    >
      <AuthGate returnTo={`/card/${card.id}/merchant-controls`}>
        <ResourceState {...card} retry={card.reload} />
        {editable && <ResourceState {...controls} retry={controls.reload} />}
        {card.data && !editable && (
          <ErrorText
            text={
              card.data.status === "closed"
                ? "This Card setup is closed."
                : "Only the Card Host can edit these controls."
            }
          />
        )}
      </AuthGate>
    </Shell>
  );
}
