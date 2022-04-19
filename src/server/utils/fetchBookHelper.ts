import * as cheerio from "cheerio";
import _ from "lodash";
import type { Text } from "domhandler";
import "moment-timezone";
import moment from "moment";

import { myFetchForHtml } from "./myFetchForHtml";
import { ElementType } from "htmlparser2";
import path from "path";

export interface BookChunk {
  chapterName?: string;
  sectionName?: string;
  url?: string;
  createdAt?: Date;
  lines?: Array<string>;
}

export interface Book {
  title?: string;
  authorName?: string;
  chunks?: Array<BookChunk> | null;
  numBookChunks?: number;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  importedAt?: Date;
  category?: string;
  numChar?: number;
  thumbnailUrl?: string;
  descriptionLines?: Array<string>;
  crawleSource?: string;
  bookChunkInfosUrl?: string;
}

export async function fetchGoodBookInfoUrls(
  url = "https://www.ptwxz.com/"
): Promise<Array<string>> {
  const res = await myFetchForHtml(url);
  const $ = cheerio.load(res.data);
  const xs = $("a").toArray();
  const founds: Array<string> = [];
  for (const x of xs) {
    const href = x.attribs.href;
    const isBookInfoPathname = (s?: string) =>
      Boolean(s?.startsWith("/bookinfo"));
    if (isBookInfoPathname(href)) {
      const parsedUrl = new URL(url);
      parsedUrl.pathname = href;
      founds.push(parsedUrl.toString());
    }
  }
  return founds;
}

export async function fetchBookInfo(url: string): Promise<Book> {
  const parsedUrl = new URL(url);
  const res = await myFetchForHtml(url);

  const $ = cheerio.load(res.data);

  const title = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > span > h1"
  )
    .text()
    .trim();
  const category = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(1)"
  )
    .text()
    .split("：")[1]
    .trim();
  const authorName = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)"
  )
    .text()
    .split("：")[1]
    ?.trim();
  const status = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(3) > td:nth-child(2)"
  )
    .text()
    .split("：")[1]
    ?.trim();

  const thumbUrl = new URL(parsedUrl.toString());
  const thumbPathname = $(
    "#content > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > a > img"
  ).attr("src");
  thumbUrl.pathname = thumbPathname || "";
  const thumbnailUrl = thumbUrl.toString();

  const numCharStr = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td:nth-child(4)"
  )
    .text()
    .split("：")[1]
    ?.trim();
  const numChar = Number.parseInt(numCharStr, 10);

  const updatedAt0 = $(
    "#content > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(3) > td:nth-child(1)"
  )
    .text()
    .split("：")[1]
    .trim();
  const updatedAt = moment.tz(updatedAt0, "Asia/Taipei").toDate();

  const descriptionEle = $(
    "#content > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(2) > div > .hottext"
  );
  const descriptionLines: Array<string> = [];
  for (const x of descriptionEle.nextAll().toArray()) {
    if (x.name === "br" && x.next?.type === ElementType.Text) {
      const textNode = x.next as Text;
      const t = textNode.nodeValue?.trim();
      if (!_.isEmpty(t)) {
        descriptionLines.push(t);
      }
    }
  }

  const bookChunkInfosEle = $(
    "#content > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(1) > a"
  );
  const bookChunkInfosUrl = bookChunkInfosEle.attr("href");

  return {
    title,
    category,
    authorName,
    updatedAt,
    thumbnailUrl,
    numChar,
    status,
    descriptionLines,
    url,
    crawleSource: url,
    bookChunkInfosUrl,
  };
}

export async function fetchBookContent(url: string): Promise<BookChunk> {
  const parsedUrl = new URL(url);
  const suppportHostnames = getSupportHostnames();
  if (!suppportHostnames.includes(parsedUrl.hostname)) {
    throw new Error(`${parsedUrl.hostname} not in support list`);
  } else if (parsedUrl.hostname === "www.ptwxz.com") {
    return fetchAndParsePtwxzBookContent(parsedUrl);
  } else {
    throw new Error("not implement");
  }
}

export async function fetchBookChunkInfos(
  url: string
): Promise<Array<BookChunk>> {
  const parsedUrl = new URL(url);
  const suppportHostnames = getSupportHostnames();
  if (!suppportHostnames.includes(parsedUrl.hostname)) {
    throw new Error(`${parsedUrl.hostname} not in support list`);
  } else if (parsedUrl.hostname === "www.ptwxz.com") {
    return fetchAndParsePtwxzBookChunkInfos(parsedUrl);
  } else {
    throw new Error("not implement");
  }
}

async function fetchAndParsePtwxzBookChunkInfos(
  parsedUrl: URL
): Promise<Array<BookChunk>> {
  const res = await myFetchForHtml(parsedUrl.toString());

  const $ = cheerio.load(res.data);
  const xs = $(".centent").children().toArray();
  const chunks: Array<BookChunk> = [];

  let chapterName = "";
  for (const x of xs) {
    if (x.name === "div") {
      chapterName = $(x).text();
    } else if (x.name === "ul") {
      const links = $(x).find("a").toArray();
      for (const a of links) {
        const href = a.attribs.href;
        const sectionName = $(a).text();
        if (_.isString(href) && !_.isEmpty(href)) {
          const url = path.join(parsedUrl.toString(), href);
          const chunk: BookChunk = {
            chapterName,
            sectionName,
            url,
          };
          chunks.push(chunk);
        }
      }
    }
  }

  return chunks;
}

// function parsePtwxzUrl(parsedUrl: URL): Pick<BookContent, "bookId" | "id"> {
//   const parsedPath = path.parse(parsedUrl.pathname);
//   if (parsedPath.ext === ".html") {
//     const bookId = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedPath.dir}`;
//     const id = parsedUrl.toString();
//     return {
//       id,
//       bookId,
//     };
//   } else {
//     const bookId = parsedUrl.toString();
//     return {
//       bookId,
//     };
//   }
// }

async function fetchAndParsePtwxzBookContent(
  parsedUrl: URL
): Promise<BookChunk> {
  // const { id, bookId } = parsePtwxzUrl(parsedUrl);
  const res = await myFetchForHtml(parsedUrl.toString());
  const $ = cheerio.load(res.data);
  const eles = $("table").nextUntil("center").toArray();
  const lines: Array<string> = [];
  for (const x of eles) {
    if (x.name === "br" && x.next?.type === ElementType.Text) {
      const textNode = x.next as Text;
      lines.push(textNode.nodeValue);
    }
  }
  return {
    // id,
    // bookId,
    sectionName: $("h1").text(),
    lines,
    url: parsedUrl.toString(),
  };
}

export function getSupportHostnames(): Array<string> {
  return ["www.ptwxz.com"];
}

// (async () => {
//   const foo = await fetchAndParsePtwxzBookContent();
// })();
