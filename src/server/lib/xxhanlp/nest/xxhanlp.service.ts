import { Injectable } from "@nestjs/common";
import { HanAnalysisResult, XxHanlpClient } from "../XxHanlpClient";

@Injectable()
export class XxHanlpService implements Pick<XxHanlpClient, "analysis"> {
  private xxhanlpClient: XxHanlpClient;
  constructor() {
    this.xxhanlpClient = new XxHanlpClient();
  }

  public async analysis(
    linesOrText: Array<string> | string
  ): Promise<HanAnalysisResult> {
    return this.xxhanlpClient.analysis(linesOrText);
  }
}
