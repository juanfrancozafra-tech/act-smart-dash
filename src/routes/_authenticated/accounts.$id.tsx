import { createFileRoute } from "@tanstack/react-router";
import { AccountDetailScreen } from "@/features/retention/components/AccountDetailScreen";

export const Route = createFileRoute("/_authenticated/accounts/$id")({
  head: () => ({
    meta: [
      { title: "Account · Retain" },
      { name: "description", content: "Account health, churn risk and one-click retention interventions." },
    ],
  }),
  component: AccountDetailRoute,
});

function AccountDetailRoute() {
  const { id } = Route.useParams();
  return <AccountDetailScreen accountId={id} />;
}
