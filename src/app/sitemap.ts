import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.fszscore.com';

  const routes = [
    { url: '/pronostico-del-dia/hoy', changeFrequency: 'daily', priority: 1.0 },
    { url: '/pronostico-del-dia/ayer', changeFrequency: 'daily', priority: 0.9 },
    { url: '/pronostico-del-dia/mañana', changeFrequency: 'daily', priority: 0.9 },
    { url: '/pronostico-de-la-semana', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/', changeFrequency: 'hourly', priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route.changeFrequency as 'hourly' | 'daily' | 'weekly',
    priority: route.priority,
  }));
}
