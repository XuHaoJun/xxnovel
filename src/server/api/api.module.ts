import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

import { BookModule } from "./book/book.module";
import { CommentModule } from "./comment/comment.module";

@Module({
  imports: [
    BookModule,
    RouterModule.register([
      {
        path: "api",
        children: [
          {
            path: "books",
            module: BookModule,
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
