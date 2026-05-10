import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Navbar from '@/components/studio/Navbar';
import LeftPane from '@/components/studio/LeftPane';
import GeoGebraStage from '@/components/studio/GeoGebraStage';

const GAME_CONFIG_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "A fun, game-like title for the mini-game" },
    description: { type: "string", description: "One-sentence description of the game objective" },
    math_concept: { type: "string", enum: ["slope", "vertex", "intercepts", "parabola", "linear", "quadratic", "systems", "other"] },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    thumbnail_color: { type: "string", enum: ["green", "orange", "purple", "blue", "red"] },
    game_config: {
      type: "object",
      properties: {
        equation: { type: "string", description: "Math equation using x as variable, e.g. '2*x+3' or 'x^2-4*x+3'" },
        graph_type: { type: "string", enum: ["linear", "quadratic", "cubic", "absolute_value"] },
        points: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: "Single letter label like A, B, V" },
              x: { type: "number" },
              y: { type: "number" }
            }
          },
          description: "Key points to highlight on the graph (vertex, intercepts, etc.)"
        },
        x_min: { type: "number" },
        x_max: { type: "number" },
        y_min: { type: "number" },
        y_max: { type: "number" },
        challenge_text: { type: "string", description: "The challenge question presented to the student" },
        target_answer: { type: "string", description: "The correct answer to the challenge" }
      }
    }
  }
};

export default function Studio() {
  const [prompt, setPrompt] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const queryClient = useQueryClient();

  // Fetch saved games
  const { data: savedGames = [], isLoading: savedGamesLoading } = useQuery({
    queryKey: ['miniGames'],
    queryFn: () => base44.entities.MiniGame.list('-created_date', 20),
  });

  // Generate game via LLM
  const generateMutation = useMutation({
    mutationFn: async (userPrompt) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a math game designer for a Roblox-style educational platform called MathQuest. 
A teacher wants to create an interactive math game. Generate a complete game configuration based on their description.

Teacher's request: "${userPrompt}"

Rules:
- The equation must use GeoGebra-compatible syntax (use * for multiplication, ^ for powers)
- Include relevant key points (vertex for parabolas, intercepts for lines, etc.)
- Set appropriate x_min, x_max, y_min, y_max to frame the graph nicely
- The challenge_text should be an engaging question for students
- Make it fun and educational`,
        response_json_schema: GAME_CONFIG_SCHEMA,
      });
      return result;
    },
    onSuccess: (data) => {
      setCurrentGame(data);
      toast.success('Game generated! Check the stage →');
    },
    onError: () => {
      toast.error('Failed to generate game. Try again.');
    }
  });

  // Save game
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentGame) return;
      const payload = {
        title: currentGame.title,
        description: currentGame.description,
        prompt: prompt,
        math_concept: currentGame.math_concept,
        difficulty: currentGame.difficulty,
        thumbnail_color: currentGame.thumbnail_color,
        game_config: currentGame.game_config,
      };
      return base44.entities.MiniGame.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniGames'] });
      toast.success('Game saved to your library!');
    },
    onError: () => {
      toast.error('Failed to save. Try again.');
    }
  });

  // Delete game
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MiniGame.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniGames'] });
      toast.success('Game deleted');
    },
  });

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    generateMutation.mutate(prompt);
  }, [prompt]);

  const handleLoadGame = useCallback((game) => {
    setCurrentGame({
      title: game.title,
      description: game.description,
      math_concept: game.math_concept,
      difficulty: game.difficulty,
      thumbnail_color: game.thumbnail_color,
      game_config: game.game_config,
    });
    setPrompt(game.prompt || '');
    toast.info(`Loaded "${game.title}"`);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      {/* Main Split Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane – Teacher's Console */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-r border-border overflow-hidden">
          <LeftPane
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={generateMutation.isPending}
            gameConfig={currentGame?.game_config}
            onSave={() => saveMutation.mutate()}
            isSaving={saveMutation.isPending}
            savedGames={savedGames}
            savedGamesLoading={savedGamesLoading}
            onLoadGame={handleLoadGame}
            onDeleteGame={(id) => deleteMutation.mutate(id)}
            currentTitle={currentGame?.title}
          />
        </div>

        {/* Right Pane – Game Stage */}
        <div className="flex-1 overflow-hidden">
          <GeoGebraStage
            gameConfig={currentGame?.game_config}
            gameTitle={currentGame?.title}
            challengeText={currentGame?.game_config?.challenge_text}
          />
        </div>
      </div>
    </div>
  );
}