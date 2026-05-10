import React from 'react';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  green: 'from-primary/20 to-primary/5 border-primary/30',
  orange: 'from-accent/20 to-accent/5 border-accent/30',
  purple: 'from-chart-3/20 to-chart-3/5 border-chart-3/30',
  blue: 'from-chart-4/20 to-chart-4/5 border-chart-4/30',
  red: 'from-chart-5/20 to-chart-5/5 border-chart-5/30',
};

export default function SavedGamesGrid({ games, onLoad, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-6">
        <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-body">No saved games yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
      <AnimatePresence>
        {games.map((game) => {
          const color = game.thumbnail_color || 'green';
          const gradientClass = colorMap[color] || colorMap.green;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`bg-gradient-to-r ${gradientClass} border rounded-xl p-3 cursor-pointer group hover:scale-[1.01] transition-transform`}
              onClick={() => onLoad(game)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-semibold text-sm text-foreground truncate">
                    {game.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                    {game.description || game.prompt}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
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
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); onLoad(game); }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(game.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}