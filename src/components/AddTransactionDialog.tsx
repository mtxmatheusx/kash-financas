import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  TransactionType, AppMode,
  PERSONAL_EXPENSE_CATEGORIES, PERSONAL_INCOME_CATEGORIES,
  BUSINESS_EXPENSE_CATEGORIES, BUSINESS_INCOME_CATEGORIES,
} from '@/lib/types';

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  mode: AppMode;
  onAdd: (data: { type: TransactionType; amount: number; category: string; mode: AppMode; date: string }) => void;
}

export function AddTransactionDialog({ open, onClose, mode, onAdd }: AddTransactionDialogProps) {
  const [step, setStep] = useState<'amount' | 'category'>('amount');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');

  const resetAndClose = () => {
    setStep('amount');
    setType('expense');
    setAmount('');
    onClose();
  };

  const handleAmountConfirm = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) return;
    setStep('category');
  };

  const handleCategorySelect = (category: string) => {
    const value = parseFloat(amount.replace(',', '.'));
    onAdd({
      type,
      amount: value,
      category,
      mode,
      date: new Date().toISOString(),
    });
    resetAndClose();
  };

  const categories = type === 'expense'
    ? (mode === 'personal' ? PERSONAL_EXPENSE_CATEGORIES : BUSINESS_EXPENSE_CATEGORIES)
    : (mode === 'personal' ? PERSONAL_INCOME_CATEGORIES : BUSINESS_INCOME_CATEGORIES);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md bg-background border-border p-0 gap-0">
        <VisuallyHidden><DialogTitle>Adicionar transação</DialogTitle></VisuallyHidden>

        {step === 'amount' && (
          <div className="p-8 flex flex-col items-center animate-fade-in">
            {/* Type toggle */}
            <div className="flex gap-1 bg-card rounded-lg p-1 mb-8">
              <button
                onClick={() => setType('expense')}
                className={`px-5 py-2 rounded-md text-sm font-display font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Saída
              </button>
              <button
                onClick={() => setType('income')}
                className={`px-5 py-2 rounded-md text-sm font-display font-medium transition-all ${
                  type === 'income'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                Entrada
              </button>
            </div>

            {/* Amount input */}
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Valor</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-2xl font-display text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleAmountConfirm()}
                placeholder="0,00"
                className="text-5xl font-display font-bold bg-transparent border-none outline-none text-center w-48 text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            <button
              onClick={handleAmountConfirm}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display font-medium text-base hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              Confirmar
            </button>
          </div>
        )}

        {step === 'category' && (
          <div className="p-8 animate-slide-up">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 text-center">
              {type === 'expense' ? 'Categoria da despesa' : 'Origem da receita'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="py-3.5 px-4 rounded-lg bg-card text-card-foreground font-display text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors active:scale-[0.97] text-left"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
