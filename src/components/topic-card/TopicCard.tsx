import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MarkdownSection } from "./MarkdownSection";
import { VisualizationSection } from "./VisualizationSection";
import { type Topic } from "../../lib/content";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const visualizations = topic.visualizations || [];

  // Check if markdown contains inline viz tags like {{viz:0}} or {{viz:network-osi-stack}}
  const vizTagRegex = /\{\{viz:([^}]+)\}\}/g;
  const hasInlineViz =
    visualizations.length > 0 && vizTagRegex.test(topic.markdown);

  if (!hasInlineViz || visualizations.length === 0) {
    return (
      <Card className="border shadow-sm bg-card transition-all duration-300">
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {topic.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MarkdownSection markdown={topic.markdown} />
          {visualizations.length > 0 && (
            <div className="space-y-4 pt-2">
              {visualizations.map((vizRef, i) => (
                <VisualizationSection
                  key={i}
                  topicId={topic.id}
                  vizRef={vizRef}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Parse markdown into segments (text and inline visualizations)
  const segments: Array<
    { type: "markdown"; content: string } | { type: "viz"; index: number }
  > = [];

  const renderedIndices = new Set<number>();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  vizTagRegex.lastIndex = 0;

  while ((match = vizTagRegex.exec(topic.markdown)) !== null) {
    const textBefore = topic.markdown.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      segments.push({ type: "markdown", content: textBefore });
    }

    const tagParam = match[1].trim();
    let targetIndex = -1;

    if (/^\d+$/.test(tagParam)) {
      targetIndex = parseInt(tagParam, 10);
    } else {
      targetIndex = visualizations.findIndex(
        (v, i) => v.vizKey === tagParam && !renderedIndices.has(i),
      );
    }

    if (
      targetIndex >= 0 &&
      targetIndex < visualizations.length &&
      !renderedIndices.has(targetIndex)
    ) {
      segments.push({ type: "viz", index: targetIndex });
      renderedIndices.add(targetIndex);
    }

    lastIndex = vizTagRegex.lastIndex;
  }

  const remainingText = topic.markdown.slice(lastIndex);
  if (remainingText.trim()) {
    segments.push({ type: "markdown", content: remainingText });
  }

  const unrenderedViz = visualizations
    .map((vizRef, index) => ({ vizRef, index }))
    .filter(({ index }) => !renderedIndices.has(index));

  return (
    <Card className="border shadow-sm bg-card transition-all duration-300">
      <CardHeader className="border-b pb-4 mb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          {topic.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {segments.map((seg, i) => {
          if (seg.type === "markdown") {
            return <MarkdownSection key={`md-${i}`} markdown={seg.content} />;
          } else {
            return (
              <VisualizationSection
                key={`viz-${seg.index}`}
                topicId={topic.id}
                vizRef={visualizations[seg.index]}
              />
            );
          }
        })}
        {unrenderedViz.length > 0 && (
          <div className="space-y-4 pt-2">
            {unrenderedViz.map(({ vizRef, index }) => (
              <VisualizationSection
                key={`bottom-viz-${index}`}
                topicId={topic.id}
                vizRef={vizRef}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
