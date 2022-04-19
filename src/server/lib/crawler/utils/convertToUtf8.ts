import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import iconv from "iconv-lite";

export function getCharset($: CheerioAPI): string {
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


export default function convertToUtf8(data: Buffer): string {
  const $ = cheerio.load(data);
  const charset = getCharset($);
  return iconv.decode(data, charset).toString();
}
