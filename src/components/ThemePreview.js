import React, { useRef, useEffect } from 'react';

// Lightweight preview canvas for theme thumbnails.
// Supports small, cheap previews for: aurora (gradient bands), snow (soft circular flakes), and glass (frosted card sheen).
const ThemePreview = ({ theme, width = 120, height = 70 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    let last = performance.now();

    const previewConfig = theme.previewConfig || {};

    // ---------- Aurora (drifting gradient bands) ----------
    const initAurora = () => {
      const layers = [
        { speed: 0.02, offset: Math.random() * 200, opacity: 0.55 },
        { speed: 0.04, offset: Math.random() * 200, opacity: 0.32 }
      ];

      const draw = (now) => {
        const dt = (now - last) / 1000;
        last = now;
        ctx.clearRect(0, 0, width, height);

        // subtle background
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#041526');
        bg.addColorStop(1, '#071f2b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        layers.forEach((layer, i) => {
          layer.offset += layer.speed * (20 + i * 10) * dt * 60;
          const gx = layer.offset % (width * 2) - width;
          const gradient = ctx.createLinearGradient(gx, 0, gx + width, height);
          if (i === 0) {
            gradient.addColorStop(0, `rgba(109,211,255,${layer.opacity})`);
            gradient.addColorStop(0.5, `rgba(109,211,255,${layer.opacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(122,47,247,0)');
          } else {
            gradient.addColorStop(0, `rgba(0,255,200,${layer.opacity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(109,211,255,${layer.opacity * 0.2})`);
            gradient.addColorStop(1, 'rgba(122,47,247,0)');
          }

          ctx.globalAlpha = layer.opacity;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 4) {
            const y = height * 0.6 + Math.sin((x + layer.offset) * 0.02 + i) * (8 + i * 4);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        if (visibleRef.current) animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);
    };

    // ---------- Snow (layered soft circular flakes) ----------
    const initSnow = () => {
      const layerCount = 3;
      const layers = [];
      for (let l = 0; l < layerCount; l++) {
        const count = Math.max(6, Math.floor(8 / (l + 1)));
        const particles = [];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: (1 + Math.random() * 2) * (1 + l * 0.6),
            speed: 0.2 + Math.random() * 0.6 + l * 0.2,
            drift: (Math.random() - 0.5) * 0.6 * (1 + l * 0.4)
          });
        }
        layers.push({ particles, opacity: 0.9 - l * 0.25 });
      }

      const draw = (now) => {
        const dt = (now - last) / 1000;
        last = now;
        ctx.clearRect(0, 0, width, height);

        // backdrop
        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, '#f5f9ff');
        bg.addColorStop(1, '#eaf4ff');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        layers.forEach((layer, li) => {
          ctx.globalAlpha = layer.opacity;
          layer.particles.forEach(p => {
            p.y += p.speed * dt * 60;
            p.x += p.drift * dt * 60 + Math.sin((p.y + li * 10) * 0.02) * 0.3;
            if (p.y > height + 4) {
              p.y = -4 - Math.random() * 8;
              p.x = Math.random() * width;
            }

            // soft circular flake
            const r = p.size;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            grad.addColorStop(0, 'rgba(255,255,255,0.95)');
            grad.addColorStop(0.6, 'rgba(255,255,255,0.6)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
          });
        });
        ctx.globalAlpha = 1;

        if (visibleRef.current) animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);
    };

    // ---------- Frosted Glass (frosted card + moving sheen) ----------
    const initGlass = () => {
      let sheen = 0;
      const draw = (now) => {
        const dt = (now - last) / 1000;
        last = now;
        sheen = (sheen + dt * 0.4) % 2; // loop 0..2

        // backdrop gradient
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#0b1220');
        bg.addColorStop(1, '#0f172a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // frosted card
        const cardW = width * 0.84;
        const cardH = height * 0.66;
        const cardX = (width - cardW) / 2;
        const cardY = (height - cardH) / 2;

        // semi-transparent card
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        roundRect(ctx, cardX, cardY, cardW, cardH, 6);
        ctx.fill();

        // inner soft shadow
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        roundRect(ctx, cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1, 6);
        ctx.stroke();

        // moving sheen
        const sheenGrad = ctx.createLinearGradient(cardX + (sheen - 1) * cardW, cardY, cardX + sheen * cardW, cardY + cardH);
        sheenGrad.addColorStop(0, 'rgba(255,255,255,0)');
        sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
        sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheenGrad;
        roundRect(ctx, cardX, cardY, cardW, cardH, 6);
        ctx.fill();

        // small highlight line
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 6, cardY + 8);
        ctx.lineTo(cardX + cardW - 6, cardY + 8);
        ctx.stroke();

        if (visibleRef.current) animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);
    };

    // Helper for rounded rect path
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // Decide which preview to initialize
    if (previewConfig.animation === 'aurora') {
      initAurora();
    } else if (previewConfig.particle === 'snow' || previewConfig.animation === 'snow') {
      initSnow();
    } else if (previewConfig.blur || previewConfig.animation === 'glass' || previewConfig.animation === 'frost') {
      initGlass();
    } else {
      // Default static swatch
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = theme.bg || '#222';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = theme.accent || '#888';
      ctx.fillRect(width - 18, height - 10, 12, 6);
    }

    // Pause when offscreen using IntersectionObserver
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        visibleRef.current = e.isIntersecting;
        if (e.isIntersecting && !animRef.current) {
          last = performance.now();
          // Restart by reloading page (cheap approach): just kick the rAF loop
          // The specific init functions already started an rAF when called above; if canceled, we simply start a minimal loop.
          animRef.current = requestAnimationFrame(() => { last = performance.now(); });
        }
        if (!e.isIntersecting && animRef.current) {
          cancelAnimationFrame(animRef.current);
          animRef.current = null;
        }
      });
    }, { threshold: 0.1 });

    obs.observe(canvas);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      obs.disconnect();
    };
  }, [theme, width, height]);

  return (
    <canvas ref={canvasRef} style={{ borderRadius: 6, display: 'block' }} aria-hidden />
  );
};

export default ThemePreview;
