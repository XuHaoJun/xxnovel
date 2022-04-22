import { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import produce from "immer";
import _ from "lodash";

import CrawlerBase, { CrawlerConfig } from "./CrawlerBase";
import { IBook, IBookChunk } from "./interfaces/book";
import { PtwxzCheerioParser } from "./parsers/PtwxzHtmlParser";
import * as ObjS2T from "./utils/objS2t";

export default class PtwxzCrawler extends CrawlerBase {
  constructor(_opts?: CrawlerConfig) {
    super({ ..._opts, enableS2t: false });
  }

  public async getBook(url: string): Promise<IBook> {
    let bookInfo = await ObjS2T.bookInfo(await this.getPartialBook0(url));
    let chunks: Array<IBookChunk>;
    if (bookInfo.bookChunkInfosUrl) {
      const chunksOri = await this.getPartialBookChunks(
        bookInfo.bookChunkInfosUrl
      );
      chunks = await Promise.all(chunksOri.map(ObjS2T.bookChunk));
    } else {
      // change to null for crawle failed?
      chunks = [];
    }
    bookInfo = produce(bookInfo, (draft: IBook) => {
      draft.chunks = chunks;
    });

    return bookInfo;
  }

  public async getPartialBook0(url: string): Promise<IBook> {
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    return PtwxzCheerioParser.bookInfo(parsedUrl, cheerio.load(html));
  }

  public async getPartialBookChunks(url: string): Promise<Array<IBookChunk>> {
    console.debug(url);
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    return PtwxzCheerioParser.bookChunkInfos(parsedUrl, cheerio.load(html));
  }

  public async getBookChunk(url: string): Promise<IBookChunk> {
    const parsedUrl = new URL(url);
    const { data: html } = await this.getHtml(url);
    const bookChunk = PtwxzCheerioParser.bookContent(
      parsedUrl,
      cheerio.load(html)
    );
    return ObjS2T.bookChunk(bookChunk);
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

  public get axiosInstance(): AxiosInstance {
    return this.axios;
  }
}
