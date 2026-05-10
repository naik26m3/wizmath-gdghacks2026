import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Gamepad2, Trash2, ArrowLeft, BookOpen, Target, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/studio/Navbar';

const colorMap = {
  green: 'from-primary/30 to-primary/10',
  orange: 'from-accent/30 to-accent/10',
  purple: 'from-chart-3/30 to-chart-3/10',
  blue: 'from-chart-4/30 to-chart-4/10',
  red: 'from-chart-5/30 to-chart-5/10',
};

const iconColorMap = {
  green: 'text-primary',
  orange: 'text-accent',
  purple: 'text-chart-3',
  blue: 'text-chart-4',
  red: 'text-chart-5',
};

export default function Library() {
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['miniGames'],
    queryFn: () => base44.entities.MiniGame.list('-created_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MiniGame.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniGames'] });
      toast.success('Game deleted');
    },
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-chart-3" />
                <h1 className="font-heading font-bold text-2xl text-foreground">Game Library</h1>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                {games.length} saved mini-game{games.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" className="rounded-full font-heading gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Studio
              </Button>
            </Link>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-20">
              <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg text-muted-foreground mb-1">No games yet</h3>
              <p className="text-sm text-muted-foreground/60 font-body mb-4">
                Head to the studio and create your first math game!
              </p>
              <Link to="/">
                <Button className="rounded-full font-heading gap-2">
                  <Rocket className="w-4 h-4" />
                  Create a Game
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game, index) => {
                const color = game.thumbnail_color || 'green';
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/?load=${game.id}`}>
                      <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.green} bg-card border border-border rounded-2xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center`}>
                            <Target className={`w-5 h-5 ${iconColorMap[color] || iconColorMap.green}`} />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteMutation.mutate(game.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <h3 className="font-heading font-bold text-base text-foreground mb-1 truncate">
                          {game.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2 leading-relaxed">
                          {game.description || game.prompt}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {game.math_concept && (
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {game.math_concept}
                            </Badge>
                          )}
                          {game.difficulty && (
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {game.difficulty}
                            </Badge>
                          )}
                          {game.game_config?.equation && (
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {game.game_config.equation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}