import { OpenCC } from "opencc";

let converter: OpenCC;

function getConverter(): OpenCC {
  if (converter) {
    return converter;
  } else {
    converter = new OpenCC("s2t.json");
    return converter;
  }
}

export default async function convertToZhTw(data: string): Promise<string> {
  return getConverter().convertPromise(data);
}
