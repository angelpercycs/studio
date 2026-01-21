import { MetadataRoute } from 'next';
import { format, subDays, addDays } from 'date-fns';

// Este archivo genera dinámicamente el mapa del sitio (sitemap) para la aplicación.
// Es crucial para la indexación en motores de búsqueda como Google, ya que les informa
// sobre todas las páginas estáticas y dinámicas (basadas en fechas) disponibles.

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://fszscore.com';
    const lastModified = new Date().toISOString();

    // 1. Rutas estáticas: Son las páginas principales que no cambian.
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${baseUrl}/`, changeFrequency: 'hourly', priority: 1.0, lastModified },
        { url: `${baseUrl}/por-fecha`, changeFrequency: 'daily', priority: 0.8, lastModified },
        { url: `${baseUrl}/por-liga`, changeFrequency: 'daily', priority: 0.8, lastModified },
        { url: `${baseUrl}/por-favorito`, changeFrequency: 'daily', priority: 0.8, lastModified },
        { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.5, lastModified },
        { url: `${baseUrl}/mis-pronosticos`, changeFrequency: 'monthly', priority: 0.5, lastModified },
        { url: `${baseUrl}/politica-de-privacidad`, changeFrequency: 'yearly', priority: 0.3, lastModified },
        { url: `${baseUrl}/terminos-y-condiciones`, changeFrequency: 'yearly', priority: 0.3, lastModified },
    ];

    // 2. Rutas dinámicas de fechas: Generamos enlaces para los últimos y próximos 7 días.
    //    Esto es crucial para que Google descubra la navegación secuencial que implementamos.
    const dynamicDateRoutes: MetadataRoute.Sitemap = [];
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const numberOfDays = 7; // Número de días hacia el pasado y futuro a generar

    // Generar rutas para los días pasados
    for (let i = 1; i <= numberOfDays; i++) {
        const date = subDays(today, i);
        const dateString = format(date, 'yyyy-MM-dd');
        // El primer día hacia atrás es 'ayer', los demás usan la fecha.
        const path = (i === 1) ? '/partidos/ayer' : `/partidos/${dateString}`;
        dynamicDateRoutes.push({
            url: `${baseUrl}${path}`,
            changeFrequency: 'daily',
            priority: 0.9,
            lastModified,
        });
    }

    // Generar rutas para los días futuros
    for (let i = 1; i <= numberOfDays; i++) {
        const date = addDays(today, i);
        const dateString = format(date, 'yyyy-MM-dd');
        // El primer día hacia adelante es 'mañana', los demás usan la fecha.
        const path = (i === 1) ? '/partidos/manana' : `/partidos/${dateString}`;
        dynamicDateRoutes.push({
            url: `${baseUrl}${path}`,
            changeFrequency: 'daily',
            priority: 0.9,
            lastModified,
        });
    }
    
    // 3. Unimos todas las rutas generadas.
    return [...staticRoutes, ...dynamicDateRoutes];
}
