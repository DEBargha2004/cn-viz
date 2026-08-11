import { z } from "zod";
import { vizRegistry } from "../visualizations/registry";

export const vizRefSchema = z.object({
  vizKey: z.string(),
  stateScope: z.enum(["local", "chapter", "app"]).default("local"),
  props: z.record(z.unknown()).default({}),
  paramOverrides: z.record(z.unknown()).default({}),
});

export const topicSchema = z.object({
  id: z.string(),
  title: z.string(),
  markdown: z.string(),
  visualizations: z.array(vizRefSchema).default([]),
});

export const chapterMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  topicOrder: z.array(z.string()),
});

export type VizRef = z.infer<typeof vizRefSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type ChapterMeta = z.infer<typeof chapterMetaSchema>;

export interface Chapter extends ChapterMeta {
  topics: Topic[];
}

// Vite static discovery glob for chapter metas
const chapterMetaModules = import.meta.glob<{ default: unknown }>(
  "../../content/chapters/*/meta.json",
  { eager: true }
);

// Vite static discovery glob for topic JSON files
const topicModules = import.meta.glob<{ default: unknown }>(
  "../../content/chapters/*/topics/*.json",
  { eager: true }
);

let activeMetaModules: Record<string, { default: unknown }> = chapterMetaModules;
let activeTopicModules: Record<string, { default: unknown }> = topicModules;

export function setMockModulesForTest(
  metas: Record<string, { default: unknown }> | null,
  topics: Record<string, { default: unknown }> | null
) {
  activeMetaModules = metas || chapterMetaModules;
  activeTopicModules = topics || topicModules;
}

/**
 * Retrieve all chapter metadata sorted by order.
 */
export function getAllChapterMetas(): ChapterMeta[] {
  return Object.values(activeMetaModules)
    .map((m) => chapterMetaSchema.parse(m.default))
    .sort((a, b) => a.order - b.order);
}

/**
 * Loads a single chapter, resolving all topics and validating visualizations.
 */
export function loadChapter(chapterSlug: string): Chapter {
  const metaPath = `../../content/chapters/${chapterSlug}/meta.json`;
  const metaModule = activeMetaModules[metaPath];
  if (!metaModule) {
    throw new Error(`Chapter "${chapterSlug}" not found`);
  }

  const meta = chapterMetaSchema.parse(metaModule.default);

  const topics: Topic[] = meta.topicOrder.map((topicId) => {
    const topicPath = `../../content/chapters/${chapterSlug}/topics/${topicId}.json`;
    const topicModule = activeTopicModules[topicPath];
    if (!topicModule) {
      throw new Error(`Topic "${topicId}" not found for chapter "${chapterSlug}"`);
    }

    const topic = topicSchema.parse(topicModule.default);

    // Validate visualization keys
    for (const viz of topic.visualizations) {
      if (!vizRegistry[viz.vizKey]) {
        throw new Error(`Unknown visualization key "${viz.vizKey}" in topic "${topicId}"`);
      }
    }

    return topic;
  });

  return {
    ...meta,
    topics,
  };
}
