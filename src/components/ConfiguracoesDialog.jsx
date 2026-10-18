import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ConfiguracoesDialog({ titulo = "Configurações", descricao = "Ajuste suas preferências.", children, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={titulo} title={titulo}><Settings className="w-5 h-5" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90dvh]">
        <DialogHeader className="text-left pr-7">
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
