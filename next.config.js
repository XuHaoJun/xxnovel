const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");

/** @type {import('next').NextConfig} */
module.exports = (phase, defaultConfig) => {
  return withBundleAnalyzer({
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
  });
};
