"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";

const products = [
    {
        id: 1,
        name: "Pantalones Cortos Casuales para Hombre",
        description: "Con cintura ajustable y tejido ligero, ideal para uso diario, playa o actividades al aire libre.",
        price: "S/ 2.93",
        link: "https://temu.to/k/g5vbia92e4b",
        imageSrc: "https://picsum.photos/seed/casualshorts/400/400",
        imageHint: "men casual shorts"
    },
    {
        id: 2,
        name: "Mochila de Viaje de Gran Capacidad",
        description: "Bolso para laptop, adecuada para estudiantes de secundaria, bachillerato y universidad.",
        price: "S/ 6.40",
        link: "https://temu.to/k/gzuhcbz7huu",
        imageSrc: "https://picsum.photos/seed/largebackpack/400/400",
        imageHint: "large backpack"
    }
];

export const TemuBanner = () => {
    return (
        <div className="w-full my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                    <Link 
                        key={product.id}
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block group"
                    >
                        <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                            <div className="relative w-full aspect-video">
                                <Image
                                    src={product.imageSrc}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={product.imageHint}
                                />
                            </div>
                            <CardContent className="p-4 flex-grow flex flex-col justify-between bg-card">
                                <div className='flex-grow'>
                                    <h3 className="font-bold text-lg group-hover:text-primary leading-tight text-card-foreground">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                                </div>
                                <div className='mt-4 pt-4 border-t border-border/50'>
                                    <p className="text-2xl font-black text-destructive">🎉 {product.price}</p>
                                    <p className="text-xs text-muted-foreground mt-1">⚠️ Cada usuario nuevo de la aplicación solo puede unirse una vez.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
