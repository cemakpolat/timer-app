import React, { useEffect, useRef } from 'react';
import { getWeatherEffect } from '../utils/weatherEffects';
import { getCanvasEffect, getCanvasOpacity, getCanvasQuality } from './weather-effects/canvasEffects';
import { renderDomWeatherEffect } from './weather-effects/domEffects';

const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
};

const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

const WeatherEffect = ({ type, config, width, height, paused = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const effectMeta = getWeatherEffect(type);
  const renderer = effectMeta.renderer;
  const configColor = config?.color ?? effectMeta.defaultConfig?.color ?? '#FFFFFF';
  const configOpacity = config?.opacity ?? effectMeta.defaultConfig?.opacity ?? 1;
  const configVelocity = config?.velocity ?? effectMeta.defaultConfig?.velocity ?? 1;
  const resolvedWidth = width ?? null;
  const resolvedHeight = height ?? null;
  const resolvedConfig = {
    ...config,
    color: configColor,
    opacity: configOpacity,
    velocity: configVelocity,
  };

  useEffect(() => {
    if (renderer !== 'canvas') {
      return undefined;
    }

    const effect = getCanvasEffect(type);
    const canvas = canvasRef.current;

    if (!effect || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    let particles = [];
    let frame = 0;
    let frameInterval = 1000 / 30;
    let lastFrameTime = performance.now();
    const canvasConfig = {
      color: configColor,
      opacity: configOpacity,
      velocity: configVelocity,
    };

    const stopAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const initializeScene = () => {
      const { particleCount, targetFPS, viewportWidth, viewportHeight } = getCanvasQuality(type, resolvedWidth, resolvedHeight);
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      frameInterval = 1000 / targetFPS;
      particles = Array.from({ length: particleCount }, (_, index) => effect.createParticle({
        canvas,
        ctx,
        config: canvasConfig,
        index,
        particleCount,
      }));
      frame = 0;
      lastFrameTime = performance.now();
    };

    const animate = (now) => {
      if (paused || document.hidden) {
        stopAnimation();
        return;
      }

      const currentTime = now || performance.now();
      const delta = currentTime - lastFrameTime;
      if (delta < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = currentTime;

      const frameContext = {
        ctx,
        canvas,
        config: canvasConfig,
        delta,
        frame,
        now: currentTime,
        particleCount: particles.length,
        opacityMultiplier: configOpacity,
        velocityMultiplier: configVelocity,
      };

      if (effect.prepareFrame) {
        effect.prepareFrame(frameContext);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      particles.forEach((particle) => {
        effect.updateParticle(particle, frameContext);
        effect.drawParticle(particle, frameContext);
      });

      frame += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (animationRef.current || paused || document.hidden) {
        return;
      }

      lastFrameTime = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      initializeScene();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
        return;
      }

      startAnimation();
    };

    initializeScene();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAnimation();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAnimation();
    };
  }, [configColor, configOpacity, configVelocity, paused, renderer, resolvedHeight, resolvedWidth, type]);

  if (type === 'none') {
    return null;
  }

  return (
    <div style={containerStyle}>
      {renderer === 'canvas' && getCanvasEffect(type) && (
        <canvas
          ref={canvasRef}
          data-testid="weather-effect-canvas"
          style={{
            ...canvasStyle,
            opacity: getCanvasOpacity(type),
          }}
        />
      )}
      {renderer === 'dom' && renderDomWeatherEffect(type, resolvedConfig)}
    </div>
  );
};

export default WeatherEffect;