import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { TopicCard } from "./TopicCard";
import type { Topic } from "../../lib/content";

test("TopicCard renders markdown and visualizations at default position when no inline tags present", () => {
  const topic: Topic = {
    id: "test-topic",
    title: "Test Topic Title",
    markdown: "This is standard markdown content.",
    visualizations: [
      {
        vizKey: "network-osi-stack",
        stateScope: "local",
        props: {},
        paramOverrides: {},
      },
    ],
  };

  render(<TopicCard topic={topic} />);

  expect(screen.getByText("Test Topic Title")).toBeDefined();
  expect(screen.getByText("This is standard markdown content.")).toBeDefined();
});

test("TopicCard renders visualizations inline when {{viz:0}} tags are specified in markdown", () => {
  const topic: Topic = {
    id: "test-topic-inline",
    title: "Inline Viz Topic",
    markdown: "Section 1 content.\n\n{{viz:0}}\n\nSection 2 content.",
    visualizations: [
      {
        vizKey: "network-osi-stack",
        stateScope: "local",
        props: {},
        paramOverrides: {},
      },
    ],
  };

  render(<TopicCard topic={topic} />);

  expect(screen.getByText("Inline Viz Topic")).toBeDefined();
  expect(screen.getByText("Section 1 content.")).toBeDefined();
  expect(screen.getByText("Section 2 content.")).toBeDefined();
});
