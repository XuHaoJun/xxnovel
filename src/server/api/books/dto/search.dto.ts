import { Transform } from "class-transformer";
import {
  IsPositive,
  IsNotEmpty,
  IsOptional,
  Min,
  IsDefined,
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from "class-validator";

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

export class SearchBookReqDto extends QueryPaginationRange {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsDefined()
  text!: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsArray()
  @IsOptional()
  categories?: Array<string>;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status?: string;
}
