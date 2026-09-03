import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
    "*.cursor.com",
    "*.cursor.sh",
  ],
  transpilePackages: ["leaflet", "react-leaflet", "leaflet.markercluster", "leaflet.heat"],
};

export default nextConfig;
