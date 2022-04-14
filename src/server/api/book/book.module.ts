import { Module } from "@nestjs/common";

import { BookControllerV1 } from "./book.controller";

@Module({
  imports: [],
  providers: [],
  exports: [],
  controllers: [BookControllerV1],
})
export class BookModule {}
