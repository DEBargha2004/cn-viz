import { Element } from "react-scroll";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MarkdownSection } from "./MarkdownSection";
import { VisualizationSection } from "./VisualizationSection";
import { type Topic } from "../../lib/content";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const visualizations = topic.visualizations || [];
  const elementName = `topic-${topic.id}`;

  // Check if markdown contains inline viz tags like {{viz:0}} or {{viz:network-osi-stack}}
  const vizTagRegex = /\{\{viz:([^}]+)\}\}/g;
  const hasInlineViz =
    visualizations.length > 0 && vizTagRegex.test(topic.markdown);

  if (!hasInlineViz || visualizations.length === 0) {
    return (
      <Element name={elementName}>
        <Card
          id={elementName}
          className="border shadow-sm bg-card transition-all duration-300 scroll-mt-20 md:scroll-mt-6"
        >
          <CardHeader className="border-b pb-4 mb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {topic.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MarkdownSection markdown={topic.markdown} />
            {visualizations.length > 0 && (
              <div className="space-y-4 pt-2 border-t">
                {visualizations.map((vizRef, index) => (
                  <VisualizationSection
                    key={index}
                    topicId={topic.id}
                    vizRef={vizRef}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Element>
    );
  }

  // Interleave markdown segments and inline viz components
  const segments: Array<
    | { type: "markdown"; content: string }
    | { type: "viz"; tag: string; index: number }
  > = [];

  const renderedIndices = new Set<number>();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(vizTagRegex.source, "g");

  while ((match = regex.exec(topic.markdown)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "markdown",
        content: topic.markdown.slice(lastIndex, match.index),
      });
    }

    const tagStr = match[1].trim();
    let vizIndex = -1;

    if (!isNaN(Number(tagStr))) {
      vizIndex = Number(tagStr);
    } else {
      vizIndex = visualizations.findIndex(
        (v) => v.vizKey === tagStr
      );
    }

    if (vizIndex >= 0 && vizIndex < visualizations.length) {
      segments.push({
        type: "viz",
        tag: tagStr,
        index: vizIndex,
      });
      renderedIndices.add(vizIndex);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < topic.markdown.length) {
    segments.push({
      type: "markdown",
      content: topic.markdown.slice(lastIndex),
    });
  }

  const unrenderedViz = visualizations
    .map((vizRef, index) => ({ vizRef, index }))
    .filter(({ index }) => !renderedIndices.has(index));

  return (
    <Element name={elementName}>
      <Card
        id={elementName}
        className="border shadow-sm bg-card transition-all duration-300 scroll-mt-20 md:scroll-mt-6"
      >
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
    </Element>
  );
}
