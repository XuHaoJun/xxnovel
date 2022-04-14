import dotenv from "dotenv";

dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PORT } from "../shared/constants/env";
import { VersioningType, VERSION_NEUTRAL } from "@nestjs/common";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule.initialize());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  await app.listen(PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
