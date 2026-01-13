import { MyPredictions } from "@/components/my-predictions";
import { type Metadata } from 'next'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis Pronósticos Guardados - Fútbol Stats Zone',
  description: 'Revisa tu historial de pronósticos combinados y analiza tu rendimiento.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function MisPronosticosPage() {
    return <MyPredictions />;
}
