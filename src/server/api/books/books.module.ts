import { Module } from "@nestjs/common";
import { MyElasticsearchModule } from "src/server/db/elasticsearch/myElasticsearch.module";
import { XxHanlpModule } from "src/server/lib/xxhanlp/nest/xxhanlp.module";

import { ElasticsearchModule } from "../../db/elasticsearch/elasticsearch.module";

import { CrawlerModule } from "../../lib/crawler/nest/crawler.module";

import { BooksControllerV1 } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
  imports: [CrawlerModule, MyElasticsearchModule, XxHanlpModule],
  providers: [BooksService],
  exports: [BooksService],
  controllers: [BooksControllerV1],
})
export class BooksModule {}
