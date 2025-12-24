import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.fszscore.com';

  const routes = [
    { url: '/', changeFrequency: 'hourly', priority: 1.0 },
    { url: '/partidos/hoy', changeFrequency: 'hourly', priority: 1.0 },
    { url: '/partidos/ayer', changeFrequency: 'daily', priority: 0.8 },
    { url: '/partidos/mañana', changeFrequency: 'daily', priority: 0.8 },
    { url: '/por-fecha', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-liga', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-favorito', changeFrequency: 'weekly', priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route.changeFrequency as 'hourly' | 'daily' | 'weekly',
    priority: route.priority,
  }));
}
