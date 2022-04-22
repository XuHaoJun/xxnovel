import Axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import _ from "lodash";
import randomUa from "random-useragent";
import rateLimit from "@hokify/axios-rate-limit";
import produce from "immer";

import convertToUtf8 from "./utils/convertToUtf8";
import convertToZhTw from "./utils/convertToZhTw";

export type RateLimitOptions = {
  keyGenerator?: (request: AxiosRequestConfig) => string;
  maxDelayMs?: number;
} & ({ maxRequests?: number; perMilliseconds?: number } | { maxRPS?: number });

export interface CrawlerConfig {
  enableToUtf8?: boolean;
  enableRandomAgent?: boolean;
  enableS2t?: boolean;
  rateLimtConfig?: {
    options?: RateLimitOptions;
  };
  defaultAxiosConfig?: AxiosRequestConfig;
  supportHostnames?: Array<string>;
  axiosInstance?: AxiosInstance;
}

export class CrawlerBase {
  protected config: CrawlerConfig;

  protected axios: AxiosInstance;

  constructor(_opts?: CrawlerConfig) {
    this.config = _.defaults(_opts, CrawlerBase.getDefaultInitOptions());

    const opts = this.config;
    const axiosOptions = opts.defaultAxiosConfig;
    let axios: AxiosInstance;
    if (opts.axiosInstance) {
      axios = opts.axiosInstance;
    } else {
      axios = Axios.create(axiosOptions);
      if (opts.rateLimtConfig?.options) {
        axios = rateLimit(axios, opts.rateLimtConfig?.options);
      }
    }
    this.axios = axios;
  }

  public static getDefaultInitOptions(): CrawlerConfig {
    return {
      enableToUtf8: true,
      enableRandomAgent: true,
      enableS2t: true,
      rateLimtConfig: {
        options: { maxRequests: 5, perMilliseconds: 60 * 1000 },
      },
      defaultAxiosConfig: {},
      supportHostnames: ["www.ptwxz.com"],
    };
  }

  public async getHtml<D = any>(
    url: string,
    crawleConfig?: Partial<CrawlerConfig>,
    axiosConfig?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<string>> {
    const { axios } = this;

    const opts = _.defaultsDeep(crawleConfig, _.cloneDeep(this.config));

    let axiosOpts: AxiosRequestConfig = axiosConfig ?? {};
    if (opts.enableRandomAgent) {
      axiosOpts = produce(axiosOpts, (draft: AxiosRequestConfig) => {
        const ahname = "User-Agent";
        const ua = draft.headers?.[ahname];
        if (!ua) {
          draft.headers = produce(
            draft.headers || {},
            (h: AxiosRequestHeaders) => {
              h[ahname] = randomUa.getRandom();
            }
          );
        }
      });
    }

    let res: AxiosResponse<string, D>;
    if (opts.enableToUtf8) {
      const bufferRes = await axios.get<Buffer>(
        url,
        produce(axiosOpts, (draft: AxiosRequestConfig) => {
          draft.responseType = "arraybuffer";
        })
      );
      const { data } = bufferRes;
      const strRes = bufferRes as unknown as AxiosResponse<string, D>;
      strRes.data = convertToUtf8(data);
      res = strRes;
    } else {
      res = await axios.get<string>(
        url,
        produce(axiosOpts, (draft) => {
          draft.responseType = "text";
        })
      );
    }

    if (opts.enableS2t) {
      res.data = await convertToZhTw(res.data);
    }

    return res;
  }
}

export default CrawlerBase;
