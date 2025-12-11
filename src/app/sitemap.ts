import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.fszscore.com';

  const routes = [
    { url: '/', changeFrequency: 'hourly', priority: 1.0 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route.changeFrequency as 'hourly' | 'daily' | 'weekly',
    priority: route.priority,
  }));
}
