import { MetadataRoute } from 'next';
import { format, subDays, addDays } from 'date-fns';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://fszscore.com';

    const staticRoutes = [
        { url: '/', changeFrequency: 'hourly', priority: 1.0 },
        { url: '/por-fecha', changeFrequency: 'weekly', priority: 0.7 },
        { url: '/por-liga', changeFrequency: 'weekly', priority: 0.7 },
        { url: '/por-favorito', changeFrequency: 'weekly', priority: 0.7 },
        { url: '/login', changeFrequency: 'monthly', priority: 0.5 },
        { url: '/mis-pronosticos', changeFrequency: 'monthly', priority: 0.5 },
        { url: '/politica-de-privacidad', changeFrequency: 'monthly', priority: 0.3 },
        { url: '/terminos-y-condiciones', changeFrequency: 'monthly', priority: 0.3 },
    ];

    const dynamicDateRoutes = [];
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));

    // 7 days in the past
    for (let i = 1; i <= 7; i++) {
        const date = subDays(today, i);
        const dateString = format(date, 'yyyy-MM-dd');
        const url = (i === 1) ? '/partidos/ayer' : `/partidos/${dateString}`;
        dynamicDateRoutes.push({
            url: url,
            changeFrequency: 'daily',
            priority: 0.8
        });
    }

    // 7 days in the future
    for (let i = 1; i <= 7; i++) {
        const date = addDays(today, i);
        const dateString = format(date, 'yyyy-MM-dd');
        const url = (i === 1) ? '/partidos/manana' : `/partidos/${dateString}`;
        dynamicDateRoutes.push({
            url: url,
            changeFrequency: 'daily',
            priority: 0.8
        });
    }
    
    const allRoutes = [...staticRoutes, ...dynamicDateRoutes];

    // Ensure no duplicate URLs
    const uniqueRoutes = Array.from(new Map(allRoutes.map(item => [item.url, item])).values());


    return uniqueRoutes.map((route) => ({
        url: `${baseUrl}${route.url}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route.changeFrequency as any,
        priority: route.priority,
    }));
}
