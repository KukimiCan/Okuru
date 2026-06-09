export type ApiSuccess<T> = {
  data: T;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};
