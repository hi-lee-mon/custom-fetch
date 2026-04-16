export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  timeoutMs?: number;
};
