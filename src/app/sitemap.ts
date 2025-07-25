import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.fszscore.com'; 

  // Aunque la app usa pestañas, preparamos el sitemap para una futura estructura de rutas.
  // Actualmente, solo la URL base es una página real.
  const routes = [
    { url: '/', changeFrequency: 'hourly', priority: 1.0 },
    { url: '/daily-matches/yesterday', changeFrequency: 'daily', priority: 0.8 },
    { url: '/daily-matches/today', changeFrequency: 'daily', priority: 0.9 },
    { url: '/daily-matches/tomorrow', changeFrequency: 'daily', priority: 0.8 },
    { url: '/by-date', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/by-league', changeFrequency: 'weekly', priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    changeFrequency: route.changeFrequency as 'hourly' | 'daily' | 'weekly',
    priority: route.priority,
  }));
}
