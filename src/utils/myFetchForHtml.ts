import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import iconv from "iconv-lite";
import type { CheerioAPI } from "cheerio";
import { OpenCC } from "opencc";
import randomUa from "random-useragent";

function getCharset($: CheerioAPI): string {
  const metas = $("head > meta").toArray();
  const charsetRegex = /charset=(.+)/;
  for (const x of metas) {
    const content = x.attribs["content"] ?? "";
    const match = charsetRegex.exec(content);
    if (match) {
      return match[1];
    }
  }
  return "utf-8";
}

async function convertToUtf8(data: Buffer): Promise<string> {
  const $ = cheerio.load(data);
  const charset = getCharset($);
  return iconv.decode(data, charset).toString();
}

async function convertToZhTw(data: string): Promise<string> {
  const converter: OpenCC = new OpenCC("s2t.json");
  return converter.convertPromise(data);
}

export async function myFetchForHtml(
  url: string
): Promise<AxiosResponse<string>> {
  const res = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
    headers: { "User-Agent": randomUa.getRandom() },
  });
  const { data } = res;
  const toUtf8 = await convertToUtf8(data);
  const rawHtml = await convertToZhTw(toUtf8);
  return { ...res, data: rawHtml } as AxiosResponse<string>;
}
