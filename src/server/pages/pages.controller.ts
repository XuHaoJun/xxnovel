import { Controller, Get, Render, UseInterceptors } from "@nestjs/common";
import { ParamsInterceptor } from "../params.interceptor";
import { ConfigInterceptor } from "../config.interceptor";

@Controller()
export class PagesController {
  @Get("/")
  @Render("index")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  home() {
    console.log("hoaisdfiajsdiofj");
    return "hello";
  }

  @Get("about")
  @Render("about")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  about() {
    return {};
  }

  @Get(":id")
  @Render("[id]")
  @UseInterceptors(ParamsInterceptor, ConfigInterceptor)
  public blogPost() {
    return {};
  }
}
