import type { ApiResponse } from "@elastic/elasticsearch";
import type {
  IndexResponse,
  UpdateResponse,
} from "@elastic/elasticsearch/api/types";

export interface UpsertResult<T> {
  create?: ApiResponse<IndexResponse>;
  update?: ApiResponse<UpdateResponse<T>>;
  _source: T;
}
