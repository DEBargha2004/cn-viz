import { test, expect, afterEach } from "vitest";
import { loadChapter, setMockModulesForTest } from "./content";

afterEach(() => {
  setMockModulesForTest(null, null);
});

test("loadChapter parses valid chapter and orders topics correctly", async () => {
  const mockMetas = {
    "../../content/chapters/test-chapter/meta.json": {
      default: {
        id: "test-chapter",
        title: "Test Chapter",
        order: 1,
        topicOrder: ["topic-b", "topic-a"],
      },
    },
  };

  const mockTopics = {
    "../../content/chapters/test-chapter/topics/topic-a.json": async () => ({
      default: {
        id: "topic-a",
        title: "Topic A",
        markdown: "Content A",
        visualizations: [],
      },
    }),
    "../../content/chapters/test-chapter/topics/topic-b.json": async () => ({
      default: {
        id: "topic-b",
        title: "Topic B",
        markdown: "Content B",
        visualizations: [
          {
            vizKey: "sine-wave",
            stateScope: "local",
            props: {},
            paramOverrides: {},
          },
        ],
      },
    }),
  };

  setMockModulesForTest(mockMetas, mockTopics);

  const chapter = await loadChapter("test-chapter");
  expect(chapter.id).toBe("test-chapter");
  expect(chapter.title).toBe("Test Chapter");
  expect(chapter.topics).toHaveLength(2);
  expect(chapter.topics[0].id).toBe("topic-b");
  expect(chapter.topics[1].id).toBe("topic-a");
  expect(chapter.topics[0].visualizations[0].vizKey).toBe("sine-wave");
});

test("loadChapter throws error when chapter meta is missing", async () => {
  setMockModulesForTest({}, {});
  await expect(loadChapter("missing-chapter")).rejects.toThrow('Chapter "missing-chapter" not found');
});

test("loadChapter throws error when topic is listed in meta but file is missing", async () => {
  const mockMetas = {
    "../../content/chapters/test-chapter/meta.json": {
      default: {
        id: "test-chapter",
        title: "Test Chapter",
        order: 1,
        topicOrder: ["missing-topic"],
      },
    },
  };

  setMockModulesForTest(mockMetas, {});
  await expect(loadChapter("test-chapter")).rejects.toThrow('Topic "missing-topic" not found');
});

test("loadChapter throws validation error when chapter meta schema is violated", async () => {
  const mockMetas = {
    "../../content/chapters/test-chapter/meta.json": {
      default: {
        id: "test-chapter",
        // missing title
        order: 1,
        topicOrder: [],
      },
    },
  };

  setMockModulesForTest(mockMetas, {});
  await expect(loadChapter("test-chapter")).rejects.toThrow();
});

test("loadChapter throws validation error when topic uses unknown vizKey", async () => {
  const mockMetas = {
    "../../content/chapters/test-chapter/meta.json": {
      default: {
        id: "test-chapter",
        title: "Test Chapter",
        order: 1,
        topicOrder: ["topic-a"],
      },
    },
  };

  const mockTopics = {
    "../../content/chapters/test-chapter/topics/topic-a.json": async () => ({
      default: {
        id: "topic-a",
        title: "Topic A",
        markdown: "Content A",
        visualizations: [
          {
            vizKey: "unregistered-key",
            stateScope: "local",
          },
        ],
      },
    }),
  };

  setMockModulesForTest(mockMetas, mockTopics);
  await expect(loadChapter("test-chapter")).rejects.toThrow('Unknown visualization key "unregistered-key"');
});
