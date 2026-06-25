import EmptyState from './EmptyState.jsx';
import ArtifactCard from './ArtifactCard.jsx';

export default function ArtifactPanel({
  rawText,
  isStreaming,
  grade,
  topic,
  mode,
  isReadOnly,
  readOnlyTimestamp,
  onRegenerate,
  addToast,
}) {
  const hasContent = !!rawText || isStreaming;

  return (
    <div className="h-full flex flex-col">
      {hasContent ? (
        <ArtifactCard
          rawText={rawText ?? ''}
          isStreaming={isStreaming}
          grade={grade}
          topic={topic}
          mode={mode}
          isReadOnly={isReadOnly}
          readOnlyTimestamp={readOnlyTimestamp}
          onRegenerate={onRegenerate}
          addToast={addToast}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
