import _ from "lodash";
import type { ParsedUrlQuery } from "querystring";
import type { ISearchBookBody } from "src/client/services/book";

export function routerQueryToSearchBody(
  query: ParsedUrlQuery
): ISearchBookBody {
  const parseText = (fieldName: string = "text"): string => {
    const v = query[fieldName];
    if (Array.isArray(v)) {
      return v.join(" ");
    } else if (typeof v === "string") {
      return v;
    } else {
      return "";
    }
  };
  const parseCategories = (
    fieldName: string = "categories"
  ): Array<string> | undefined => {
    const v = query[fieldName];
    if (Array.isArray(v)) {
      return v;
    } else if (typeof v === "string") {
      return [v];
    } else {
      return undefined;
    }
  };
  const parseStatus = (fieldName: string = "status"): string | undefined => {
    const v = query[fieldName];
    if (Array.isArray(v)) {
      return v[0];
    } else if (typeof v === "string") {
      return v;
    } else {
      return undefined;
    }
  };

  const text = parseText();
  const categories = parseCategories();
  const status = parseStatus();
  return {
    text,
    ..._.omitBy(
      {
        status,
        categories,
      },
      _.isUndefined
    ),
  };
}
