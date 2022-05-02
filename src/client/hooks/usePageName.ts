import * as React from "react";
import { PageNames } from "../pageNames";

export const PageNameContext = React.createContext(PageNames.Unknown);

export const usePageName = (): PageNames => {
  const pageName = React.useContext(PageNameContext);
  return pageName;
};
