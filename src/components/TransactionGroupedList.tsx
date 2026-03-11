import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface GroupedListProps {
  transactions: TransactionRow[];
  type: "income" | "expense";
  onEdit: (t: TransactionRow) => void;
  onRemove: (id: string) => void;
  onToggleStatus: (id: string, newStatus: "paid" | "pending") => void;
}

interface Group {
  key: string;
  description: string;
  category: string;
  entryType: string;
  frequency?: string;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  items: TransactionRow[];
}

export const TransactionGroupedList: React.FC<GroupedListProps> = ({
  transactions, type, onEdit, onRemove, onToggleStatus,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { groups, singles } = useMemo(() => {
    const recurringMap: Record<string, TransactionRow[]> = {};
    const singleItems: TransactionRow[] = [];

    transactions.forEach(t => {
      if (t.entry_type === "recurring" || t.entry_type === "installment") {
        // Group by description + category + entry_type
        const key = `${t.description}__${t.category}__${t.entry_type}`;
        if (!recurringMap[key]) recurringMap[key] = [];
        recurringMap[key].push(t);
      } else {
        singleItems.push(t);
      }
    });

    const groupList: Group[] = Object.entries(recurringMap).map(([key, items]) => {
      const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
      const first = sorted[0];
      return {
        key,
        description: first.description.replace(/ \(\d+\/\d+\)$/, ""),
        category: first.category,
        entryType: first.entry_type || "recurring",
        frequency: first.frequency || "monthly",
        totalAmount: sorted.reduce((s, t) => s + t.amount, 0),
        paidCount: sorted.filter(t => t.status === "paid").length,
        pendingCount: sorted.filter(t => t.status === "pending").length,
        items: sorted,
      };
    });

    groupList.sort((a, b) => {
      const aDate = a.items[0]?.date || "";
      const bDate = b.items[0]?.date || "";
      return bDate.localeCompare(aDate);
    });

    return { groups: groupList, singles: singleItems };
  }, [transactions]);

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const isIncome = type === "income";
  const statusLabel = isIncome
    ? { paid: "Recebido", pending: "Pendente" }
    : { paid: "Pago", pending: "Pendente" };

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center bg-muted/50 px-4 md:px-6 py-3 border-b border-border/50">
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block">Categoria</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Status</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Valor</span>
        <span className="w-16" />
      </div>

      {groups.length === 0 && singles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-16">
          Nenhum lançamento registrado
        </p>
      )}

      {/* Grouped recurring/installment */}
      {groups.map(g => (
        <div key={g.key} className="border-b border-border/50 last:border-b-0">
          {/* Group header - clickable */}
          <button
            onClick={() => toggle(g.key)}
            className="w-full grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-4 md:px-6 py-3.5 md:py-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="min-w-0 pr-3 flex items-center gap-2">
              {expanded[g.key] ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{g.description}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {g.entryType === "recurring"
                    ? `Recorrente ${g.frequency === "yearly" ? "(Anual)" : "(Mensal)"}`
                    : `Parcelado`}
                  {" · "}{g.items.length} parcelas
                  <span className="md:hidden"> · {g.category}</span>
                </p>
              </div>
            </div>

            <span className="text-xs text-muted-foreground hidden md:block">{g.category}</span>

            <div className="flex justify-center px-2 gap-1.5">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
                isIncome
                  ? "bg-fin-income/10 text-fin-income"
                  : "bg-fin-income/10 text-fin-income"
              )}>
                {g.paidCount}✓
              </span>
              {g.pendingCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fin-pending/10 text-fin-pending">
                  {g.pendingCount}⏳
                </span>
              )}
            </div>

            <span className={cn(
              "font-mono-fin text-sm font-semibold text-right pl-3 whitespace-nowrap",
              isIncome ? "text-fin-income" : "text-fin-expense"
            )}>
              {isIncome ? "+" : "−"} {formatBRL(g.totalAmount)}
            </span>

            <span className="w-16" />
          </button>

          {/* Expanded items */}
          {expanded[g.key] && (
            <div className="bg-muted/20 border-t border-border/30">
              {g.items.map((t, idx) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-4 md:px-6 pl-10 md:pl-14 py-2.5 border-b border-border/20 last:border-b-0 hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-medium text-foreground/80">
                      {g.entryType === "installment"
                        ? `Parcela ${idx + 1}/${g.items.length}`
                        : new Date(t.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground hidden md:block" />

                  <div className="flex justify-center px-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(t.id, t.status === "paid" ? "pending" : "paid");
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide cursor-pointer transition-all hover:scale-105",
                        t.status === "paid"
                          ? isIncome
                            ? "bg-fin-income/10 text-fin-income border border-fin-income/20 hover:bg-fin-income/20"
                            : "bg-fin-income/10 text-fin-income border border-fin-income/20 hover:bg-fin-income/20"
                          : "bg-fin-pending/10 text-fin-pending border border-fin-pending/20 hover:bg-fin-pending/20"
                      )}
                    >
                      {t.status === "paid" ? (
                        <><Check className="w-3 h-3" /> {statusLabel.paid}</>
                      ) : (
                        <><Clock className="w-3 h-3" /> {statusLabel.pending}</>
                      )}
                    </button>
                  </div>

                  <span className={cn(
                    "font-mono-fin text-xs font-semibold text-right pl-3 whitespace-nowrap",
                    isIncome ? "text-fin-income" : "text-fin-expense"
                  )}>
                    {isIncome ? "+" : "−"} {formatBRL(t.amount)}
                  </span>

                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(t)} className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => onRemove(t.id)} className="p-1 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Single transactions */}
      {singles.map(t => (
        <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-4 md:px-6 py-3.5 md:py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors duration-150 group">
          <div className="min-w-0 pr-3">
            <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {new Date(t.date).toLocaleDateString("pt-BR")}
              <span className="md:hidden"> · {t.category}</span>
            </p>
          </div>

          <span className="text-xs text-muted-foreground hidden md:block">{t.category}</span>

          <div className="flex justify-center px-2">
            <button
              onClick={() => onToggleStatus(t.id, t.status === "paid" ? "pending" : "paid")}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide cursor-pointer transition-all hover:scale-105",
                t.status === "paid"
                  ? isIncome
                    ? "bg-fin-income/10 text-fin-income border border-fin-income/20"
                    : "bg-fin-income/10 text-fin-income border border-fin-income/20"
                  : "bg-fin-pending/10 text-fin-pending border border-fin-pending/20"
              )}
            >
              {t.status === "paid" ? (
                <><Check className="w-3 h-3" /> {statusLabel.paid}</>
              ) : (
                <><Clock className="w-3 h-3" /> {statusLabel.pending}</>
              )}
            </button>
          </div>

          <span className={cn(
            "font-mono-fin text-sm font-semibold text-right pl-3 whitespace-nowrap",
            isIncome ? "text-fin-income" : "text-fin-expense"
          )}>
            {isIncome ? "+" : "−"} {formatBRL(t.amount)}
          </span>

          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(t)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onRemove(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
