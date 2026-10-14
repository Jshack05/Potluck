import { AuthGate, ErrorText, ResourceState, Shell } from "@/design/system";
import { useCard } from "@/features/potluck/card-scene";
import { CardEditor } from "@/features/potluck/card-editor";

export default function EditCard() {
  const card = useCard();
  const editable =
    card.data?.role === "host" && card.data.status === "setup_required";
  if (card.user && card.data && editable)
    return (
      <CardEditor
        key={card.user.id + ":" + card.id}
        card={card.data}
        user={card.user}
      />
    );
  return (
    <Shell
      title="Edit card"
      headerTitleSize={28}
      back
      hideNavigation
      active="Cards"
      backTo={`/card/${card.id}`}
    >
      <AuthGate returnTo={`/card/${card.id}/edit`}>
        <ResourceState {...card} retry={card.reload} />
        {card.data && !editable && (
          <ErrorText
            text={
              card.data.status === "closed"
                ? "This Card is closed."
                : "Only the Card Host can edit this Card."
            }
          />
        )}
      </AuthGate>
    </Shell>
  );
}
