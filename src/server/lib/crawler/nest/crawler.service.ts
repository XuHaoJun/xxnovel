import { Injectable } from "@nestjs/common";
import PtwxzCrawler from "../PtwxzCrawler";

@Injectable()
export class CrawlerService {
  public ptwxzCrawler: PtwxzCrawler;

  constructor() {
    this.ptwxzCrawler = new PtwxzCrawler();
  }
}
