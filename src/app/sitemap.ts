import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fszscore.com';

  const routes = [
    { url: '/partidos/hoy', changeFrequency: 'hourly', priority: 1.0 },
    { url: '/partidos/ayer', changeFrequency: 'daily', priority: 0.8 },
    { url: '/partidos/manana', changeFrequency: 'daily', priority: 0.8 },
    { url: '/por-fecha', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-liga', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/por-favorito', changeFrequency: 'weekly', priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString(), // Actualizado para refrescar los datos
    changeFrequency: route.changeFrequency as 'hourly' | 'daily' | 'weekly',
    priority: route.priority,
  }));
}
