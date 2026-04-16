export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  timeoutMs?: number;
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type ApiJsonOptions = Omit<ApiFetchOptions, "body"> & {
  body?: JsonValue;
};
