import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-suggests a category based on transaction description using AI.
 * Returns the suggested category and loading state.
 * onSuggest callback is called when a new suggestion arrives.
 */
export function useAutoCategory(
  description: string,
  type: 'income' | 'expense',
  onSuggest?: (category: string) => void,
) {
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastDescRef = useRef('');

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = description.trim();
    if (trimmed.length < 3 || trimmed === lastDescRef.current) {
      return;
    }

    timerRef.current = setTimeout(async () => {
      lastDescRef.current = trimmed;
      setSuggesting(true);
      try {
        const { data, error } = await supabase.functions.invoke('suggest-category', {
          body: { description: trimmed, type },
        });
        if (!error && data?.category) {
          setSuggested(data.category);
          onSuggest?.(data.category);
        }
      } catch {
        // silently fail
      } finally {
        setSuggesting(false);
      }
    }, 800); // debounce 800ms

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [description, type]);

  return { suggesting, suggested };
}
