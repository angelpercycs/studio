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

interface NagScreenProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const KOFI_LINK = "https://ko-fi.com/futbolstatszone";

export function NagScreen({ open, onClose, onAccept }: NagScreenProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    window.open(KOFI_LINK, '_blank');
    router.push('/reclamar-recompensa');
    onAccept();
  };

  const handleSecondaryAction = () => {
    onClose();
  };
  
  if (!open) return null;

  const content = {
    title: "Apoya a Fútbol Stats Zone",
    description: "Fútbol Stats Zone es un proyecto que se mantiene gracias a usuarios como tú. Tu apoyo nos ayuda a cubrir los costos y a seguir mejorando la plataforma. Si encuentras valor en nuestro trabajo, considera hacer una donación.",
    primaryActionText: "Apoyar con una donación",
    secondaryActionText: "Quizás más tarde"
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
