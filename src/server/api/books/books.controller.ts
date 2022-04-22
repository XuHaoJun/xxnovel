import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  VERSION_NEUTRAL,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import _ from "lodash";
import { Response } from "express";

import { BooksService } from "./books.service";
import { PaginationRange } from "./dto/search.dto";
import { GetBookChunkByBookIdAndIdxParams } from "./dto/bookChunk.dto";
import { BookChunkForClient } from "../../db/elasticsearch/models/bookChunk.model";

@Controller({ version: ["1", VERSION_NEUTRAL] })
export class BooksControllerV1 {
  constructor(private readonly booksService: BooksService) {}

  @Get("/")
  public async getBooks() {
    return ["a"];
  }

  @Get("/latests")
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    })
  )
  public async getLatestBooks(@Query() q: PaginationRange) {
    const defaultRange = { offset: 0, limit: 100 };
    const { offset, limit } = _.defaults(
      { offset: q.offset, limit: q.limit },
      defaultRange
    );
    if (offset + limit > 10000) {
      throw new BadRequestException("offset + limit  > 10000");
    } else {
      return this.booksService.getLatestBooks({ size: limit, from: offset });
    }
  }

  @Get("/crawle/preview")
  public async crawleOne(@Query("src") src: string) {
    return this.booksService.crawleOne(src);
  }

  @Get("/crawle/preview/random")
  public async crawleOneRandom() {
    return this.booksService.crawleOneRandom();
  }

  @Put("/crawle/random")
  public async crawleSaveOneRandom() {
    return this.booksService.crawleSaveOneRandom();
  }

  @Get("/indices/:index/:id")
  public async getBook(@Param("index") index: string, @Param("id") id: string) {
    return this.booksService.findOne({ index, id });
  }

  @Get("/indices/:index/:id/thumb")
  public async getBookThumb(
    @Param("index") index: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    const stream = await this.booksService.getThumbStream({ index, id });
    if (stream) {
      stream.pipe(res);
      stream.on("error", () => {
        res.end();
      });
    } else {
      throw new NotFoundException();
    }
  }

  @Get("/ids/:bookId/chunks-by-idxs/:idxByCreatedAtAsc")
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    })
  )
  public async getBookChunkByBookIdAndIdx(
    @Param() params: GetBookChunkByBookIdAndIdxParams
  ): Promise<BookChunkForClient> {
    const { bookId, idxByCreatedAtAsc } = params;
    return this.booksService.getBookChunkByBookIdAndIdx(
      bookId,
      idxByCreatedAtAsc
    );
  }
}
