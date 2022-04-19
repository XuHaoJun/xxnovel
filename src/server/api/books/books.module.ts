import { Module } from "@nestjs/common";

import { ElasticsearchModule } from "../../db/elasticsearch/elasticsearch.module";

import { CrawlerModule } from "../../lib/crawler/nest/crawler.module";

import { BooksControllerV1 } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
  imports: [ElasticsearchModule, CrawlerModule],
  providers: [BooksService],
  exports: [BooksService],
  controllers: [BooksControllerV1],
})
export class BooksModule {}
