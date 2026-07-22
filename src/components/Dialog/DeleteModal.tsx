"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type DeleteModalProps = {



  
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteModal({ open, onClose, onConfirm }: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Weet u het zeker?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Verwijderen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}