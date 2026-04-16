import { apiJson } from "./api-json";
import { apiFetch } from "./interceptors-fetch";

import { ApiFetchOptions, ApiJsonOptions } from "./type";

type BaseClientConfig = {
  baseURL: string;
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
    fetch(path: string, options: ApiFetchOptions = {}) {
      return apiFetch(`${config.baseURL}${path}`, {
        ...config.fetchDefaultOptions,
        ...options,
        headers: {
          ...(config.fetchDefaultOptions?.headers ?? {}),
          ...(options.headers ?? {}),
        },
      });
    },
  };
}

export function createJsonClient(config: JsonClientConfig) {
  return {
    json<T>(path: string, options: ApiJsonOptions = {}) {
      return apiJson<T>(`${config.baseURL}${path}`, {
        ...config.jsonDefaultOptions,
        ...options,
        headers: {
          ...(config.jsonDefaultOptions?.headers ?? {}),
          ...(options.headers ?? {}),
        },
      });
    },
  };
}

export function createApiClient(config: ApiClientConfig) {
  return {
    ...createFetchClient(config),
    ...createJsonClient(config),
  };
}
