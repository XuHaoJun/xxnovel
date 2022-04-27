import { Transform } from "class-transformer";
import { IsPositive, IsNotEmpty, IsOptional, Min } from "class-validator";

import type { IQueryPaginationRange } from "src/shared/types/apiResponse";

export class QueryPaginationRange implements IQueryPaginationRange {
  @IsOptional()
  @Min(0)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset?: number;

  @IsOptional()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit?: number;
}

export class SearchBookDto extends QueryPaginationRange {}
