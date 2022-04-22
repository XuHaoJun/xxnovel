import { OpenCC } from "opencc";

let converter: OpenCC;

export function getS2TConverter(): OpenCC {
  if (converter) {
    return converter;
  } else {
    converter = new OpenCC("s2t.json");
    return converter;
  }
}

export default async function convertToZhTw(data: string): Promise<string> {
  return getS2TConverter().convertPromise(data);
}
