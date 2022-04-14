import { detect } from "detect-browser";

export default function getBaseURL(): string {
  const defaultOriginURL = `http://localhost:${
    process?.env?.NODE_ENV === "development"
      ? process?.env?.PORT || 3000
      : process?.env?.PORT || 80
  }`;
  const runtime = detect();
  if (runtime) {
    switch (runtime.type) {
      case "browser":
        return window?.location?.origin || defaultOriginURL;
      case "node":
      default:
        return defaultOriginURL;
    }
  } else {
    return defaultOriginURL;
  }
}
