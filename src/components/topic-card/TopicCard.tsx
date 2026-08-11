import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MarkdownSection } from "./MarkdownSection";
import { VisualizationSection } from "./VisualizationSection";
import { type Topic } from "../../lib/content";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Card className="border shadow-sm bg-card transition-all duration-300">
      <CardHeader className="border-b pb-4 mb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          {topic.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MarkdownSection markdown={topic.markdown} />
        {topic.visualizations && topic.visualizations.length > 0 && (
          <div className="space-y-4 pt-2">
            {topic.visualizations.map((vizRef, i) => (
              <VisualizationSection key={i} topicId={topic.id} vizRef={vizRef} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
