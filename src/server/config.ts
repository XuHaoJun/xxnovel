import type { Config } from "../shared/types/config";

const CONFIG: Config = {
  features: {
    blog_link: true,
  },
  basePath: process.env.BASE_PATH || "",
};

export { CONFIG };
