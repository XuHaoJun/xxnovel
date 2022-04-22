import _ from "lodash";
import { xxhanlpClient } from "../../../lib/xxhanlp/XxHanlpClient";
import { SPLITTER_TOKEN } from "../constant";

export const toksToStr = (toks: Array<Array<string>>): string => {
  return _.flatten(toks).join(SPLITTER_TOKEN);
};

export const toTokenrizedStr = async (str: Array<string>): Promise<string> => {
  return toksToStr((await xxhanlpClient.analysis(str)).tok_fine);
};
