import { simplecc } from "simplecc-wasm";

export default async function convertToZhTw(data: string): Promise<string> {
  return Promise.resolve(simplecc(data, "s2t"));
}
