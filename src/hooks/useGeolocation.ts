import { useState, useEffect, useCallback, useRef } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: '\uc774 \ube0c\ub77c\uc6b0\uc800\ub294 \uc704\uce58 \uc11c\ube44\uc2a4\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4' });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          loading: false,
          error: null,
        });
      },
      (err) => {
        let message = '\uc704\uce58\ub97c \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4';
        if (err.code === 1) message = '\uc704\uce58 \uad8c\ud55c\uc774 \uac70\ubd80\ub418\uc5c8\uc2b5\ub2c8\ub2e4';
        if (err.code === 2) message = '\uc704\uce58 \uc815\ubcf4\ub97c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4';
        if (err.code === 3) message = '\uc704\uce58 \uc694\uccad \uc2dc\uac04\uc774 \ucd08\uacfc\ub418\uc5c8\uc2b5\ub2c8\ub2e4';
        setState({ location: null, loading: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: '\uc774 \ube0c\ub77c\uc6b0\uc800\ub294 \uc704\uce58 \uc11c\ube44\uc2a4\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4' });
      return;
    }

    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          loading: false,
          error: null,
        });
      },
      (err) => {
        let message = '\uc704\uce58\ub97c \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4';
        if (err.code === 1) message = '\uc704\uce58 \uad8c\ud55c\uc774 \uac70\ubd80\ub418\uc5c8\uc2b5\ub2c8\ub2e4';
        if (err.code === 2) message = '\uc704\uce58 \uc815\ubcf4\ub97c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4';
        if (err.code === 3) message = '\uc704\uce58 \uc694\uccad \uc2dc\uac04\uc774 \ucd08\uacfc\ub418\uc5c8\uc2b5\ub2c8\ub2e4';
        setState({ location: null, loading: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { ...state, getLocation, startWatching, stopWatching };
}