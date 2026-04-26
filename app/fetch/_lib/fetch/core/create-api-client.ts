import { apiJson } from "./custom-fetch-json";
import { apiFetch } from "./custom-fetch";
import { ApiFetchOptions, ApiJsonOptions, Hooks } from "../type";

type BaseClientConfig = {
  baseURL: string;
  hooks?: Hooks;
};

type FetchClientConfig = BaseClientConfig & {
  fetchDefaultOptions?: ApiFetchOptions;
};

type JsonClientConfig = BaseClientConfig & {
  jsonDefaultOptions?: ApiJsonOptions;
};

type ApiClientConfig = FetchClientConfig & JsonClientConfig;

export function createFetchClient(config: FetchClientConfig) {
  return {
    fetch(path: string, options: ApiFetchOptions = {}, hooks: Hooks = {}) {
      return apiFetch(
        `${config.baseURL}${path}`,
        {
          ...config.fetchDefaultOptions,
          ...options,
          headers: {
            ...(config.fetchDefaultOptions?.headers ?? {}),
            ...(options.headers ?? {}),
          },
        },
        { ...config.hooks, ...hooks },
      );
    },
  };
}

export function createJsonClient(config: JsonClientConfig) {
  return {
    json<T>(path: string, options: ApiJsonOptions = {}, hooks: Hooks = {}) {
      return apiJson<T>(
        `${config.baseURL}${path}`,
        {
          ...config.jsonDefaultOptions,
          ...options,
          headers: {
            ...(config.jsonDefaultOptions?.headers ?? {}),
            ...(options.headers ?? {}),
          },
        },
        { ...config.hooks, ...hooks },
      );
    },
  };
}

export function createApiClient(config: ApiClientConfig) {
  return {
    ...createFetchClient(config),
    ...createJsonClient(config),
  };
}
