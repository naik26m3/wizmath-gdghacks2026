import React from 'react';
import { Target, TrendingUp, Crosshair } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GameConfigPanel({ config }) {
  if (!config) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
        <Target className="w-4 h-4 text-chart-4" />
        Game Parameters
      </h3>
      <div className="bg-secondary/50 rounded-xl p-3 space-y-2.5 border border-border/50">
        {config.equation && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-body">Equation</span>
            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md text-accent">
              {config.equation}
            </code>
          </div>
        )}
        {config.graph_type && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-body">Type</span>
            <Badge variant="secondary" className="text-xs font-heading capitalize">
              {config.graph_type}
            </Badge>
          </div>
        )}
        {config.challenge_text && (
          <div className="pt-1.5 border-t border-border/50">
            <p className="text-xs text-foreground/80 font-body leading-relaxed">
              <Crosshair className="w-3 h-3 inline mr-1 text-accent" />
              {config.challenge_text}
            </p>
          </div>
        )}
        {config.points && config.points.length > 0 && (
          <div className="pt-1.5 border-t border-border/50 space-y-1">
            <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Key Points
            </span>
            <div className="flex flex-wrap gap-1.5">
              {config.points.map((pt, i) => (
                <Badge key={i} variant="outline" className="text-xs font-mono bg-muted/50">
                  {pt.label}: ({pt.x}, {pt.y})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}