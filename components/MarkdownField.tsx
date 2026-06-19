import ReactMarkdown from "react-markdown";

export function MarkdownField({ content }: { content: string | null }) {
  if (!content) return <span className="text-gray-400 text-sm italic">—</span>;
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
