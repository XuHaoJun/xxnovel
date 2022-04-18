import { Module } from "@nestjs/common";
import { InitialService } from "./initial.service";
import { MyElasticsearchModule } from "../db/elasticsearch/myElasticsearch.module";

@Module({
  imports: [MyElasticsearchModule],
  providers: [InitialService],
})
export class InitialModule {}
