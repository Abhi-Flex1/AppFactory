import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal data hook: fetch once, keep the last good value, never set state after
 * unmount. Deliberately not a caching library — each page needs one call.
 */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current({ signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState((s) => ({ ...s, loading: false, error }));
      });
    return () => controller.abort();
  }, []);

  useEffect(reload, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, reload };
}

/** Light/dark/system, resolved before first paint by an inline script in index.html. */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("af-theme") || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const update = useCallback((next) => {
    setTheme(next);
    try {
      localStorage.setItem("af-theme", next);
    } catch {
      /* private mode */
    }
  }, []);

  return [theme, update];
}

/** Media query as state. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof matchMedia === "function" ? matchMedia(query).matches : false
  );
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** setTimeout as state, for transient UI like copy confirmation. */
export function useFlash(ms = 1800) {
  const [on, setOn] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [on, useCallback(() => {
    clearTimeout(timer.current);
    setOn(true);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms])];
}