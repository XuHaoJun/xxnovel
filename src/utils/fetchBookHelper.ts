import * as cheerio from "cheerio";
import _ from "lodash";
import type { Text } from "domhandler";

import { myFetchForHtml } from "./myFetchForHtml";
import { ElementType } from "htmlparser2";
import path from "path";

export interface BookContent {
  id?: string;
  bookId?: string;
  title?: string;
  lines?: Array<string>;
  url?: string;
}

export interface BookChunk {
  id?: string;
  chapterName?: string;
  sectionName?: string;
  contentId?: string;
  url?: string;
  createdAt?: Date;
}

export interface Book {
  id?: string;
  title?: string;
  authorName?: string;
  chunks?: Array<BookChunk>;
  url?: string;
  createdAt?: Date;
  importedAt?: Date;
}

export async function fetchBookContent(url: string): Promise<BookContent> {
  const parsedUrl = new URL(url);
  const suppportHostnames = getSupportHostnames();
  if (!suppportHostnames.includes(parsedUrl.hostname)) {
    throw new Error(`${parsedUrl.hostname} not in support list`);
  } else if (parsedUrl.hostname === "www.ptwxz.com") {
    return fetchAndParsePtwxzContent(parsedUrl);
  } else {
    throw new Error("not implement");
  }
}

export async function fetchBookChunks(url: string): Promise<Array<BookChunk>> {
  const parsedUrl = new URL(url);
  const suppportHostnames = getSupportHostnames();
  if (!suppportHostnames.includes(parsedUrl.hostname)) {
    throw new Error(`${parsedUrl.hostname} not in support list`);
  } else if (parsedUrl.hostname === "www.ptwxz.com") {
    return fetchAndParsePtwxzList(parsedUrl);
  } else {
    throw new Error("not implement");
  }
}

async function fetchAndParsePtwxzList(
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
          const id = url;
          const contentId = id;
          const chunk: BookChunk = {
            id,
            chapterName,
            sectionName,
            contentId,
            url,
          };
          chunks.push(chunk);
        }
      }
    }
  }

  return chunks;
}

function parsePtwxzUrl(parsedUrl: URL): Pick<BookContent, "bookId" | "id"> {
  const parsedPath = path.parse(parsedUrl.pathname);
  if (parsedPath.ext === ".html") {
    const bookId = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedPath.dir}`;
    const id = parsedUrl.toString();
    return {
      id,
      bookId,
    };
  } else {
    const bookId = parsedUrl.toString();
    return {
      bookId,
    };
  }
}

async function fetchAndParsePtwxzContent(parsedUrl: URL): Promise<BookContent> {
  const { id, bookId } = parsePtwxzUrl(parsedUrl);
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
    id,
    bookId,
    title: $("h1").text(),
    lines,
    url: parsedUrl.toString(),
  };
}

export function getSupportHostnames(): Array<string> {
  return ["www.ptwxz.com"];
}
