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
  Header,
  Post,
  Body,
} from "@nestjs/common";
import _ from "lodash";
import { Response } from "express";

import { BooksService } from "./books.service";
import { QueryPaginationRange } from "./dto/search.dto";
import { GetBookChunkByBookIdAndIdxParams } from "./dto/bookChunk.dto";
import { BookChunkForClient } from "../../db/elasticsearch/models/bookChunk.model";
import { BookForClient } from "src/server/db/elasticsearch/models/book.model";

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
  public async getLatestBooks(@Query() q: QueryPaginationRange) {
    const defaultRange = { offset: 0, limit: 100 };
    const { offset, limit } = _.defaults(
      { offset: q.offset, limit: q.limit },
      defaultRange
    );
    if (offset + limit > 10000) {
      throw new BadRequestException("offset + limit  > 10000");
    } else {
      return this.booksService.getLatestBooks({ offset, limit });
    }
  }

  @Post("/search")
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    })
  )
  public async search(@Body() body: QueryPaginationRange) {
    const defaultRange = { offset: 0, limit: 100 };
    const { offset, limit } = _.defaults(
      { offset: body.offset, limit: body.limit },
      defaultRange
    );
    if (offset + limit > 10000) {
      throw new BadRequestException("offset + limit  > 10000");
    } else {
      return this.booksService.search({ offset, limit });
    }
  }

  @Get("/title-suggests")
  public async getTitleSuggests(
    @Query("prefix") prefix: string
  ): Promise<Array<BookForClient>> {
    return this.booksService.getTitleSuggests(prefix);
  }

  @Get("/crawle")
  public async crawleOne(@Query("src") src: string) {
    return this.booksService.crawleOne(src);
  }

  @Get("/indices/:index/:id")
  public async getBook(@Param("index") index: string, @Param("id") id: string) {
    return this.booksService.findOne({ index, id });
  }

  @Get("/indices/:index/:id/thumb")
  @Header("content-type", "image/jpeg")
  public async getBookThumb(
    @Param("index") index: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
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
