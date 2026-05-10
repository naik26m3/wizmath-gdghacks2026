import React from 'react';
import { Share2, Save, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PromptInput from './PromptInput';
import GameConfigPanel from './GameConfigPanel';
import SavedGamesGrid from './SavedGamesGrid';

export default function LeftPane({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  gameConfig,
  onSave,
  isSaving,
  savedGames,
  savedGamesLoading,
  onLoadGame,
  onDeleteGame,
  currentTitle,
}) {
  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="font-heading font-bold text-base text-foreground">Teacher's Console</h2>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-heading gap-1.5 h-8"
            onClick={onSave}
            disabled={isSaving || !gameConfig}
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-heading gap-1.5 h-8 border-accent/30 text-accent hover:bg-accent/10"
            disabled={!gameConfig}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />

        <GameConfigPanel config={gameConfig} />

        <Separator className="bg-border/50" />

        <div>
          <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-chart-3" />
            Saved Mini-Games
          </h3>
          <SavedGamesGrid
            games={savedGames}
            onLoad={onLoadGame}
            onDelete={onDeleteGame}
            isLoading={savedGamesLoading}
          />
        </div>
      </div>
    </div>
  );
}