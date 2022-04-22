import { Module } from "@nestjs/common";
import { XxHanlpService } from "./xxhanlp.service";

@Module({
  imports: [],
  providers: [XxHanlpService],
  exports: [XxHanlpService],
  controllers: [],
})
export class XxHanlpModule {}
