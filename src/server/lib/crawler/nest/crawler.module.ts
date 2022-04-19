import { Module } from "@nestjs/common";
import { CrawlerService } from "./crawler.service";

@Module({
  imports: [],
  providers: [CrawlerService],
  exports: [CrawlerService],
  controllers: [],
})
export class CrawlerModule {}
