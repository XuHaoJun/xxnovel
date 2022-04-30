import { Response } from "express";
import {
  Controller,
  Get,
  Param,
  Render,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { ParamsInterceptor } from "../params.interceptor";
import { ConfigInterceptor } from "../config.interceptor";

@Controller()
export class PagesController {
  @Get("/")
  @Render("index")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  home() {
    return {};
  }

  @Get("about")
  @Render("about")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  about(@Res() res: Response) {
    return {};
  }

  @Get("books/:bookIndex/:bookId")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  public book(
    @Res() res: Response,
    @Param("bookIndex") bookIndex: string,
    @Param("bookId") bookId: string
  ) {
    return res.render(`books/${bookIndex}/${bookId}`, {
      slug: [bookIndex, bookId],
    });
  }

  @Get("bookchunks/:bookIndex/:bookId/:idx")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  public bookChunk(
    @Res() res: Response,
    @Param("bookIndex") bookIndex: string,
    @Param("bookId") bookId: string,
    @Param("idx") idx: string
  ) {
    return res.render(`bookchunks/${bookIndex}/${bookId}/${idx}`, {
      slug: [bookIndex, bookId, idx],
    });
  }
}
