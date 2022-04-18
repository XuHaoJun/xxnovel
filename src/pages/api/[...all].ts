import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware from "next-http-proxy-middleware";

export const config = {
  api: {
    // Enable `externalResolver` option in Next.js
    externalResolver: true,
  },
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  // console.log(req, res);
  return httpProxyMiddleware(req, res, {
    target: process.env.API_PROXY || "http://localhost:3001",
    // You can use the `http-proxy` option
    // In addition, you can use the `pathRewrite` option provided by `next-http-proxy-middleware`
    // pathRewrite: [
    //   {
    //     patternStr: '^/api',
    //     replaceStr: '/api'
    //   },
    // ],
  });
};
