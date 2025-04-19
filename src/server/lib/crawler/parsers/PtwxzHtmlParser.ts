import _ from "lodash";
import { CheerioAPI } from "cheerio";
import { ElementType } from "htmlparser2";
import type { Text } from "domhandler";
import "moment-timezone";
import moment from "moment";
import { IBook, IBookChunk } from "../interfaces/Book";
import path from "path";

export class PtwxzCheerioParser {
  public static bookInfo(parsedUrl: URL, $: CheerioAPI): IBook {
    const url = parsedUrl.toString();
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
    const bookChunkInfosParsedUrl = new URL(parsedUrl.toString());
    let bookChunkInfosUrl: string;
    try {
      bookChunkInfosUrl = new URL(
        bookChunkInfosEle.attr("href") || ""
      ).toString();
    } catch (err: any) {
      bookChunkInfosParsedUrl.pathname = bookChunkInfosEle.attr("href") || "";
      bookChunkInfosUrl = bookChunkInfosParsedUrl.toString();
    }

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

  public static bookInfoUrls(parsedUrl: URL, $: CheerioAPI): Array<string> {
    const xs = $("a").toArray();
    const founds: Array<string> = [];
    for (const x of xs) {
      const href = x.attribs.href;
      const isBookInfoPathname = (s?: string) =>
        Boolean(s?.startsWith("/bookinfo"));
      if (isBookInfoPathname(href)) {
        parsedUrl.pathname = href;
        founds.push(parsedUrl.toString());
      }
    }
    return founds;
  }

  public static bookChunkInfos(
    parsedUrl: URL,
    $: CheerioAPI
  ): Array<IBookChunk> {
    const xs = $(".centent").children().toArray();
    const chunks: Array<IBookChunk> = [];

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
            const u = new URL(parsedUrl.toString());
            u.pathname = path.join(u.pathname, href);
            const url = u.toString();
            const chunk: IBookChunk = {
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

  public static bookContent(parsedUrl: URL, $: CheerioAPI): IBookChunk {
    const eles = $("table").nextUntil("center").toArray();
    const lines: Array<string> = [];
    for (const x of eles) {
      if (x.name === "br" && x.next?.type === ElementType.Text) {
        const textNode = x.next as Text;
        lines.push(textNode.nodeValue);
      }
    }
    const h1text = $("h1").text();
    const bookTitle = $("h1 > a").text();
    // should same as book toc's name
    const sectionName = h1text.replace(bookTitle, "");
    return {
      sectionName: sectionName,
      contentLines: lines,
      url: parsedUrl.toString(),
    };
  }
}
