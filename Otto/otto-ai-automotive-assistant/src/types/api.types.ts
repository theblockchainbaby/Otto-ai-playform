export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type Pagination<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};