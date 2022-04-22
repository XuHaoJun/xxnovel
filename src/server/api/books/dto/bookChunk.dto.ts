import { Transform } from "class-transformer";
import { IsDefined, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

export class GetBookChunkByBookIdAndIdxParams {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  bookId!: string;

  @Min(0)
  @IsDefined()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  idxByCreatedAtAsc!: number;
}
