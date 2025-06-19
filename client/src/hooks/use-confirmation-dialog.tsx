// src/hooks/use-confirmation-dialog.tsx
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmationDialog = () => {
  const [dialogProps, setDialogProps] = useState<ConfirmationDialogProps | null>(null);

  const confirm = (props: ConfirmationDialogProps) => {
    setDialogProps(props);
  };

  const ConfirmationDialog = dialogProps ? (
    <AlertDialog open={!!dialogProps} onOpenChange={() => setDialogProps(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogProps.title}</AlertDialogTitle>
          <AlertDialogDescription>{dialogProps.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dialogProps.cancelText || "Batal"}</AlertDialogCancel>
          <AlertDialogAction onClick={dialogProps.onConfirm} asChild>
             <Button variant={dialogProps.title.toLowerCase().includes("logout") ? "destructive" : "default"}>
                {dialogProps.confirmText || "Konfirmasi"}
             </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  return { ConfirmationDialog, confirm };
};