import { Injectable } from "@nestjs/common";
import { HanAnalysisResult, TaskName, XxHanlpClient } from "../XxHanlpClient";

@Injectable()
export class XxHanlpService implements Pick<XxHanlpClient, "analysis"> {
  private xxhanlpClient: XxHanlpClient;

  constructor() {
    this.xxhanlpClient = new XxHanlpClient({ enableAxiosRateLimit: false });
  }

  public async analysis(
    linesOrText: Array<string> | string,
    tasks?: Array<TaskName>
  ): Promise<HanAnalysisResult> {
    return this.xxhanlpClient.analysis(linesOrText, tasks);
  }
}
