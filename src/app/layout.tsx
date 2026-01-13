import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Calendar, CalendarDays, Shield, Star, Coffee } from 'lucide-react';
import Script from 'next/script';
import { UserProfile } from '@/components/user-profile';
import { FirebaseClientProvider } from '@/firebase';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { BetSlip } from '@/components/bet-slip';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Fútbol Stats Zone',
  description: 'Track football matches by day, date, or league.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5144766807318748" crossOrigin="anonymous"></script>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1NDL1YXWW7"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-1NDL1YXWW7');
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <BetSlipProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
              <header className="container mx-auto flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-4">
                  <Image
                    src="/icon.svg"
                    alt="App Icon"
                    width={48}
                    height={48}
                    className="baby-blue-icon"
                  />
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                      Fútbol Stats Zone
                    </h1>
                    <p className="text-sm text-muted-foreground">Pronósticos de Fútbol</p>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <Link href="https://ko-fi.com/futbolstatszone" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Coffee className="mr-2 h-4 w-4" /> Apóyame
                    </Button>
                  </Link>
                  <UserProfile />
                </div>
              </header>
              <main className="container mx-auto flex-grow px-4 pb-8 md:pb-12">

                <h2 className="text-xl font-semibold mb-4 text-center">Encuentros y Estadísticas Profesionales (Tipo StatsZone)</h2>

                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <Link href="/" className='flex-1'>
                      <TabsTrigger value="daily" className='w-full'>
                        <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                        Encuentros del día
                      </TabsTrigger>
                    </Link>
                    <Link href="/por-fecha" className='flex-1'>
                      <TabsTrigger value="by-date" className='w-full'>
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        Por fecha
                      </TabsTrigger>
                    </Link>
                    <Link href="/por-liga" className='flex-1'>
                      <TabsTrigger value="by-league" className='w-full'>
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        Por liga
                      </TabsTrigger>
                    </Link>
                    <Link href="/por-favorito" className='flex-1'>
                      <TabsTrigger value="by-favorite" className='w-full'>
                        <Star className="mr-2 h-4 w-4 text-primary" />
                        Favorito
                      </TabsTrigger>
                    </Link>
                  </TabsList>
                  <div className="mt-4">
                    {children}
                  </div>
                </Tabs>
              </main>
              <footer className="w-full py-4 px-4 md:px-0 text-center text-xs text-muted-foreground space-y-4">
                <div>
                    <div className="mb-2">
                      <p className="inline">© 2025 Fútbol Stats Zone. Todos los derechos reservados.</p>
                      <Link href="/politica-de-privacidad" className="ml-4 underline hover:text-foreground">Política de Privacidad</Link>
                      <Link href="/terminos-y-condiciones" className="ml-4 underline hover:text-foreground">Términos y Condiciones</Link>
                    </div>
                    <p className="mb-2 font-semibold text-foreground">
                        Los valores mostrados son solo referencias estadísticas y no representan apuestas ni pagos.
                    </p>
                    <p className="mb-2">
                    Fútbol Stats Zone es un sitio independiente y no está afiliado, patrocinado ni autorizado por ninguna liga, federación, club o entidad oficial mencionada en este sitio.
                    </p>
                    <p className="mb-2">
                    Todos los nombres de equipos, competiciones y marcas comerciales que puedan aparecer son propiedad de sus respectivos titulares y se utilizan únicamente con fines descriptivos e informativos.
                    </p>
                    <p>
                    La información publicada en este sitio, incluyendo resultados y pronósticos, se ofrece únicamente con fines de entretenimiento y no constituye consejo de apuestas ni relación contractual alguna.
                    </p>
                </div>
                <div className="border-t border-border/50 pt-4">
                    <h3 className="font-semibold mb-2 text-sm">Información Regulatoria (Perú)</h3>
                    <div className="space-y-2">
                        <p>
                            <span className="font-semibold">BETSSON:</span> 18+ | SFTG Limited | RUC: 20612423371 | DOMICILIO FISCAL: MANUEL A. OLAECHEA 1470, OFICINA 201, DISTRITO DE MIRAFLORES, PROVINCIA Y DEPARTAMENTO DE LIMA | MINCETUR License #: 11002586010000 & 21002586010000.
                        </p>
                        <p>
                            <span className="font-semibold">INKABET:</span> 18+ | Lucky Torito S.A.C. | MINCETUR License #: 11002603010000 & 21002603010000.
                        </p>
                        <p className="italic">
                            "El juego y las apuestas deportivas a distancia realizados en exceso pueden causar ludopatía".
                        </p>
                    </div>
                </div>
              </footer>
            </div>
            <BetSlip />
            <Toaster />
          </BetSlipProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
