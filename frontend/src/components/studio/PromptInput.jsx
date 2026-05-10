import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function PromptInput({ value, onChange, onGenerate, isGenerating }) {
  return (
    <div className="space-y-3">
      <label className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        Describe Your Game
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Make a game about landing a spaceship on the vertex of a parabola…"
        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl min-h-[120px] resize-none font-body text-sm focus:ring-primary/50 focus:border-primary/50"
      />
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !value.trim()}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-xl h-11 gap-2 transition-all duration-200 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Game
          </>
        )}
      </Button>
    </div>
  );
}