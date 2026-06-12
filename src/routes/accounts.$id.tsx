import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAccount } from "@/features/retention/data/retentionData";
import { AccountDetailScreen } from "@/features/retention/components/AccountDetailScreen";

export const Route = createFileRoute("/accounts/$id")({
  loader: ({ params }) => {
    const account = getAccount(params.id);
    if (!account) throw notFound();
    return { account };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.account.name ?? "Account"} · Retain` },
      { name: "description", content: "Account health, churn risk and one-click retention interventions." },
    ],
  }),
  component: AccountDetailRoute,
});

function AccountDetailRoute() {
  const { account } = Route.useLoaderData();
  return <AccountDetailScreen account={account} />;
}
