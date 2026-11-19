// Session/visitor ids, UTMs, click ids and Facebook cookies. Pure over an
// injected environment so the persistence rules are unit-tested without a DOM.

export const STORAGE_KEYS = {
  visitorId: "_mega_vid",
  sessionId: "_mega_sid",
  attribution: "_mega_attr",
  landingParams: "landing_params",
} as const;

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
] as const;

/** Presence of any of these means the visit came from a tracked click. */
const ENTRY_PARAMS = ["utm_source", "gclid", "gbraid", "wbraid", "fbclid"] as const;

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface AttributionEnv {
  search: string;
  cookie: string;
  local: StorageLike;
  session: StorageLike;
  now: () => number;
  uuid: () => string;
}

export function emptyAttribution(): Attribution {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    fbclid: null,
    fbp: null,
    fbc: null,
  };
}

function readOrCreate(store: StorageLike, key: string, create: () => string): string {
  try {
    const existing = store.getItem(key);
    if (existing) return existing;
    const created = create();
    store.setItem(key, created);
    return created;
  } catch {
    // Blocked storage: an unpersisted id still lets this one submission through.
    return create();
  }
}

export function getVisitorId(env: AttributionEnv): string {
  return readOrCreate(env.local, STORAGE_KEYS.visitorId, () => `vis_${env.uuid()}`);
}

export function getSessionId(env: AttributionEnv): string {
  return readOrCreate(env.session, STORAGE_KEYS.sessionId, () => `sess_${env.uuid()}`);
}

export function getCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=") || null;
  }
  return null;
}

function hasEntryParam(params: URLSearchParams): boolean {
  return ENTRY_PARAMS.some((key) => params.has(key));
}

function safeGet(store: StorageLike, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: StorageLike, key: string, value: string): void {
  try {
    store.setItem(key, value);
  } catch {
    // Blocked storage only costs cross-page persistence.
  }
}

/** The live URL wins; otherwise the query string QueryParamPersistence kept for the session. */
function entryParams(env: AttributionEnv): URLSearchParams | null {
  const live = new URLSearchParams(env.search);
  if (hasEntryParam(live)) return live;
  const kept = new URLSearchParams(safeGet(env.session, STORAGE_KEYS.landingParams) ?? "");
  return hasEntryParam(kept) ? kept : null;
}

function fromParams(params: URLSearchParams, env: AttributionEnv): Attribution {
  const attribution = emptyAttribution();
  for (const key of TRACKING_PARAMS) attribution[key] = params.get(key) || null;
  attribution.fbp = getCookie(env.cookie, "_fbp");
  attribution.fbc = getCookie(env.cookie, "_fbc");
  if (attribution.fbclid && !attribution.fbc) attribution.fbc = `fb.1.${env.now()}.${attribution.fbclid}`;
  return attribution;
}

function parseStored(raw: string | null): Attribution | null {
  if (!raw) return null;
  try {
    return { ...emptyAttribution(), ...(JSON.parse(raw) as Partial<Attribution>) };
  } catch {
    return null;
  }
}

/** First touch of a tracked click is persisted; later pages without params reuse it. */
export function resolveAttribution(env: AttributionEnv): Attribution {
  const params = entryParams(env);
  if (params) {
    const captured = fromParams(params, env);
    safeSet(env.local, STORAGE_KEYS.attribution, JSON.stringify(captured));
    return captured;
  }
  const stored = parseStored(safeGet(env.local, STORAGE_KEYS.attribution));
  if (!stored) return fromParams(new URLSearchParams(), env);
  return { ...stored, fbp: getCookie(env.cookie, "_fbp") ?? stored.fbp };
}

/** Unpersisted stand-in; each call gets its own map, so local and session keys never collide. */
function memoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

/** Merely reading `window.localStorage` throws SecurityError when site data is blocked. */
function acquireStorage(read: () => StorageLike): StorageLike {
  try {
    return read();
  } catch {
    return memoryStorage();
  }
}

export function browserAttributionEnv(): AttributionEnv {
  return {
    search: window.location.search,
    cookie: document.cookie,
    local: acquireStorage(() => window.localStorage),
    session: acquireStorage(() => window.sessionStorage),
    now: () => Date.now(),
    uuid: () => crypto.randomUUID(),
  };
}
