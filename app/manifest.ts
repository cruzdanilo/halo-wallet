import type { MetadataRoute } from "next";

export default function manifest() {
  return {
    name: "hallo wallet",
    short_name: "hallo",
    description: "own your arx halo",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    protocol_handlers: [{ protocol: "wc", url: "/?uri=%s" }],
  } satisfies MetadataRoute.Manifest;
}
