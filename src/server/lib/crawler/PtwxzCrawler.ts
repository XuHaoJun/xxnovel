import * as cheerio from "cheerio";
import _ from "lodash";

import CrawlerBase from "./CrawlerBase";
import { IBook, IBookChunk } from "./interfaces/Book";
import { PtwxzCheerioParser } from "./parsers/PtwxzHtmlParser";

export default class PtwxzCrawler extends CrawlerBase {
  public async getBook(url: string): Promise<IBook> {
    const bookInfo = await this.getPartialBook0(url);
    let chunks: Array<IBookChunk>;
    if (bookInfo.bookChunkInfosUrl) {
      chunks = await this.getPartialBookChunks(bookInfo.bookChunkInfosUrl);
    } else {
      chunks = [];
    }
    bookInfo.chunks = chunks;

    return bookInfo;
  }

  public async getPartialBook0(url: string): Promise<IBook> {
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    return PtwxzCheerioParser.bookInfo(parsedUrl, cheerio.load(html));
  }

  public async getPartialBookChunks(url: string): Promise<Array<IBookChunk>> {
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    return PtwxzCheerioParser.bookChunkInfos(parsedUrl, cheerio.load(html));
  }

  public async getBookContent(url: string): Promise<IBookChunk> {
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    return PtwxzCheerioParser.bookContent(parsedUrl, cheerio.load(html));
  }

  public static randomBookInfoUrl() {
    const cn = _.random(0, 14);
    const bn = _.random(0, 999);
    let bnStr: string;
    if (bn === 0) {
      bnStr = "000";
    } else {
      const l10 = Math.trunc(Math.log10(bn));
      if (l10 < 3) {
        const numZero = 2 - l10;
        bnStr = "";
        for (let i = 0; i < numZero; i++) {
          bnStr = `0${bnStr}`;
        }
        bnStr = `${bnStr}${bn}`;
      } else {
        bnStr = `${bn}`;
      }
    }

    return `https://www.ptwxz.com/bookinfo/${cn}/${cn}${bnStr}.html`;
  }
}
