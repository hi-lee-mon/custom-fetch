export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export type BeforeRequestHook = (request: Request) => Request | void | Promise<Request | void>;
export type AfterResponseHook = (
  request: Request,
  response: Response,
) => Response | void | Promise<Response | void>;
export type BeforeErrorHook = (error: Error) => Error | void | Promise<Error | void>;

export type Hooks = {
  beforeRequest?: BeforeRequestHook[];
  afterResponse?: AfterResponseHook[];
  beforeError?: BeforeErrorHook[];
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type ApiJsonOptions = Omit<ApiFetchOptions, "body"> & {
  body?: JsonValue;
};
