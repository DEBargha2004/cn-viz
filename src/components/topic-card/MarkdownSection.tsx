import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownSectionProps {
  markdown: string;
}

export function MarkdownSection({ markdown }: MarkdownSectionProps) {
  return (
    <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://") || href?.startsWith("//");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
