import { ElasticsearchService as NestElasticsearchService } from "@nestjs/elasticsearch";
import {
  GetResponse,
  IndexResponse,
  SearchCompletionSuggestOption,
  SearchHit,
  SearchRequest,
  SearchResponse,
  SearchSuggest,
  SearchSuggestOption,
  SearchTotalHits,
  UpdateResponse,
} from "@elastic/elasticsearch/api/types";
import {
  ApiResponse,
  TransportRequestOptions,
} from "@elastic/elasticsearch/lib/Transport";
import _ from "lodash";

import * as Crawler from "../../../lib/crawler/interfaces/book";
import { xxhanlpClient } from "../../../lib/xxhanlp/XxHanlpClient";

import {
  SEARCH_INDICES_NAMES,
  SPLITTER_TOKEN,
  WRITE_INDICES_NAMES,
} from "../constant";
import { RequestParams } from "@elastic/elasticsearch";
import { Paths } from "../../../lib/pathsType";
import * as TokenizeHelper from "../utils/tokenizeHelper";
import { UpsertResult } from "../interfaces/UpsertResult";
import moment from "moment";
import { $PropertyType } from "utility-types";

export interface ISimpleBookChunk extends Crawler.IBookChunk {
  _index?: string;
  idxByCreatedAtAsc?: number;
  id?: string;
}

interface EsSuggest {
  input: Array<string>;
  weight?: number;
}

export interface BookSource
  extends Omit<Crawler.IBook, "descriptionLines" | "chunks"> {
  description?: string;
  chunks?: Array<ISimpleBookChunk>;
  latestChunk?: ISimpleBookChunk;
  titleSuggest?: Array<EsSuggest>;
  raw?: {
    descriptionLines?: Array<string>;
    title?: string;
    authorName?: string;
  };
}

export interface BookForClient extends Omit<BookSource, "raw" | "description"> {
  _index: string;
  id: string;
  descriptionLines?: Array<string>;
}

export class BookModel {
  constructor(private readonly esClient: NestElasticsearchService) {}

  public async get(
    params?: RequestParams.Get,
    options?: TransportRequestOptions
  ): Promise<ApiResponse<GetResponse<BookSource>>> {
    const { esClient } = this;
    return esClient.get<GetResponse<BookSource>>(params, options);
  }

  public static toClient(
    _index: string,
    id: string,
    bookSource?: BookSource
  ): BookForClient {
    const bookDoc: BookForClient = {
      _index,
      id,
      ..._.omit(bookSource || {}, "raw"),
    };
    if (bookSource?.raw) {
      bookDoc.authorName = bookSource.raw.authorName;
      bookDoc.title = bookSource.raw.title;
      bookDoc.descriptionLines = bookSource.raw.descriptionLines;
    }
    // compablity old version
    if (!_.isNumber(bookDoc.chunks?.[0]?.idxByCreatedAtAsc)) {
      bookDoc.chunks = bookDoc.chunks?.map((x, i) => {
        return { ...x, idxByCreatedAtAsc: i };
      });
    }
    return bookDoc;
  }

  public static hitsToClient(hits: SearchHit<BookSource>[]): BookForClient[] {
    return hits.map((x) =>
      BookModel.toClient(x._index, x._id as string, x._source as BookSource)
    );
  }

  public static complectionSuggestOptionsToClient(
    xs: SearchCompletionSuggestOption<BookSource>[]
  ): BookForClient[] {
    return xs.map((x) =>
      BookModel.toClient(x._index, x._id as string, x._source as BookSource)
    );
  }

  public async search(
    params?: RequestParams.Search<$PropertyType<SearchRequest, "body">>,
    options?: TransportRequestOptions
  ) {
    return this.esClient.search<SearchResponse<BookSource>>(
      {
        index: SEARCH_INDICES_NAMES.BookInfo,
        ...params,
      },
      options
    );
  }

  public async upsertByCrawleBook(
    cbook: Crawler.IBook
  ): Promise<UpsertResult<BookSource>> {
    const { esClient } = this;

    const searchRes = await esClient.search<SearchResponse<BookSource>>({
      index: SEARCH_INDICES_NAMES.BookInfo,
      size: 1,
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  "raw.authorName": cbook.authorName,
                },
              },
              {
                term: {
                  "raw.title": cbook.title,
                },
              },
            ],
          },
        },
        version: true,
      },
    });

    const newBook = await BookModel.crawleToSource(cbook);
    if ((searchRes.body.hits.total as SearchTotalHits).value > 0) {
      const hit = searchRes.body.hits.hits[0];
      return {
        update: await esClient.update<UpdateResponse<BookSource>>({
          index: WRITE_INDICES_NAMES.BookInfo,
          id: `${hit._id}`,
          body: { doc: newBook },
        }),
        _source: newBook,
      };
    } else {
      return {
        create: await esClient.index<IndexResponse>({
          index: WRITE_INDICES_NAMES.BookInfo,
          body: newBook,
          refresh: true,
        }),
        _source: newBook,
      };
    }
  }

  public static async crawleToSource(
    cbook: Crawler.IBook
  ): Promise<BookSource> {
    let title: string;
    let titleSuggest: Array<EsSuggest>;
    if (cbook.title) {
      title = await TokenizeHelper.toTokenrizedStr(_.castArray(cbook.title));
      titleSuggest = [{ input: [cbook.title] }];
    } else {
      // throw error ?
      title = "";
      titleSuggest = [];
    }

    let authorName: string;
    if (cbook.authorName) {
      authorName = await TokenizeHelper.toTokenrizedStr(
        _.castArray(cbook.authorName)
      );
    } else {
      authorName = "";
    }

    let description: string;
    if (cbook.descriptionLines && cbook.descriptionLines.length > 0) {
      description = await TokenizeHelper.toTokenrizedStr(
        cbook.descriptionLines
      );
    } else {
      description = "";
    }

    const chunks = cbook.chunks?.map<ISimpleBookChunk>((x, i) => {
      return {
        ...x,
        idxByCreatedAtAsc: i,
      };
    });
    const latestChunk = chunks?.[chunks?.length - 1];

    const omits: Array<Paths<Crawler.IBook>> = [
      "title",
      "authorName",
      "descriptionLines",
      "chunks",
    ];
    const tidy = _.omit(cbook, omits);
    return {
      ...tidy,
      ...{ title, authorName, description, chunks },
      titleSuggest,
      importedAt: cbook.importedAt || new Date(),
      latestChunk,
      raw: {
        title: cbook.title || "",
        authorName: cbook.authorName || "",
        descriptionLines: cbook.descriptionLines || [],
      },
    };
  }
}
