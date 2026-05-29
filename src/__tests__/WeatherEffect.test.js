import React from 'react';
import { render } from '@testing-library/react';
import WeatherEffect from '../components/WeatherEffect';
import { getCanvasEffect } from '../components/weather-effects/canvasEffects';

describe('WeatherEffect', () => {
  let getContextSpy;
  let originalRequestAnimationFrame;
  let originalCancelAnimationFrame;

  beforeEach(() => {
    getContextSpy = jest.spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({}));
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    window.requestAnimationFrame = jest.fn(() => 1);
    window.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  test('switching from matrix to a DOM effect does not trigger dependency-size warnings', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <WeatherEffect
        type="matrix"
        config={{ color: '#00FF41', opacity: 0.82, velocity: 1 }}
      />
    );

    rerender(
      <WeatherEffect
        type="cloudy"
        config={{ color: '#FFFFFF', opacity: 0.8, velocity: 1 }}
      />
    );

    const loggedOutput = errorSpy.mock.calls.flat().join(' ');
    expect(loggedOutput).not.toContain('The final argument passed to useEffect changed size between renders');

    errorSpy.mockRestore();
  });

  test('matrix glyph trails use the original katakana unicode range', () => {
    const matrixEffect = getCanvasEffect('matrix');
    const particle = matrixEffect.createParticle({
      canvas: { width: 1200, height: 800 },
      index: 0,
    });

    expect(particle.trail.join('')).toMatch(/^[\u30A0-\u30FF]+$/u);
  });
});