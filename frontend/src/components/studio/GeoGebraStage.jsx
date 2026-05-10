import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GeoGebraStage({ gameConfig, gameTitle, challengeText }) {
  const containerRef = useRef(null);
  const appletRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load GeoGebra script
  useEffect(() => {
    if (document.getElementById('ggb-script')) {
      if (window.GGBApplet) initApplet();
      return;
    }
    const script = document.createElement('script');
    script.id = 'ggb-script';
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.onload = () => initApplet();
    document.head.appendChild(script);
  }, []);

  const initApplet = () => {
    if (!window.GGBApplet || !containerRef.current) return;
    const params = {
      appName: 'graphing',
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      showResetIcon: false,
      enableLabelDrags: false,
      enableShiftDragZoom: true,
      enableRightClick: false,
      capturingThreshold: null,
      showToolBarHelp: false,
      errorDialogsActive: false,
      useBrowserForJS: true,
      language: 'en',
      borderColor: 'transparent',
      appletOnLoad: (api) => {
        appletRef.current = api;
        setIsReady(true);
      }
    };
    const applet = new window.GGBApplet(params, '5.0');
    containerRef.current.innerHTML = '';
    applet.inject(containerRef.current);
  };

  // Inject game config into GeoGebra when it changes
  useEffect(() => {
    if (!isReady || !appletRef.current || !gameConfig) return;
    const api = appletRef.current;

    // Reset
    api.reset();

    // Set coordinate system bounds
    if (gameConfig.x_min != null && gameConfig.x_max != null) {
      api.setCoordSystem(
        gameConfig.x_min, gameConfig.x_max,
        gameConfig.y_min ?? -10, gameConfig.y_max ?? 10
      );
    }

    // Plot the equation
    if (gameConfig.equation) {
      api.evalCommand(`f(x) = ${gameConfig.equation}`);
      api.setColor('f', 34, 197, 94); // primary green
      api.setLineThickness('f', 4);
    }

    // Plot key points
    if (gameConfig.points) {
      gameConfig.points.forEach((pt) => {
        api.evalCommand(`${pt.label} = (${pt.x}, ${pt.y})`);
        api.setColor(pt.label, 250, 176, 5); // accent yellow
        api.setPointSize(pt.label, 6);
        api.setPointStyle(pt.label, 0);
      });
    }
  }, [gameConfig, isReady]);

  const handleReset = () => {
    if (appletRef.current) {
      appletRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Stage Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Rocket className="w-4 h-4 text-primary shrink-0" />
          <span className="font-heading font-semibold text-sm text-foreground truncate">
            {gameTitle || 'Game Stage'}
          </span>
          {gameConfig?.graph_type && (
            <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
              {gameConfig.graph_type}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Challenge Banner */}
      {challengeText && (
        <div className="px-4 py-2 bg-accent/10 border-b border-accent/20 shrink-0">
          <p className="text-xs font-body text-accent font-medium">
            🎯 {challengeText}
          </p>
        </div>
      )}

      {/* GeoGebra Container */}
      <div className="flex-1 relative bg-secondary/30">
        <div ref={containerRef} className="absolute inset-0" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto animate-pulse-glow">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-heading text-muted-foreground">Loading Game Stage…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}