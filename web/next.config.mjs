/** @type {import('next').NextConfig} */
// import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "../build/next",
  webpack: (config) => {
    // Add external configuration
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make Konva & react-konva work

    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    config.ignoreWarnings = [
      {
        message:
          /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];

    // config.plugins = [
    //   new ModuleFederationPlugin({
    //     name: "pulse_editor",
    //     shared: {
    //       react: {
    //         import: "react", // the "react" package will be used a provided and fallback module
    //         shareKey: "react", // under this name the shared module will be placed in the share scope
    //         shareScope: "default", // share scope with this name will be used
    //         singleton: true, // only a single version of the shared module is allowed
    //       },
    //       "react-dom": {
    //         singleton: true, // only a single version of the shared module is allowed
    //       },
    //     },
    //   }),
    // ];

    return config;
  },
};

export default nextConfig;
