import _, { MapCache } from "lodash";
import Axios, { AxiosInstance } from "axios";
import LRUCache from "lru-cache";
import LZUTF8 from "lzutf8";
import crypto from "crypto";
import axiosRateLimit from "@hokify/axios-rate-limit";
import { Paths } from "../pathsType";

export interface HanAnalysisResultOri {
  sentences: Array<string>;
  tok_fine: Array<Array<string>>;
  ner_msra: Array<Array<Array<string | number>>>;
}

export interface HanAnalysisResult {
  sentences: Array<string>;
  tok_fine: Array<Array<string>>;
  ner_msra: Array<Array<NerMsraEntity>>;
}

/**
 * @see https://hanlp.hankcs.com/docs/annotations/ner/msra.html
 */
export enum NerMsraTag {
  Person = "PERSON",
  Location = "LOCATION",
  Organization = "ORGANIZATION",
  Date = "DATE",
  Duration = "DURATION",
  Time = "TIME",
  Percent = "PERCENT",
  Money = "MONEY",
  Frequency = "FREQUENCY",
  Integer = "INTEGER",
}

export interface NerMsraEntity {
  tok: string;
  ner: NerMsraTag;
  start: number;
  end: number;
}

const parseNerMsra = (ner: Array<string | number>): NerMsraEntity => {
  return {
    tok: ner[0] as string,
    ner: ner[1] as NerMsraTag,
    start: ner[2] as number,
    end: ner[3] as number,
  };
};

const getCacheKey = (
  linesOrText: Array<string> | string,
  tasks?: Array<TaskName>
): string => {
  const lines = _.castArray(linesOrText);
  const txt = lines.join("");
  const buffer: Buffer = LZUTF8.compress(txt, {
    inputEncoding: "String",
    outputEncoding: "Buffer",
  });
  const hashedText = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("base64");
  return `${hashedText}${tasks?.join(",")}`;
};

export enum TaskName {
  SplitSentences = "split_sentences",
  TokFine = "tok_fine",
  NerMsra = "ner_msra",
}

interface XxHanlpClientOptions {
  enableAxiosRateLimit?: boolean;
  axiosRateLimitConfig?: {
    maxRequests?: number;
    perMilliseconds?: number;
  };
}

export class XxHanlpClient {
  private axios: AxiosInstance;
  private caches: {
    analysis: LRUCache<string, HanAnalysisResult>;
  };

  constructor(_opts?: XxHanlpClientOptions) {
    const defaultOptions: XxHanlpClientOptions = {
      enableAxiosRateLimit: true,
      axiosRateLimitConfig: {
        maxRequests: 500,
        perMilliseconds: 1000 * 1,
      },
    };
    const opts = _.defaultsDeep(_opts, defaultOptions);
    const axios = Axios.create({
      baseURL: process.env.XXHANLP_API_URL || "http://localhost:8000",
    });
    if (opts.enableAxiosRateLimit) {
      this.axios = axiosRateLimit(axios, opts.axiosRateLimitConfig);
    } else {
      this.axios = axios;
    }
    this.caches = {
      analysis: new LRUCache({
        max: 300,
        maxSize: 350,
        sizeCalculation: (value: HanAnalysisResult) => {
          const numToken = _.sumBy(value.tok_fine, (x) => x.length);
          if (numToken > 120) {
            return 10;
          } else if (numToken > 70) {
            return 7;
          } else if (numToken > 50) {
            return 5;
          } else {
            return 1;
          }
        },
        ttl: 1000 * 60 * 5,
      }),
    };
  }

  public async analysis(
    linesOrText: Array<string> | string,
    tasks?: Array<TaskName>
  ): Promise<HanAnalysisResult> {
    const cacheKey = getCacheKey(linesOrText, tasks);
    const hit = this.caches.analysis.get(cacheKey);
    if (hit) {
      return hit;
    } else {
      const result = await this._analysis(linesOrText, tasks);
      this.caches.analysis.set(cacheKey, result);
      return result;
    }
  }

  protected async _analysis(
    linesOrText: Array<string> | string,
    tasks?: Array<TaskName>
  ): Promise<HanAnalysisResult> {
    const { axios } = this;
    const body: {
      lines?: Array<string>;
      text?: string;
      tasks?: Array<TaskName>;
    } = { ...{ tasks } };
    if (_.isArray(linesOrText)) {
      body.lines = linesOrText;
    } else {
      body.text = linesOrText;
    }

    const data = (await axios.post<HanAnalysisResultOri>("/analysis", body))
      .data;

    const omitField: Paths<HanAnalysisResultOri> = "ner_msra";
    let newNerMsra: Array<Array<NerMsraEntity>>;
    if (data.ner_msra) {
      newNerMsra = data.ner_msra.map((ners) =>
        ners.map((ner) => parseNerMsra(ner))
      );
    } else {
      newNerMsra = [];
    }

    return {
      ..._.omit(data, omitField),
      ner_msra: newNerMsra,
    };
  }
}

export const xxhanlpClient = new XxHanlpClient();
