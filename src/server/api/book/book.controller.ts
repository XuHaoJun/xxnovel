import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";

@Controller({ version: ["1", VERSION_NEUTRAL] })
export class BookControllerV1 {
  @Get("/")
  public async getGoodBooks2() {
    return ["a"];
  }

  @Get("goods")
  public async getGoodBooks() {
    return ["a"];
  }
}
