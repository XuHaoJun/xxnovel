import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { BooksModule } from "./books/books.module";

@Module({
  imports: [
    BooksModule,
    RouterModule.register([
      {
        path: "api",
        children: [
          {
            path: "books",
            module: BooksModule,
          },
        ],
      },
    ]),
  ],
  providers: [],
  exports: [],
  controllers: [],
})
export class ApiModule {}
