import { Module } from "@nestjs/common";

import { CommentController } from "./comment.controller";

@Module({
  imports: [],
  providers: [],
  exports: [],
  controllers: [CommentController],
})
export class CommentModule {}
