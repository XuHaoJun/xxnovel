import { DynamicModule, Module } from "@nestjs/common";
import Next from "next";
import { RenderModule } from "nest-next";

import { NODE_ENV } from "../shared/constants/env";
import { PagesModule } from "./pages/pages.module";
import { ApiModule } from "./api/api.module";
import { InitialModule } from "./initial/initial.module";
import { LoggerModule } from "nestjs-pino";

declare const module: any;

@Module({})
export class AppModule {
  public static initialize(): DynamicModule {
    // const renderModule =
    //   module.hot?.data?.renderModule ??
    //   RenderModule.forRootAsync(Next({ dev: NODE_ENV === "development" }), {
    //     viewsDir: null,
    //   });

    // if (module.hot) {
    //   module.hot.dispose((data: any) => {
    //     data.renderModule = renderModule;
    //   });
    // }

    return {
      module: AppModule,
      imports: [
        ApiModule,
        InitialModule,
        LoggerModule.forRoot({
          pinoHttp: {
            level: process.env.NODE_ENV !== "production" ? "debug" : "info",
            transport:
              process.env.NODE_ENV !== "production"
                ? { target: "pino-pretty" }
                : undefined,
          },
        }),
      ],
      controllers: [],
      providers: [],
    };
  }
}
