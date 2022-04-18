import _ from "lodash";
import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

import {
  BookChunk,
  fetchBookChunkInfos,
  fetchBookInfo,
} from "../../../server/utils/fetchBookHelper";

@Injectable()
export class BooksService {
  constructor(private readonly esClient: ElasticsearchService) {}

  public async crawleOneRandom() {
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

    const url = `https://www.ptwxz.com/bookinfo/${cn}/${cn}${bnStr}.html`;
    const bookInfo = await fetchBookInfo(url);

    let bookChunkInfos: Array<BookChunk> | null;
    if (bookInfo?.bookChunkInfosUrl) {
      bookChunkInfos = await fetchBookChunkInfos(bookInfo.bookChunkInfosUrl);
    } else {
      bookChunkInfos = null;
    }
    if (bookInfo) {
      bookInfo.chunks = bookChunkInfos;
    }

    return bookInfo;
  }
}
