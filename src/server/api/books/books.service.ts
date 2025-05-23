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
import {
  SearchCompletionSuggestOption,
  SearchHighlighterType,
  SearchSuggest,
  SearchTotalHits,
} from "@elastic/elasticsearch/api/types";
import {
  BookChunkForClient,
  BookChunkModel,
  BookChunkSource,
} from "src/server/db/elasticsearch/models/bookChunk.model";
import type { IPaginationResponse } from "src/shared/types/apiResponse";
import produce from "immer";
import { QueryPaginationRange, SearchBookReqDto } from "./dto/search.dto";
import { XxHanlpService } from "src/server/lib/xxhanlp/nest/xxhanlp.service";
import { NerMsraTag } from "src/server/lib/xxhanlp/XxHanlpClient";
import { IBookChunk } from "src/server/lib/crawler/interfaces/Book";

@Injectable()
export class BooksService {
  constructor(
    private readonly esuc: ElasticsearchUsecase,
    private readonly crawlerService: CrawlerService,
    private readonly xxHanlpService: XxHanlpService
  ) {}

  public async getThumbStream(params: { index: string; id: string }) {
    const bookRes = await this.esuc.book.get({
      ...params,
      _source: ["thumbnailUrl"],
    });
    if (bookRes.body._source?.thumbnailUrl) {
      const thumb = bookRes.body._source.thumbnailUrl;
      const res = await axios.get<Stream>(thumb, {
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
      bookRes.body._id as string,
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
    const searchImporteds = await this.esuc.bookChunk.searchByBookIdAndIdx(
      bookId,
      Array.from(Array(cbook.chunks?.length || 0).keys()),
      { _source }
    );
    const allIdxs = Array.from(Array(cbook.chunks?.length || 0).keys());
    const importedIdxs =
      searchImporteds.body?.hits?.hits?.map(
        (x) => x._source?.idxByCreatedAtAsc
      ) || [];
    const _needIdxs = allIdxs.filter((x) => !importedIdxs.includes(x));
    const needIdxs = _needIdxs.slice(0, 5).concat(_needIdxs.slice(-5));

    for (const idx of needIdxs) {
      const chunk = cbook.chunks?.[idx];
      const idxByCreatedAtAsc = idx;
      if (chunk) {
        const { url } = chunk;
        if (url) {
          let bookChunk = await this.crawlerService.ptwxzCrawler.getBookChunk(
            url
          );
          bookChunk = produce(bookChunk, (draft: IBookChunk) => {
            draft.chapterName = chunk.chapterName;
            draft.sectionName = chunk.sectionName;
          });
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
        }
      }
    }

    return cbook;
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
      "latestChunk",
      "importedAt",
    ];
    return fields;
  }

  public static getDetailFields(): Array<string> {
    const simples = BooksService.getSimpleFields() as Array<Paths<BookSource>>;
    const fields: Array<Paths<BookSource>> = [...simples, "chunks"];
    return fields;
  }

  public async getLatestBooks(
    q: QueryPaginationRange
  ): Promise<IPaginationResponse<BookForClient>> {
    const size = q.limit;
    const from = q.offset;
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

  public async search(
    body: SearchBookReqDto
  ): Promise<IPaginationResponse<BookForClient>> {
    const size = body.limit;
    const from = body.offset;
    const text = body.text;
    const anaResult = await this.xxHanlpService.analysis(text);
    const ners = _.flatten(anaResult.ner_msra);
    const personNames: Array<string> = [];
    for (const ner of ners) {
      if (ner.ner === NerMsraTag.Person) {
        personNames.push(ner.tok);
      }
    }
    const terms = _.flatten(anaResult.tok_fine);
    const otherMust = [];
    if (body.categories) {
      otherMust.push({
        terms: {
          category: body.categories,
        },
      });
    }
    if (body.status) {
      otherMust.push({
        term: {
          status: body.status,
        },
      });
    }
    const query = {
      bool: {
        must: [
          ...otherMust,
          {
            bool: {
              should: [
                {
                  fuzzy: {
                    title: { value: text },
                  },
                },
                {
                  terms: {
                    title: terms,
                    boost: 3.5,
                  },
                },
                {
                  terms: {
                    personNames: terms,
                    boost: 2.0,
                  },
                },
                {
                  terms: {
                    authorName: terms,
                    boost: 2.0,
                  },
                },
                {
                  terms: {
                    description: terms,
                  },
                },
              ],
            },
          },
        ],
      },
    };
    // const highlight = {
    //   fields: {
    //     description: {
    //       number_of_fragments: 3,
    //       fragment_size: 50,
    //     },
    //     title: {
    //       number_of_fragments: 1,
    //       fragment_size: 50,
    //     },
    //     authorName: {
    //       number_of_fragments: 1,
    //       fragment_size: 50,
    //     },
    //   },
    // };

    const searchRes = await this.esuc.book.search({
      size,
      from,
      _source: BooksService.getSimpleFields(),
      body: {
        query,
      },
    });

    const total = (searchRes.body.hits.total as SearchTotalHits).value;
    return {
      total,
      items: BookModel.hitsToClient(searchRes.body.hits.hits),
    };
  }

  public async searchChunks() {}

  public async getTitleSuggests(prefix: string) {
    const sn = "titleSuggests";
    const searchResp = await this.esuc.book.search({
      _source: ["raw.authorName", "raw.title"],
      body: {
        sort: [{ updatedAt: "desc" }],
        suggest: {
          [sn]: {
            prefix,
            completion: {
              field: "titleSuggest",
              skip_duplicates: true,
              size: 4,
              fuzzy: {
                fuzziness: "auto",
                min_length: 1,
                prefix_length: 1,
                transpositions: true,
                unicode_aware: true,
              },
            },
          },
        },
      },
    });

    const copts = _.flatten(
      _.flatten(searchResp.body.suggest?.[sn] || []).map((x) => x.options)
    ) as SearchCompletionSuggestOption<BookSource>[];
    return BookModel.complectionSuggestOptionsToClient(copts);
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
