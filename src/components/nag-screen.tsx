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
  onClose: (declined: boolean) => void;
}

const KOFI_LINK = "https://ko-fi.com/futbolstatszone";

export function NagScreen({ open, onClose }: NagScreenProps) {
  const { user } = useUser();
  const router = useRouter();

  const handleDonateClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      window.open(KOFI_LINK, '_blank');
    }
    onClose(false);
  };

  const handleDeclineClick = () => {
    onClose(true);
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleDeclineClick()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cansado de los anuncios? Apóyanos.</AlertDialogTitle>
          <AlertDialogDescription>
            Fútbol Stats Zone se mantiene gracias a usuarios como tú. Si te registras y haces una donación (desde 1 dólar), desactivaremos TODA la publicidad de tu cuenta durante un mes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
            <Button onClick={handleDonateClick} size="lg" className="w-full">
              Registrarme / Donar y quitar anuncios
            </Button>
            <Button onClick={handleDeclineClick} variant="link" className="text-muted-foreground">
              No, gracias. Continuaré con anuncios.
            </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
