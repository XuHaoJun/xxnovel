import { ElasticsearchService as NestElasticsearchService } from "@nestjs/elasticsearch";
import _ from "lodash";
import { Paths } from "src/server/lib/pathsType";
import { xxhanlpClient } from "src/server/lib/xxhanlp/XxHanlpClient";

import * as Crawler from "../../../lib/crawler/interfaces/Book";
import {
  SEARCH_INDICES_NAMES,
  SPLITTER_TOKEN,
  WRITE_INDICES_NAMES,
} from "../constant";
import type { BookSource } from "./book.model";
import * as TokenizeHelper from "../utils/tokenizeHelper";
import {
  IndexResponse,
  SearchHit,
  SearchResponse,
  SearchTotalHits,
  UpdateResponse,
} from "@elastic/elasticsearch/api/types";
import { UpsertResult } from "../interfaces/UpsertResult";
import { ApiResponse, RequestParams } from "@elastic/elasticsearch";
import moment from "moment";

interface PersonCount {
  tok: string;
  count: number;
}

export interface BookChunkSource extends Crawler.IBookChunk {
  bookIndex?: string;
  bookId?: string;
  bookInfo?: Pick<BookSource, "authorName" | "title" | "description">;
  idxByCreatedAtAsc?: number;
  content?: string;
  personNames?: Array<string>;
  personCounts?: Array<PersonCount>;
  raw?: {
    chapterName?: string;
    sectionName?: string;
    contentLines?: Array<string>;
  };
}

export interface BookChunkForClient
  extends Omit<BookChunkSource, "raw" | "bookInfo" | "content"> {
  id: string;
  _index: string;
  contentLines?: Array<string>;
}

export class BookChunkModel {
  constructor(private readonly esClient: NestElasticsearchService) {}

  public static toClient(
    _index: string,
    id: string,
    source?: BookChunkSource
  ): BookChunkForClient {
    const omitFields: Array<Paths<BookChunkSource>> = [
      "raw",
      "content",
      "bookInfo",
    ];
    const forClient: BookChunkForClient = {
      _index,
      id,
      ..._.omit(source || {}, omitFields),
    };
    if (source?.raw) {
      forClient.chapterName = source.raw.chapterName;
      forClient.sectionName = source.raw.sectionName;
      forClient.contentLines = source.raw.contentLines;
    }
    return forClient;
  }

  public static hitsToClient(
    hits: SearchHit<BookChunkSource>[]
  ): BookChunkForClient[] {
    return hits.map((x) =>
      BookChunkModel.toClient(
        x._index,
        x._id as string,
        x._source as BookChunkSource
      )
    );
  }

  public async upsertByCrawleBookChunk({
    bookIndex,
    bookId,
    bookInfo,
    idxByCreatedAtAsc,
    cbookChunk,
  }: {
    bookId: string;
    bookIndex: string;
    bookInfo: Pick<BookSource, "authorName" | "title" | "description">;
    idxByCreatedAtAsc: number;
    cbookChunk: Crawler.IBookChunk;
  }): Promise<UpsertResult<BookChunkSource>> {
    const { esClient } = this;
    const searchRes = await this.searchByBookIdAndIdx(bookId, [
      idxByCreatedAtAsc,
    ]);
    const bookChunkSource = await BookChunkModel.crawleToSource({
      bookIndex,
      bookId,
      bookInfo,
      idxByCreatedAtAsc,
      cbookChunk,
    });
    if ((searchRes.body.hits.total as SearchTotalHits).value > 0) {
      const hit = searchRes.body.hits.hits[0];
      return {
        update: await esClient.update<UpdateResponse<BookChunkSource>>({
          index: WRITE_INDICES_NAMES.BookChunk,
          id: `${hit._id}`,
          body: { doc: bookChunkSource },
        }),
        _source: bookChunkSource,
      };
    } else {
      return {
        create: await esClient.index<IndexResponse>({
          index: WRITE_INDICES_NAMES.BookChunk,
          body: bookChunkSource,
          refresh: true,
        }),
        _source: bookChunkSource,
      };
    }
  }

  public async searchByBookIdAndIdx(
    bookId: string,
    idxByCreatedAtAscs: Array<number>,
    searchParams?: RequestParams.Search<Record<string, any>>
  ): Promise<ApiResponse<SearchResponse<BookChunkSource>>> {
    return this.esClient.search<SearchResponse<BookChunkSource>>({
      index: SEARCH_INDICES_NAMES.BookChunk,
      size: 1,
      body: {
        query: {
          bool: {
            must: [
              {
                terms: {
                  idxByCreatedAtAsc: idxByCreatedAtAscs,
                },
              },
              {
                term: {
                  bookId: bookId,
                },
              },
            ],
          },
        },
        version: true,
      },
      ...searchParams,
    });
  }

  public static async crawleToSource({
    bookIndex,
    bookId,
    bookInfo,
    idxByCreatedAtAsc,
    cbookChunk,
  }: {
    bookId: string;
    bookIndex: string;
    bookInfo: Pick<BookSource, "authorName" | "title" | "description">;
    idxByCreatedAtAsc: number;
    cbookChunk: Crawler.IBookChunk;
  }): Promise<BookChunkSource> {
    let content: string;
    const personNames: Set<string> = new Set();
    const personCounts: Array<PersonCount> = [];
    if (cbookChunk.contentLines) {
      const { tok_fine, ner_msra } = await xxhanlpClient.analysis(
        cbookChunk.contentLines
      );
      for (const sentence of ner_msra) {
        for (const ner of sentence) {
          if (ner.ner === "PERSON") {
            const pc = personCounts.find((x) => x.tok === ner.tok);
            if (pc) {
              pc.count += 1;
            } else {
              personCounts.push({ tok: ner.tok, count: 1 });
            }
            personNames.add(ner.tok);
          }
        }
      }
      content = tok_fine.reduce(
        (total: string, toks: Array<string>, i: number) => {
          const str = toks.join(SPLITTER_TOKEN);
          const final = `${total} ${str} \n`;
          if (i === tok_fine.length - 1) {
            return final;
          } else {
            return `${final}${SPLITTER_TOKEN}`;
          }
        },
        ""
      );
    } else {
      content = "";
    }

    const untokPaths: Array<Paths<Crawler.IBookChunk>> = [
      "chapterName",
      "sectionName",
    ];

    let overide: BookChunkSource = {};
    for (const propName of untokPaths) {
      const x = _.get(cbookChunk, propName);
      if (x) {
        const tx = await TokenizeHelper.toTokenrizedStr(x);
        overide = _.set(overide, propName, tx);
      }
    }

    const omits: Array<Paths<Crawler.IBookChunk>> = ["contentLines"];
    const tidy = _.omit(cbookChunk, omits);
    return {
      ...tidy,
      ...overide,
      //
      bookId,
      bookIndex,
      bookInfo,
      idxByCreatedAtAsc,
      //
      importedAt: cbookChunk.importedAt || new Date(),
      //
      content,
      personNames: _.sortBy(Array.from(personNames), (x) => x.length),
      personCounts: _.sortBy(personCounts, (x) => -x.count),
      raw: {
        chapterName: cbookChunk.chapterName,
        sectionName: cbookChunk.sectionName,
        contentLines: cbookChunk.contentLines,
      },
    };
  }
}
