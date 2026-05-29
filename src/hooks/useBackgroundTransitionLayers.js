import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_BACKGROUND_LAYER = { type: 'none', src: '', assetId: null, visible: false };

export default function useBackgroundTransitionLayers({
  backgroundImageUrl,
  backgroundImageAssetId,
  videoBackgroundUrl,
  videoBackgroundAssetId,
  slideshowImageUrl,
  slideshowImageAssetId,
  slideshowVideoUrl,
  slideshowVideoAssetId,
  releaseBackgroundImageUrl,
  releaseBackgroundVideoUrl,
  crossfadeMs,
}) {
  const [currentBackgroundLayer, setCurrentBackgroundLayer] = useState(EMPTY_BACKGROUND_LAYER);
  const [incomingBackgroundLayer, setIncomingBackgroundLayer] = useState(null);
  const [incomingBackgroundReady, setIncomingBackgroundReady] = useState(false);
  const crossfadeTimeoutRef = useRef(null);
  const imagePreloadTokenRef = useRef(0);
  const currentBackgroundLayerRef = useRef(currentBackgroundLayer);
  const incomingBackgroundLayerRef = useRef(incomingBackgroundLayer);

  useEffect(() => {
    currentBackgroundLayerRef.current = currentBackgroundLayer;
  }, [currentBackgroundLayer]);

  useEffect(() => {
    incomingBackgroundLayerRef.current = incomingBackgroundLayer;
  }, [incomingBackgroundLayer]);

  const releaseBackgroundLayer = useCallback((layer) => {
    if (!layer?.assetId) {
      return;
    }

    if (layer.type === 'image') {
      releaseBackgroundImageUrl(layer.assetId);
    } else if (layer.type === 'video') {
      releaseBackgroundVideoUrl(layer.assetId);
    }
  }, [releaseBackgroundImageUrl, releaseBackgroundVideoUrl]);

  const hasActiveSlideMedia = Boolean(slideshowImageUrl || slideshowVideoUrl);

  const targetBackgroundLayer = useMemo(() => {
    if (slideshowImageUrl) {
      return { type: 'image', src: slideshowImageUrl, assetId: slideshowImageAssetId };
    }

    if (!hasActiveSlideMedia && backgroundImageUrl) {
      return { type: 'image', src: backgroundImageUrl, assetId: backgroundImageAssetId };
    }

    if (slideshowVideoUrl) {
      return { type: 'video', src: slideshowVideoUrl, assetId: slideshowVideoAssetId };
    }

    if (!hasActiveSlideMedia && !backgroundImageUrl && videoBackgroundUrl) {
      return { type: 'video', src: videoBackgroundUrl, assetId: videoBackgroundAssetId };
    }

    return { type: 'none', src: '', assetId: null };
  }, [
    backgroundImageAssetId,
    backgroundImageUrl,
    hasActiveSlideMedia,
    slideshowImageAssetId,
    slideshowImageUrl,
    slideshowVideoAssetId,
    slideshowVideoUrl,
    videoBackgroundAssetId,
    videoBackgroundUrl,
  ]);

  useEffect(() => {
    const current = currentBackgroundLayerRef.current;
    const incoming = incomingBackgroundLayerRef.current;
    const target = targetBackgroundLayer;

    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }

    if (target.type === 'none') {
      releaseBackgroundLayer(incoming);
      releaseBackgroundLayer(current);
      setIncomingBackgroundLayer(null);
      setIncomingBackgroundReady(false);
      setCurrentBackgroundLayer(EMPTY_BACKGROUND_LAYER);
      return;
    }

    if (incoming && incoming.type === target.type && incoming.src === target.src) {
      return;
    }

    if (!incoming && current.type === target.type && current.src === target.src && current.visible) {
      return;
    }

    if (incoming && (incoming.type !== target.type || incoming.src !== target.src)) {
      releaseBackgroundLayer(incoming);
    }

    setIncomingBackgroundLayer({ ...target, visible: false });
    setIncomingBackgroundReady(false);
  }, [releaseBackgroundLayer, targetBackgroundLayer]);

  useEffect(() => {
    if (!incomingBackgroundLayer || incomingBackgroundLayer.type !== 'image' || incomingBackgroundReady) {
      return;
    }

    const token = imagePreloadTokenRef.current + 1;
    imagePreloadTokenRef.current = token;
    let cancelled = false;

    const preloadImage = new Image();
    preloadImage.decoding = 'async';

    const markReady = () => {
      if (cancelled || imagePreloadTokenRef.current !== token) {
        return;
      }

      setIncomingBackgroundReady(true);
    };

    preloadImage.onload = markReady;
    preloadImage.onerror = markReady;
    preloadImage.src = incomingBackgroundLayer.src;

    if (typeof preloadImage.decode === 'function') {
      preloadImage.decode().then(markReady).catch(markReady);
    }

    return () => {
      cancelled = true;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [incomingBackgroundLayer, incomingBackgroundReady]);

  useEffect(() => {
    if (!incomingBackgroundLayer || !incomingBackgroundReady || incomingBackgroundLayer.visible) {
      return;
    }

    const previousCurrentLayer = currentBackgroundLayerRef.current;
    let cancelled = false;
    let frameId = null;

    const startTransition = () => {
      if (cancelled) {
        return;
      }

      setIncomingBackgroundLayer((prev) => (prev ? { ...prev, visible: true } : prev));
      // Clear noTransition so the outgoing fade animates normally.
      setCurrentBackgroundLayer((prev) => ({ ...prev, visible: false, noTransition: false }));

      // noTransition: true tells the style builder to use transition:none for
      // the atomic slot-swap that happens at the end of the crossfade. Without
      // this the current-layer div (which was at opacity:0) would re-animate
      // 0→1 over the full duration, producing a second unwanted flash.
      const promotedLayer = { ...incomingBackgroundLayer, visible: true, noTransition: true };
      crossfadeTimeoutRef.current = setTimeout(() => {
        if (
          previousCurrentLayer
          && previousCurrentLayer.type !== 'none'
          && (
            previousCurrentLayer.type !== promotedLayer.type
            || previousCurrentLayer.src !== promotedLayer.src
            || previousCurrentLayer.assetId !== promotedLayer.assetId
          )
        ) {
          releaseBackgroundLayer(previousCurrentLayer);
        }

        setCurrentBackgroundLayer(promotedLayer);

        // Defer the incoming-layer removal by one paint frame. In React 18 the two
        // setState calls above are batched into the same commit, so the current-div's
        // new video-element src change (which briefly shows a black frame on reload)
        // and the incoming-div's disappearance would happen in the same frame —
        // revealing the black frame. By deferring, the incoming-div stays visible for
        // exactly one frame, covering the black frame while the new video starts up.
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => {
            setIncomingBackgroundLayer(null);
            setIncomingBackgroundReady(false);
            crossfadeTimeoutRef.current = null;
          });
        } else {
          setIncomingBackgroundLayer(null);
          setIncomingBackgroundReady(false);
          crossfadeTimeoutRef.current = null;
        }
      }, crossfadeMs + 40);
    };

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      frameId = window.requestAnimationFrame(() => {
        frameId = window.requestAnimationFrame(startTransition);
      });
    } else {
      frameId = setTimeout(startTransition, 32);
    }

    return () => {
      cancelled = true;

      // Only cancel the rAF frames. The crossfadeTimeoutRef must NOT be cleared
      // here because this cleanup fires whenever incomingBackgroundLayer.visible
      // flips from false→true (i.e. immediately after startTransition runs),
      // which would kill the timeout that promotes the layer and causes every
      // slide after the first to transition against an already-invisible outgoing
      // layer, making subsequent effects look instant.
      // crossfadeTimeoutRef is cleared in the targetBackgroundLayer effect (on
      // slide change) and on unmount — both of which are the correct times.
      if (frameId !== null) {
        if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(frameId);
        } else {
          clearTimeout(frameId);
        }
      }
    };
  }, [crossfadeMs, incomingBackgroundLayer, incomingBackgroundReady, releaseBackgroundLayer]);

  useEffect(() => () => {
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
      crossfadeTimeoutRef.current = null;
    }

    releaseBackgroundLayer(currentBackgroundLayerRef.current);
    releaseBackgroundLayer(incomingBackgroundLayerRef.current);
  }, [releaseBackgroundLayer]);

  return {
    currentBackgroundLayer,
    incomingBackgroundLayer,
    incomingBackgroundReady,
    setIncomingBackgroundReady,
    currentBackgroundLayerRef,
    incomingBackgroundLayerRef,
  };
}