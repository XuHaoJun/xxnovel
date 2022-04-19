import _ from "lodash";
import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

import { CrawlerService } from "../../lib/crawler/nest/crawler.service";

import {
  BookChunk,
  fetchBookChunkInfos,
  fetchBookInfo,
} from "../../utils/fetchBookHelper";
import PtwxzCrawler from "../../lib/crawler/PtwxzCrawler";

@Injectable()
export class BooksService {
  constructor(
    private readonly esClient: ElasticsearchService,
    private readonly crawlerService: CrawlerService
  ) {}

  public async crawleOneRandom() {
    const url = PtwxzCrawler.randomBookInfoUrl();
    return this.crawleOne(url);
  }

  public async crawleOne(url: string) {
    return this.crawlerService.ptwxzCrawler.getBook(url);
  }
}
