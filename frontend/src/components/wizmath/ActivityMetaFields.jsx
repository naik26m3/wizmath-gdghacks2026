import { useState } from 'react';
import { FieldLabel, fieldStyle } from '@/components/wizmath/hextech/Modal';
import { chamferTLBR } from '@/components/wizmath/hextech/tokens';

// Title + description + "let Arcane write it" — the body shared by the publish
// and edit dialogs, which were previously two near-identical copies.
//
// `onAutoGenerate(title, hint)` should resolve to a description string; the
// caller decides where that text comes from (live canvas vs. saved commands).
export default function ActivityMetaFields({
  title, onTitleChange,
  description, onDescriptionChange,
  onAutoGenerate,
  onError,
  onSubmitShortcut,
  disabled = false,
  rows = 8,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    if (!title.trim()) {
      onError?.('Enter a title first — that helps the AI write a good description.');
      return;
    }
    onError?.('');
    setIsGenerating(true);
    try {
      const generated = await onAutoGenerate(title.trim(), description.trim());
      if (generated) onDescriptionChange(generated);
    } catch (e) {
      onError?.(`Auto-generate failed: ${e.message || 'try again'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const busy = disabled || isGenerating;

  return (
    <>
      <FieldLabel>Title *</FieldLabel>
      <input
        autoFocus
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmitShortcut?.(); }}
        placeholder="e.g. Movable circle with sliders"
        maxLength={80}
        style={{ ...fieldStyle, marginBottom: 16 }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <FieldLabel style={{ marginBottom: 0 }}>Description</FieldLabel>
        <button
          type="button"
          onClick={handleAutoGenerate}
          disabled={busy}
          title="Let Arcane write a description from your title"
          className="hx-autogen-btn"
          style={{
            background: isGenerating ? 'rgba(67,226,210,.06)' : 'transparent',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"/>
          </svg>
          {isGenerating ? 'Generating…' : 'Auto-Generate'}
        </button>
      </div>

      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="What does this activity teach? — type a quick hint then click Auto-Generate, or leave blank for the AI to write from scratch."
        maxLength={3500}
        rows={rows}
        style={{
          ...fieldStyle,
          fontSize: 13, lineHeight: '20px',
          resize: 'vertical',
          clipPath: chamferTLBR(8),
        }}
      />
    </>
  );
}
