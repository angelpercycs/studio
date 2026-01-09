import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.fszscore.com';

  const routes = [
    { url: '/', changeFrequency: 'hourly', priority: 1.0 },
    { url: '/por-fecha', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-liga', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-favorito', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/politica-de-privacidad', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/terminos-y-condiciones', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority: route.priority,
  }));
}
