"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// User's affiliate link for men's fashion on Temu
const TEMU_AFFILIATE_LINK = "https://www.temu.com/search_result.html?search_key=zapato%20para%20hombres&search_method=hot&refer_page_el_sn=200256&srch_enter_source=top_search_entrance_10005&refer_page_name=home&refer_page_id=10005_1769224470563_c3hryjbt1b&refer_page_sn=10005&_x_sessn_id=x4dfbu0zk3";

const products = [
    {
        id: 1,
        name: "Zapatillas Deportivas",
        imageSrc: "https://picsum.photos/seed/runningshoes/400/400",
        imageHint: "running shoes"
    },
    {
        id: 2,
        name: "Polos Estampados",
        imageSrc: "https://picsum.photos/seed/graphictee/400/400",
        imageHint: "graphic t-shirt"
    },
    {
        id: 3,
        name: "Zapatos Casuales",
        imageSrc: "https://picsum.photos/seed/canvasshoes/400/400",
        imageHint: "canvas shoes"
    },
    {
        id: 4,
        name: "Polos Básicos",
        imageSrc: "https://picsum.photos/seed/plainpolo/400/400",
        imageHint: "plain polo"
    },
    {
        id: 5,
        name: "Botines de Hombre",
        imageSrc: "https://picsum.photos/seed/menboots/400/400",
        imageHint: "men's boots"
    },
    {
        id: 6,
        name: "Zapatillas Urbanas",
        imageSrc: "https://picsum.photos/seed/leathersneaker/400/400",
        imageHint: "leather sneakers"
    },
    {
        id: 7,
        name: "Polo Camisero",
        imageSrc: "https://picsum.photos/seed/poloshirt/400/400",
        imageHint: "polo shirt"
    }
];

export const TemuBanner = () => {
    return (
        <Link 
            href={TEMU_AFFILIATE_LINK} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow"
        >
             <div className="p-4 bg-muted/20">
                <h3 className="text-lg font-semibold text-center">Ofertas para Hombres en Temu</h3>
                <p className="text-sm text-muted-foreground text-center">Zapatillas, polos y más con grandes descuentos</p>
            </div>
             <Carousel
                plugins={[
                    Autoplay({
                      delay: 2500,
                      stopOnInteraction: false,
                    }),
                ]}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-1">
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5 pl-1">
                            <div className="relative aspect-square">
                                <Image
                                    src={product.imageSrc}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-md"
                                    data-ai-hint={product.imageHint}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-xs font-semibold truncate">{product.name}</p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </Link>
    );
};
