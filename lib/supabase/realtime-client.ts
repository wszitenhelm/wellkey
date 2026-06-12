"use client";

import { useEffect, useRef, useState } from "react";
import {
  getBrowserSupabaseClient,
  hasBrowserSupabaseConfig
} from "@/lib/supabase/browser-client";

type TokenResponse = {
  expiresAt: number;
  token: string;
};

let cachedRealtimeToken: TokenResponse | null = null;
let inflightRealtimeTokenPromise: Promise<TokenResponse> | null = null;

async function fetchRealtimeToken() {
  const response = await fetch("/api/realtime/token", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "GET"
  });

  if (!response.ok) {
    throw new Error("REALTIME_TOKEN_REQUEST_FAILED");
  }

  return (await response.json()) as TokenResponse;
}

async function getFreshRealtimeToken() {
  const now = Math.floor(Date.now() / 1000);

  if (cachedRealtimeToken && cachedRealtimeToken.expiresAt - now > 45) {
    return cachedRealtimeToken;
  }

  if (!inflightRealtimeTokenPromise) {
    inflightRealtimeTokenPromise = fetchRealtimeToken().finally(() => {
      inflightRealtimeTokenPromise = null;
    });
  }

  cachedRealtimeToken = await inflightRealtimeTokenPromise;
  return cachedRealtimeToken;
}

export function useSupabaseRealtimeAuth(enabled = true) {
  const refreshTimerRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(!enabled || !hasBrowserSupabaseConfig());

  useEffect(() => {
    if (!enabled || !hasBrowserSupabaseConfig()) {
      setIsReady(true);
      return;
    }

    let cancelled = false;
    const supabase = getBrowserSupabaseClient();

    async function applyRealtimeToken() {
      const token = await getFreshRealtimeToken();

      if (cancelled) {
        return;
      }

      supabase.realtime.setAuth(token.token);
      setIsReady(true);

      const refreshDelayMs = Math.max((token.expiresAt - Math.floor(Date.now() / 1000) - 45) * 1000, 15_000);
      refreshTimerRef.current = window.setTimeout(() => {
        void applyRealtimeToken();
      }, refreshDelayMs);
    }

    void applyRealtimeToken();

    return () => {
      cancelled = true;
      setIsReady(false);

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [enabled]);

  return isReady;
}
