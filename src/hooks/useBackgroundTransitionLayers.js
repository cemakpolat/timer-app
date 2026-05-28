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
    setIncomingBackgroundReady(target.type === 'image');
  }, [releaseBackgroundLayer, targetBackgroundLayer]);

  useEffect(() => {
    if (!incomingBackgroundLayer || !incomingBackgroundReady || incomingBackgroundLayer.visible) {
      return;
    }

    const previousCurrentLayer = currentBackgroundLayerRef.current;

    setIncomingBackgroundLayer((prev) => (prev ? { ...prev, visible: true } : prev));
    setCurrentBackgroundLayer((prev) => ({ ...prev, visible: false }));

    const promotedLayer = { ...incomingBackgroundLayer, visible: true };
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
      setIncomingBackgroundLayer(null);
      setIncomingBackgroundReady(false);
      crossfadeTimeoutRef.current = null;
    }, crossfadeMs + 40);

    return () => {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
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