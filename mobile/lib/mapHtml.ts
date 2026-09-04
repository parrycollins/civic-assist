import type { Issue } from "./types";
import { categoryIcon } from "./types";

export function mapHtml(issues: Issue[]): string {
  const markers = issues.map((issue) => ({
    id: issue.id,
    lat: issue.location.lat,
    lng: issue.location.lng,
    title: `${categoryIcon(issue.category)} ${issue.title}`,
    area: issue.location.area,
  }));
  const json = JSON.stringify(markers).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; background: #e8e4d8; }
    .leaflet-container { background: #e8e4d8; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([5.6037, -0.187], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const markers = ${json};
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng]).addTo(map);
      marker.bindTooltip(m.title);
      marker.on('click', () => {
        const payload = JSON.stringify({ id: m.id });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
        else window.parent.postMessage(payload, '*');
      });
    });
  </script>
</body>
</html>`;
}
