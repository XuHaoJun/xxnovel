import _ from "lodash";
import { xxhanlpClient } from "../../xxhanlp/XxHanlpClient";

import convertToZhTw from "./convertToZhTw";

function isLargeNumChars(lines: Array<string>): Boolean {
  return false;
  // for (const x of lines) {
  //   if (x.length >= 300) {
  //     return true;
  //   }
  // }
  // return false;
}

export default async function s2t(
  linesOrText: string | Array<string>
): Promise<string | Array<string>> {
  if (isLargeNumChars(_.castArray(linesOrText))) {
    const { tok_fine: tok } = await xxhanlpClient.analysis(linesOrText);
    if (_.isArray(linesOrText)) {
      return await Promise.all(tok.map((x) => convertToZhTw(x.join(""))));
    } else {
      const flatTok = _.flatten(tok);
      const foo = await Promise.all(flatTok.map(convertToZhTw));
      const str = foo.join("");
      return str;
    }
  } else {
    if (_.isArray(linesOrText)) {
      return await Promise.all(linesOrText.map(convertToZhTw));
    } else {
      return convertToZhTw(linesOrText);
    }
  }
}
