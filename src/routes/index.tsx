import { createFileRoute } from "@tanstack/react-router";
import { RetentionDashboard } from "@/features/retention/components/RetentionDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Retention Dashboard · Retain" },
      { name: "description", content: "Identify churn drivers and launch retention interventions in seconds." },
    ],
  }),
  component: RetentionDashboard,
});
