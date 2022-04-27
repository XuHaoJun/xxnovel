import sourceMapSupport from "source-map-support";

sourceMapSupport.install();

import dotenv from "dotenv";

dotenv.config();

import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { VersioningType, VERSION_NEUTRAL } from "@nestjs/common";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { PORT } from "../shared/constants/env";
import { InitialService } from "./initial/initial.service";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule.initialize(), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  app.enableCors();

  const initialService: InitialService = app.get(InitialService);
  await initialService.init();

  await app.listen(PORT);

  // for vscode debugger
  console.log(
    `started server on 0.0.0.0:${PORT}, url: http://localhost:${PORT}`
  );

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
