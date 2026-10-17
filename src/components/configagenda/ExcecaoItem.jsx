import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatData } from "@/lib/helpers";

export default function ExcecaoItem({ excecao, onRemover }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{formatData(excecao.data)}</p>
        <p className="text-sm text-muted-foreground truncate">{excecao.motivo || "Estúdio fechado"}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemover(excecao.id)}
        aria-label="Remover exceção"
      >
        <Trash2 className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}