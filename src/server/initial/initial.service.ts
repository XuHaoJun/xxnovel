import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchUsecase } from "../db/elasticsearch/usecase/elasticsearch.usecase";

@Injectable()
export class InitialService {
  constructor(private readonly myes: ElasticsearchUsecase) {}

  public async init() {
    // await this.myes.initTemplates();
    await this.myes.initIndices();
  }
}
