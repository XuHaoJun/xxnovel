import { Controller, Get } from "@nestjs/common";

@Controller("comments")
export class CommentController {
  @Get("/goods")
  public async getGoodBooks() {
    return ["a"];
  }
}
