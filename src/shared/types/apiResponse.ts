export interface IQueryPaginationRange {
  offset?: number;
  limit?: number;
}

export interface IPaginationResponse<T> {
  total: number;
  items: Array<T>;
}
