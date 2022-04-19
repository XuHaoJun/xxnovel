import { Controller, Get, Query, VERSION_NEUTRAL } from "@nestjs/common";
import _ from "lodash";

import { BooksService } from "./books.service";

@Controller({ version: ["1", VERSION_NEUTRAL] })
export class BooksControllerV1 {
  constructor(private readonly booksService: BooksService) {}

  @Get("/")
  public async getBooks() {
    return ["a"];
  }

  @Get("_/:bookId")
  public async getBook() {
    return ["a"];
  }

  @Get("_/goods")
  public async getGoodBooks() {
    return ["a"];
  }

  @Get("_/crawle/preview")
  public async crawleOne(@Query("src") src: string) {
    return this.booksService.crawleOne(src);
  }

  @Get("_/crawle/preview/random")
  public async crawleOneRandom() {
    return this.booksService.crawleOneRandom();
  }
}
