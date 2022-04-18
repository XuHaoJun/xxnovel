import { BasicAuth } from "@elastic/elasticsearch/lib/pool";
import { ElasticsearchModule as NestElasticsearchModule } from "@nestjs/elasticsearch";

export function esUrlToClientOptions(esUrl: string) {
  const parseEsAddr = (addr: string): URL => {
    return new URL(addr);
  };

  const getParsedEsEndpoint = (x: URL): URL => {
    const xx = new URL(x.toString());
    xx.search = "";
    xx.username = "";
    xx.password = "";
    return xx;
  };
  const parsedEsAddr = parseEsAddr(esUrl);
  const parsedEsEndpoint = getParsedEsEndpoint(parsedEsAddr);

  let auth: BasicAuth | undefined;
  if (parsedEsAddr.username !== "" && parsedEsAddr.password !== "") {
    auth = {
      username: parsedEsAddr.username,
      password: parsedEsAddr.password,
    };
  } else {
    auth = undefined;
  }

  const rejectUnauthorized =
    parsedEsAddr.searchParams.get("tlsInsecure") !== "true";
  const ssl = {
    rejectUnauthorized,
  };
  return {
    node: parsedEsEndpoint.toString(),
    ...{ auth },
    ssl,
  };
}

export const ElasticsearchModule = NestElasticsearchModule.register({
  ...esUrlToClientOptions(process.env.ELASTIC_URL || "http://localhost:9200"),
});
