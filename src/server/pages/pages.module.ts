import { Module } from "@nestjs/common";

import { PagesController } from "./pages.controller";

@Module({
  imports: [],
  providers: [],
  exports: [],
  controllers: [PagesController],
})
export class PagesModule {}
