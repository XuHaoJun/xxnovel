import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { detect } from "detect-browser";
import _ from "lodash";
import path from "path";

import getBaseURL from "./getBaseURL";

const singletonHttpClients: {
  server?: AxiosInstance;
  browser?: AxiosInstance;
} = {};

export function getApiHttpClient() {
  const runtime = detect();
  // In server-side environment, default to node environment if detection fails
  if (!runtime && typeof window === 'undefined') {
    if (!singletonHttpClients.server) {
      const httpClient = createHttpClient({ timeout: 1000 * 60 * 5 });
      singletonHttpClients.server = httpClient;
      return singletonHttpClients.server;
    }
    return singletonHttpClients.server;
  }
  
  if (!runtime) {
    throw new Error("not detect runtime!");
  } else {
    if (runtime.type === "node") {
      if (!singletonHttpClients.server) {
        const httpClient = createHttpClient({ timeout: 1000 * 60 * 5 });
        singletonHttpClients.server = httpClient;
        return singletonHttpClients.server;
      } else {
        return singletonHttpClients.server;
      }
    } else {
      if (!singletonHttpClients.browser) {
        const httpClient = createHttpClient({ timeout: 1000 * 60 });
        singletonHttpClients.browser = httpClient;
        return singletonHttpClients.browser;
      } else {
        return singletonHttpClients.browser;
      }
    }
  }
}

export interface CreateHttpClientOptions {
  isApi?: boolean;
  apiVersion?: string;
  apiPrefix?: string;
}

export function createHttpClient(
  configs?: AxiosRequestConfig,
  _opts?: CreateHttpClientOptions
): AxiosInstance {
  const defaultOptions = { isApi: true, apiVersion: "v1", apiPrefix: "/api" };
  const opts = _.defaults(_opts, defaultOptions);

  const bUrlStr = getBaseURL();
  let baseURL: string;
  if (opts.isApi) {
    const burl = new URL(bUrlStr);
    burl.pathname = path.join(burl.pathname, opts.apiPrefix);
    baseURL = burl.toString();
  } else {
    baseURL = bUrlStr;
  }

  return Axios.create({
    baseURL,
    ...configs,
  });
}
