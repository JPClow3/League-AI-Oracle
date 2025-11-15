export default function handler(req, res) {
  const BASE_URL = "https://league-ai-oracle.vercel.app";

  // Add your public routes here
  const routes = [
    "/",
    "/draft-lab",
    "/arena",
    "/playbook",
    "/meta-oracle",
    "/academy",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes
      .map((route) => {
        return `
        <url>
          <loc>${BASE_URL}${route}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${route === "/" ? "1.0" : "0.8"}</priority>
        </url>
        `;
      })
      .join("")}
  </urlset>
  `;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  res.status(200).send(sitemap);
}
