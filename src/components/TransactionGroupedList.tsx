import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, Clock, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";
import { usePreferences } from "@/contexts/PreferencesContext";
import { translateCategory } from "@/lib/categoryI18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

/** Mobile actions dropdown for a single transaction */
const MobileActions: React.FC<{
  tx: TransactionRow;
  isIncome: boolean;
  statusLabel: Record<string, string>;
  onEdit: (t: TransactionRow) => void;
  onRemove: (id: string) => void;
  onToggleStatus: (id: string, newStatus: "paid" | "pending") => void;
}> = ({ tx, isIncome, statusLabel, onEdit, onRemove, onToggleStatus }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors -mr-1">
        <MoreVertical className="w-4 h-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
      <DropdownMenuItem
        onClick={() => onToggleStatus(tx.id, tx.status === "paid" ? "pending" : "paid")}
        className="gap-2 text-xs"
      >
        {tx.status === "paid" ? (
          <><Clock className="w-3.5 h-3.5 text-fin-pending" /> {statusLabel.pending}</>
        ) : (
          <><Check className="w-3.5 h-3.5 text-fin-income" /> {statusLabel.paid}</>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(tx)} className="gap-2 text-xs">
        <Pencil className="w-3.5 h-3.5" /> Editar
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRemove(tx.id)} className="gap-2 text-xs text-fin-expense focus:text-fin-expense">
        <Trash2 className="w-3.5 h-3.5" /> Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const TransactionGroupedList: React.FC<GroupedListProps> = ({
  transactions, type, onEdit, onRemove, onToggleStatus,
}) => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { groups, singles } = useMemo(() => {
    const recurringMap: Record<string, TransactionRow[]> = {};
    const singleItems: TransactionRow[] = [];

    transactions.forEach(t => {
      if (t.entry_type === "recurring" || t.entry_type === "installment") {
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
  const statusLabel = {
    paid: isIncome ? t("txList.received") : t("txList.paid"),
    pending: t("txList.pending"),
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center bg-muted/50 px-3 md:px-6 py-3 border-b border-border/50">
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("txList.description")}</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block">{t("txList.category")}</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block text-center">{t("txList.status")}</span>
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">{t("txList.amount")}</span>
        <span className="w-8 md:w-16" />
      </div>

      {groups.length === 0 && singles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-16">
          {t("txList.noTransactions")}
        </p>
      )}

      {groups.map(g => (
        <div key={g.key} className="border-b border-border/50 last:border-b-0">
          <button
            onClick={() => toggle(g.key)}
            className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-3 md:px-6 py-3 md:py-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="min-w-0 pr-2 flex items-center gap-2">
              {expanded[g.key] ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{g.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                  <span>{g.entryType === "recurring"
                    ? `${t("txList.recurringMonthly").split(" (")[0]} ${g.frequency === "yearly" ? `(${t("form.yearly")})` : `(${t("form.monthly")})`}`
                    : t("txList.installment")}</span>
                  <span>· {g.items.length} {t("txList.installments")}</span>
                  <span>· {translateCategory(g.category, t)}</span>
                  <span className="inline-flex items-center gap-0.5">
                    <span className="text-fin-income">{g.paidCount}✓</span>
                    {g.pendingCount > 0 && <span className="text-fin-pending">{g.pendingCount}⏳</span>}
                  </span>
                </p>
              </div>
            </div>

            <span className="text-xs text-muted-foreground hidden md:block">{translateCategory(g.category, t)}</span>

            <div className="hidden md:flex justify-center px-2 gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fin-income/10 text-fin-income">
                {g.paidCount}✓
              </span>
              {g.pendingCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fin-pending/10 text-fin-pending">
                  {g.pendingCount}⏳
                </span>
              )}
            </div>

            <span className={cn(
              "font-mono-fin text-sm font-semibold text-right whitespace-nowrap",
              isIncome ? "text-fin-income" : "text-fin-expense"
            )}>
              {isIncome ? "+" : "−"} {formatBRL(g.totalAmount)}
            </span>

            <span className="w-16 hidden md:block" />
          </button>

          {expanded[g.key] && (
            <div className="bg-muted/20 border-t border-border/30">
              {g.items.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-3 md:px-6 pl-9 md:pl-14 py-2.5 border-b border-border/20 last:border-b-0 hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-foreground/80">
                      {g.entryType === "installment"
                        ? t("txList.installmentOf").replace("{current}", String(idx + 1)).replace("{total}", String(g.items.length))
                        : new Date(tx.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
                      <span>{new Date(tx.date).toLocaleDateString("pt-BR")}</span>
                      <span className="md:hidden">·
                        {tx.status === "paid" ? (
                          <span className="text-fin-income"> {statusLabel.paid}</span>
                        ) : (
                          <span className="text-fin-pending"> {statusLabel.pending}</span>
                        )}
                      </span>
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground hidden md:block" />

                  <div className="hidden md:flex justify-center px-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(tx.id, tx.status === "paid" ? "pending" : "paid");
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide cursor-pointer transition-all hover:scale-105",
                        tx.status === "paid"
                          ? "bg-fin-income/10 text-fin-income border border-fin-income/20 hover:bg-fin-income/20"
                          : "bg-fin-pending/10 text-fin-pending border border-fin-pending/20 hover:bg-fin-pending/20"
                      )}
                    >
                      {tx.status === "paid" ? (
                        <><Check className="w-3 h-3" /> {statusLabel.paid}</>
                      ) : (
                        <><Clock className="w-3 h-3" /> {statusLabel.pending}</>
                      )}
                    </button>
                  </div>

                  <span className={cn(
                    "font-mono-fin text-xs font-semibold text-right whitespace-nowrap",
                    isIncome ? "text-fin-income" : "text-fin-expense"
                  )}>
                    {isIncome ? "+" : "−"} {formatBRL(tx.amount)}
                  </span>

                  {/* Mobile actions */}
                  <MobileActions
                    tx={tx}
                    isIncome={isIncome}
                    statusLabel={statusLabel}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onToggleStatus={onToggleStatus}
                  />

                  {/* Desktop actions */}
                  <div className="hidden md:flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(tx)} className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => onRemove(tx.id)} className="p-1 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {singles.map(tx => (
        <div key={tx.id} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-3 md:px-6 py-3 md:py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors duration-150 group">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
              <span>{new Date(tx.date).toLocaleDateString("pt-BR")}</span>
              <span>· {translateCategory(tx.category, t)}</span>
              <span className="md:hidden">·
                {tx.status === "paid" ? (
                  <span className="text-fin-income"> {statusLabel.paid}</span>
                ) : (
                  <span className="text-fin-pending"> {statusLabel.pending}</span>
                )}
              </span>
            </p>
          </div>

          <span className="text-xs text-muted-foreground hidden md:block">{translateCategory(tx.category, t)}</span>

          <div className="hidden md:flex justify-center px-2">
            <button
              onClick={() => onToggleStatus(tx.id, tx.status === "paid" ? "pending" : "paid")}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide cursor-pointer transition-all hover:scale-105",
                tx.status === "paid"
                  ? "bg-fin-income/10 text-fin-income border border-fin-income/20"
                  : "bg-fin-pending/10 text-fin-pending border border-fin-pending/20"
              )}
            >
              {tx.status === "paid" ? (
                <><Check className="w-3 h-3" /> {statusLabel.paid}</>
              ) : (
                <><Clock className="w-3 h-3" /> {statusLabel.pending}</>
              )}
            </button>
          </div>

          <span className={cn(
            "font-mono-fin text-sm font-semibold text-right whitespace-nowrap",
            isIncome ? "text-fin-income" : "text-fin-expense"
          )}>
            {isIncome ? "+" : "−"} {formatBRL(tx.amount)}
          </span>

          {/* Mobile actions */}
          <MobileActions
            tx={tx}
            isIncome={isIncome}
            statusLabel={statusLabel}
            onEdit={onEdit}
            onRemove={onRemove}
            onToggleStatus={onToggleStatus}
          />

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(tx)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onRemove(tx.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
