import { Module } from "@nestjs/common";

import { ElasticsearchUsecase } from "./usecase/elasticsearch.usecase";
import { ElasticsearchModule } from "./elasticsearch.module";

@Module({
  imports: [ElasticsearchModule],
  exports: [ElasticsearchUsecase],
  providers: [ElasticsearchUsecase],
})
export class MyElasticsearchModule {}
