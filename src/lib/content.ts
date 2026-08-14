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

// Vite static discovery glob for chapter metas (keep eager as it's small and needed for routing/index)
const chapterMetaModules = import.meta.glob<{ default: unknown }>(
  "../../content/chapters/*/meta.json",
  { eager: true }
);

// Vite static discovery glob for topic JSON files (lazy to code-split content)
const topicModules = import.meta.glob(
  "../../content/chapters/*/topics/*.json"
);

let activeMetaModules: Record<string, { default: unknown }> = chapterMetaModules;
let activeTopicModules: Record<string, () => Promise<unknown>> = topicModules as unknown as Record<string, () => Promise<unknown>>;

export function setMockModulesForTest(
  metas: Record<string, { default: unknown }> | null,
  topics: Record<string, () => Promise<unknown>> | null
) {
  activeMetaModules = metas || chapterMetaModules;
  activeTopicModules = topics || (topicModules as unknown as Record<string, () => Promise<unknown>>);
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
 * Loads a single chapter asynchronously, resolving all topics and validating visualizations.
 */
export async function loadChapter(chapterSlug: string): Promise<Chapter> {
  const metaPath = `../../content/chapters/${chapterSlug}/meta.json`;
  const metaModule = activeMetaModules[metaPath];
  if (!metaModule) {
    throw new Error(`Chapter "${chapterSlug}" not found`);
  }

  const meta = chapterMetaSchema.parse(metaModule.default);

  const topicPromises = meta.topicOrder.map(async (topicId) => {
    const topicPath = `../../content/chapters/${chapterSlug}/topics/${topicId}.json`;
    const topicLoader = activeTopicModules[topicPath];
    if (!topicLoader) {
      throw new Error(`Topic "${topicId}" not found for chapter "${chapterSlug}"`);
    }

    const topicModule = (await topicLoader()) as { default: unknown };
    const topic = topicSchema.parse(topicModule.default);

    // Validate visualization keys
    for (const viz of topic.visualizations) {
      if (!vizRegistry[viz.vizKey]) {
        throw new Error(`Unknown visualization key "${viz.vizKey}" in topic "${topicId}"`);
      }
    }

    return topic;
  });

  const topics = await Promise.all(topicPromises);

  return {
    ...meta,
    topics,
  };
}
