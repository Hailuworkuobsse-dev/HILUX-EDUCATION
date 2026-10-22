/** Shared primitives used across every domain type. */

export type ID = string;

/** ISO-8601 timestamp as serialised by the API. */
export type ISODate = string;

/** Standard paginated envelope returned by every list endpoint. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
