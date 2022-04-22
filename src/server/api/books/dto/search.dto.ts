import { Transform } from "class-transformer";
import { IsPositive, IsNotEmpty, IsOptional } from "class-validator";

export class PaginationRange {
  @IsOptional()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  offset?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  limit?: number;
}
