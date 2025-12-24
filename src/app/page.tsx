import { DailyMatches } from '@/components/daily-matches';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/partidos/hoy');
  return null;
}
