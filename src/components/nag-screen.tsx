'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase/hooks";

interface NagScreenProps {
  open: boolean;
  step: 'donation' | 'share';
  onDeclineDonation: () => void;
  onFinalClose: () => void;
  onAccept: () => void;
}

const KOFI_LINK = "https://ko-fi.com/futbolstatszone";

export function NagScreen({ open, step, onDeclineDonation, onFinalClose, onAccept }: NagScreenProps) {
  const { user } = useUser();
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (step === 'donation') {
        window.open(KOFI_LINK, '_blank');
        router.push('/reclamar-recompensa');
    } else {
        router.push('/login');
    }
    onAccept();
  };

  const handleSecondaryAction = () => {
    if (step === 'donation') {
        onDeclineDonation();
    } else {
        onFinalClose();
    }
  };
  
  if (!open) return null;

  const donationContent = {
    title: "¿Cansado de los anuncios? Apóyanos.",
    description: "Fútbol Stats Zone se mantiene gracias a usuarios como tú. Con una donación (desde $3), puedes obtener un mes sin publicidad. Importante: Después de donar, ve a 'Reclamar Recompensa' para activar tu mes premium.",
    primaryActionText: "Donar y quitar anuncios",
    secondaryActionText: "No, gracias"
  };

  const shareContent = {
    title: "Una alternativa gratis para ganar",
    description: "Entendido. Si no deseas donar, hay otra forma de apoyar y obtener beneficios: regístrate e inicia sesión. Luego, al compartir uno de nuestros pronósticos, obtendrás 24 horas sin anuncios. ¡Es gratis y nos ayudas a crecer!",
    primaryActionText: "Entendido, ¡voy a registrarme!",
    secondaryActionText: "Cerrar"
  };

  const content = step === 'donation' ? donationContent : shareContent;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onFinalClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
            <Button onClick={handlePrimaryAction} size="lg" className="w-full">
              {content.primaryActionText}
            </Button>
            <Button onClick={handleSecondaryAction} variant="link" className="text-muted-foreground">
              {content.secondaryActionText}
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
