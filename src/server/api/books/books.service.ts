import _ from "lodash";
import { Injectable, NotFoundException } from "@nestjs/common";

import { CrawlerService } from "../../lib/crawler/nest/crawler.service";

import PtwxzCrawler from "../../lib/crawler/PtwxzCrawler";
import { ElasticsearchUsecase } from "../../db/elasticsearch/usecase/elasticsearch.usecase";
import axios from "axios";
import { Stream } from "stream";
import { Paths } from "src/server/lib/pathsType";
import {
  BookForClient,
  BookModel,
  BookSource,
} from "src/server/db/elasticsearch/models/book.model";
import { SearchTotalHits } from "@elastic/elasticsearch/api/types";
import {
  BookChunkForClient,
  BookChunkModel,
  BookChunkSource,
} from "src/server/db/elasticsearch/models/bookChunk.model";
import moment from "moment";

@Injectable()
export class BooksService {
  constructor(
    private readonly esuc: ElasticsearchUsecase,
    private readonly crawlerService: CrawlerService
  ) {}

  public async crawleOneRandom() {
    const url = PtwxzCrawler.randomBookInfoUrl();
    return this.crawleOne(url);
  }

  public async getThumbStream(params: { index: string; id: string }) {
    const bookRes = await this.esuc.book.get({
      ...params,
      _source: ["thumbnailUrl"],
    });
    if (bookRes.body._source?.thumbnailUrl) {
      const res = await axios.get<Stream>(bookRes.body._source?.thumbnailUrl, {
        responseType: "stream",
      });
      return res.data;
    } else {
      return null;
    }
  }

  public async findOne(params: {
    index: string;
    id: string;
  }): Promise<BookForClient> {
    const bookRes = await this.esuc.book.get({
      ...params,
      _source: BooksService.getDetailFields(),
    });
    return BookModel.toClient(
      bookRes.body._index,
      bookRes.body._id,
      bookRes.body._source
    );
  }

  public async crawleOne(url: string) {
    const cbook = await this.crawlerService.ptwxzCrawler.getBook(url);
    const upsertBookRes = await this.esuc.book.upsertByCrawleBook(cbook);
    interface Body {
      _id: string;
      _index: string;
    }
    const bookUpsertBody = (upsertBookRes.create || upsertBookRes.update)
      ?.body as Body;

    const bookId = bookUpsertBody._id;
    const _source: Array<Paths<BookChunkSource>> = ["idxByCreatedAtAsc"];
    const searchRes = await this.esuc.bookChunk.searchByBookIdAndIdx(
      bookId,
      Array.from(Array(cbook.chunks?.length || 0).keys()),
      { _source }
    );
    const allIdxs = Array.from(Array(cbook.chunks?.length || 0).keys());
    const importedIdxs =
      searchRes.body?.hits?.hits?.map((x) => x._source?.idxByCreatedAtAsc) ||
      [];
    const needIdxs = allIdxs.filter((x) => !importedIdxs.includes(x));

    for (const idx of needIdxs) {
      const chunk = cbook.chunks?.[idx];
      const idxByCreatedAtAsc = idx;
      if (chunk) {
        const { url } = chunk;
        if (url) {
          const bookChunk = await this.crawlerService.ptwxzCrawler.getBookChunk(
            url
          );
          const upsertChunkRes =
            await this.esuc.bookChunk.upsertByCrawleBookChunk({
              bookIndex: bookUpsertBody._index,
              bookId: bookUpsertBody._id,
              bookInfo: {
                authorName: upsertBookRes._source.authorName,
                title: upsertBookRes._source.title,
                description: upsertBookRes._source.description,
              },
              idxByCreatedAtAsc,
              cbookChunk: bookChunk,
            });
          // const chunkUpsertBody = (
          //   upsertChunkRes.create || upsertChunkRes.update
          // )?.body as Body;
        }
      }
    }

    for (const [idxByCreatedAtAsc, chunk] of Array.from(
      (cbook.chunks || []).entries()
    )) {
      // if (idxByCreatedAtAsc == 2) {
      //   break;
      // }
    }

    return cbook;
  }

  public async crawleSaveOneRandom() {
    const url = PtwxzCrawler.randomBookInfoUrl();
    const cbook = await this.crawleOne(url);
    return this.esuc.book.upsertByCrawleBook(cbook);
  }

  public static getSimpleFields(): Array<string> {
    const fields: Array<Paths<BookSource>> = [
      "raw",
      "numChar",
      "numBookChunks",
      "createdAt",
      "updatedAt",
      "status",
      "category",
      "importedAt",
    ];
    return fields;
  }

  public static getDetailFields(): Array<string> {
    const simples = BooksService.getSimpleFields() as Array<Paths<BookSource>>;
    const fields: Array<Paths<BookSource>> = [...simples, "chunks"];
    return fields;
  }

  public async getLatestBooks({ size, from }: { size: number; from: number }) {
    const searchRes = await this.esuc.book.search({
      size,
      from,
      _source: BooksService.getSimpleFields(),
      sort: ["updatedAt:desc"],
    });
    const total = (searchRes.body.hits.total as SearchTotalHits).value;
    return {
      total,
      items: BookModel.hitsToClient(searchRes.body.hits.hits),
    };
  }

  public async getBookChunkByBookIdAndIdx(
    bookId: string,
    idxByCreatedAtAsc: number
  ): Promise<BookChunkForClient> {
    const searchRes = await this.esuc.bookChunk.searchByBookIdAndIdx(bookId, [
      idxByCreatedAtAsc,
    ]);
    if ((searchRes.body.hits.total as SearchTotalHits).value > 0) {
      return BookChunkModel.hitsToClient(searchRes.body.hits.hits)[0];
    } else {
      throw new NotFoundException();
    }
  }
}
