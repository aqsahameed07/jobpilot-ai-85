import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsView } from "@/components/applications/applications-view";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications — JobPilot AI" },
      {
        name: "description",
        content: "Track and organize every job application on a drag-and-drop pipeline board.",
      },
      { property: "og:title", content: "Applications — JobPilot AI" },
      {
        property: "og:description",
        content: "Track and organize every job application on a drag-and-drop pipeline board.",
      },
    ],
  }),
  component: ApplicationsView,
});
