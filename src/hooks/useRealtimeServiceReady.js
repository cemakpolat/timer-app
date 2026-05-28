import { useEffect, useState } from 'react';
import RealtimeServiceFactory from '../services/RealtimeServiceFactory';

export default function useRealtimeServiceReady() {
  const [serviceReady, setServiceReady] = useState(false);

  useEffect(() => {
    if (RealtimeServiceFactory.getServiceSafe()) {
      setServiceReady(true);
    }

    const onInit = () => setServiceReady(true);
    RealtimeServiceFactory.onInit(onInit);

    const onError = (err) => {
      const msg = err && err.message ? `Realtime init failed: ${err.message}` : 'Realtime init failed';
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: msg, type: 'error', ttl: 5000 } }));
    };
    RealtimeServiceFactory.onError(onError);

    return () => {
      RealtimeServiceFactory.offInit(onInit);
      RealtimeServiceFactory.offError(onError);
    };
  }, []);

  return serviceReady;
}