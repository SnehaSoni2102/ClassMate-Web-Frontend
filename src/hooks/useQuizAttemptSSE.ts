import { useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/types/api";
import { safeLocalStorage } from "@/lib/utils";

export type QuizAttemptEventType =
  | "quiz-answer-saved"
  | "quiz-question-all-responded"
  | "quiz-next-question";

export type QuizAttemptTop5Entry = {
  userId: string;
  marks: number;
  timeTaken: number;
};

export type QuizAnswerSavedEvent = {
  eventType: "quiz-answer-saved";
  quizId: string;
  questionId: string;
  userId: string;
  score: number;
  totalTimeSpent: number;
  top5: QuizAttemptTop5Entry[];
  timestamp: string;
};

export type QuizQuestionAllRespondedEvent = {
  eventType: "quiz-question-all-responded";
  quizId: string;
  questionId: string;
  userId: string;
  scope: "global" | "group";
  groupId?: string;
  expectedCount: number;
  respondedCount: number;
  top5: QuizAttemptTop5Entry[];
  timestamp: string;
};

export type QuizNextQuestionEvent = {
  eventType: "quiz-next-question";
  quizId: string;
  nextQuestionIndex: number;
  nextQuestionId?: string;
  timestamp: string;
};

export type QuizAttemptEvent =
  | QuizAnswerSavedEvent
  | QuizQuestionAllRespondedEvent
  | QuizNextQuestionEvent;

export type QuizAttemptSSEState = {
  status: "idle" | "connecting" | "open" | "closed" | "error";
  error: string | null;
  lastEvent: QuizAttemptEvent | null;
  events: QuizAttemptEvent[];
};

type UseQuizAttemptSSEParams = {
  quizId: string;
  /** Full base URL, e.g. http://localhost:9000/api */
  baseUrl?: string;
  /** Cap event log length to avoid unbounded memory. */
  maxEvents?: number;
};

/**
 * Header-authenticated SSE client (fetch streaming + manual SSE parsing).
 * Native EventSource can't set Authorization headers, so we use fetch().
 */
export function useQuizAttemptSSE({
  quizId,
  baseUrl,
  maxEvents = 50,
}: UseQuizAttemptSSEParams): QuizAttemptSSEState {
  const [state, setState] = useState<QuizAttemptSSEState>({
    status: "idle",
    error: null,
    lastEvent: null,
    events: [],
  });

  const abortRef = useRef<AbortController | null>(null);

  const resolvedBaseUrl = useMemo(() => {
    return baseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";
  }, [baseUrl]);

  useEffect(() => {
    if (!quizId) return;

    const token = safeLocalStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Missing auth token. Please sign in again.",
      }));
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      ...prev,
      status: "connecting",
      error: null,
    }));

    const normalizeBase = (u: string) => (u.endsWith("/") ? u.slice(0, -1) : u);

    // In some deployments, REST uses `/api` prefix but SSE is mounted without it.
    // Try primary base first; on 404, fall back to stripping trailing `/api`.
    const primaryBase = normalizeBase(resolvedBaseUrl);
    const fallbackBase =
      primaryBase.toLowerCase().endsWith("/api") ? primaryBase.slice(0, -4) : null;

    const buildUrl = (b: string) => `${b}/quiz-attempt/events/${quizId}`;

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const pushEvent = (evt: QuizAttemptEvent) => {
      setState((prev) => {
        const nextEvents = [evt, ...prev.events].slice(0, maxEvents);
        return {
          ...prev,
          status: "open",
          lastEvent: evt,
          events: nextEvents,
        };
      });
    };

    const parseAndDispatch = (rawEvent: string) => {
      // SSE event block is multiple "field: value" lines separated by \n and ends with blank line.
      // We care about: event + data.
      const lines = rawEvent.split(/\r?\n/);
      let eventName: string | null = null;
      const dataLines: string[] = [];

      for (const line of lines) {
        if (!line) continue;
        if (line.startsWith(":")) continue; // comment/keepalive
        if (line.startsWith("event:")) {
          eventName = line.slice("event:".length).trim();
          continue;
        }
        if (line.startsWith("data:")) {
          dataLines.push(line.slice("data:".length).trim());
          continue;
        }
      }

      const dataText = dataLines.join("\n");
      if (!dataText) return;

      try {
        const payload = JSON.parse(dataText);
        // Prefer eventType from payload; fall back to SSE event name.
        const normalizedType =
          (payload?.eventType as QuizAttemptEventType | undefined) ||
          (eventName as QuizAttemptEventType | null);

        if (!normalizedType) return;
        pushEvent({ ...payload, eventType: normalizedType } as QuizAttemptEvent);
      } catch (e: any) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: e?.message || "Failed to parse SSE event payload.",
        }));
      }
    };

    const connect = async (url: string) => {
      const resp = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      return resp;
    };

    (async () => {
      try {
        const primaryUrl = buildUrl(primaryBase);
        let resp = await connect(primaryUrl);

        if (resp.status === 404 && fallbackBase) {
          const fallbackUrl = buildUrl(fallbackBase);
          resp = await connect(fallbackUrl);
        }

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(
            `SSE connection failed (${resp.status}). ${text || resp.statusText}`.trim(),
          );
        }

        if (!resp.body) {
          throw new Error("SSE response has no body (streaming not supported).");
        }

        const reader = resp.body.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by a blank line.
          // Support both \n\n and \r\n\r\n.
          let splitIdx: number;
          while ((splitIdx = buffer.search(/\r?\n\r?\n/)) !== -1) {
            const rawEvent = buffer.slice(0, splitIdx);
            buffer = buffer.slice(splitIdx).replace(/^\r?\n\r?\n/, "");
            if (rawEvent.trim().length > 0) parseAndDispatch(rawEvent);
          }
        }

        setState((prev) => ({
          ...prev,
          status: controller.signal.aborted ? "closed" : "closed",
        }));
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          status: "error",
          error: e?.message || "SSE connection error.",
        }));
      }
    })();

    return () => {
      controller.abort();
      abortRef.current = null;
    };
  }, [quizId, resolvedBaseUrl, maxEvents]);

  return state;
}

