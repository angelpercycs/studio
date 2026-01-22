import { ClaimRewardForm } from '@/components/claim-reward-form';
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reclamar Recompensa - Fútbol Stats Zone',
  description: 'Reclama tu mes sin anuncios después de hacer una donación.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function ClaimRewardPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <ClaimRewardForm />
        </div>
    );
}
