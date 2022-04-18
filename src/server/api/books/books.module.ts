import { Module } from "@nestjs/common";

import { ElasticsearchModule } from "../../db/elasticsearch/elasticsearch.module";
import { BooksControllerV1 } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
  imports: [ElasticsearchModule],
  providers: [BooksService],
  exports: [],
  controllers: [BooksControllerV1],
})
export class BooksModule {}
