const withPWA = require("next-pwa");
const runtimeCaching = require('next-pwa/cache')
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");

/** @type {import('next').NextConfig} */
module.exports = (phase, defaultConfig) => {
  return withBundleAnalyzer(
    withPWA({
      pwa: {
        dest: "public",
        runtimeCaching,
        disable: process.env.NODE_ENV === "development",
      },
      ...defaultConfig,
      reactStrictMode: false,
      webpack: (config) => {
        config.plugins.push(
          new MomentTimezoneDataPlugin({
            matchCountries: "TW",
          })
        );
        return config;
      },
    })
  );
};
