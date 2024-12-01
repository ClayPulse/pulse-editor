/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "export",
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

    return config;
  },
};

export default nextConfig;
