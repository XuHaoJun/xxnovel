import { Heading } from "@chakra-ui/react";
import * as cheerio from "cheerio";

import { myFetchForHtml } from "../utils/myFetchForHtml";

export default function IndexPage({ text }: any) {
  const foo = "&nbsp;  abcd  ";
  return <Heading>{text}</Heading>;
}

async function listChapters(url: string) {}

async function fetchNovel(url: string): Promise<{ rawHtml: string }> {
  const res = await myFetchForHtml(url);
  const $ = cheerio.load(res.data);
  const xs = $("head").children();
  console.log("-------------");
  // xs.each((i, x) => x.children)
  return {
    rawHtml: $.text(),
  };
}

export async function getServerSideProps() {
  const result = await fetchNovel(
    `https://www.ptwxz.com/html/5/5432/2865710.html`
  );
  return {
    props: { text: result.rawHtml }, // will be passed to the page component as props
  };
}
