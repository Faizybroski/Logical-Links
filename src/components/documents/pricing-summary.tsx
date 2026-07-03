"use client";

interface Props {
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  total: number;
  currency?: string;
  amountPaid?: number;
  balanceDue?: number;
  onDiscountChange?: (v: number) => void;
  onTaxRateChange?: (v: number) => void;
  onAmountPaidChange?: (v: number) => void;
  readOnly?: boolean;
}

function fmt(n: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(
    n,
  );
}

export function PricingSummary({
  subtotal,
  discount,
  taxRate,
  tax,
  total,
  currency = "AUD",
  amountPaid,
  balanceDue,
  onDiscountChange,
  onTaxRateChange,
  onAmountPaidChange,
  readOnly = false,
}: Props) {
  return (
    /* Full-width on mobile, right-aligned fixed-width on sm+ */
    <div className="w-full sm:flex sm:justify-end">
      <div className="w-full overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="border-b border-card-border px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
            Totals
          </p>
        </div>

        <div className="px-5 py-4 space-y-0">
          {/* Subtotal */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Subtotal</span>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {fmt(subtotal, currency)}
            </span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Discount</span>
            {readOnly ? (
              <span className="text-sm font-medium tabular-nums text-foreground">
                {discount > 0 ? `− ${fmt(discount, currency)}` : "—"}
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">AUD</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) =>
                    onDiscountChange?.(parseFloat(e.target.value) || 0)
                  }
                  title="Discount amount"
                  placeholder="0.00"
                  className="w-28 rounded-lg border border-card-border bg-background px-2.5 py-1.5 text-right text-sm tabular-nums focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">
              {readOnly ? `Tax (${Math.round(taxRate * 100)}%)` : "Tax"}
            </span>
            {readOnly ? (
              <span className="text-sm font-medium tabular-nums text-foreground">
                {fmt(tax, currency)}
              </span>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={(taxRate * 100).toFixed(2)}
                    onChange={(e) =>
                      onTaxRateChange?.((Number(e.target.value) || 0) / 100)
                    }
                    title="Tax rate percentage"
                    placeholder="0.00"
                    className="h-11 w-28 rounded-xl border border-card-border bg-background px-3 pr-8 text-right text-sm font-medium tabular-nums text-foreground shadow-sm transition-all placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">
                    %
                  </span>
                </div>

                <span className="min-w-[110px] text-right text-sm font-semibold tabular-nums text-foreground">
                  {fmt(tax, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-primary/20 mt-1 pt-3 pb-1">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-base font-bold text-primary tabular-nums">
              {fmt(total, currency)}
            </span>
          </div>

          {/* Invoice-only: amount paid + balance due */}
          {amountPaid !== undefined && (
            <>
              <div className="flex items-center justify-between border-t border-card-border pt-3 pb-2 mt-1">
                <span className="text-sm text-muted">Amount Paid</span>
                {readOnly ? (
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {fmt(amountPaid, currency)}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted">AUD</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) =>
                        onAmountPaidChange?.(parseFloat(e.target.value) || 0)
                      }
                      title="Amount paid"
                      placeholder="0.00"
                      className="w-28 rounded-lg border border-card-border bg-background px-2.5 py-1.5 text-right text-sm tabular-nums focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>
              <div
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 mt-1 ${(balanceDue ?? 0) > 0 ? "bg-danger/5" : "bg-green-500/5"}`}
              >
                <span className="text-sm font-bold text-foreground">
                  Balance Due
                </span>
                <span
                  className={`text-base font-bold tabular-nums ${(balanceDue ?? 0) > 0 ? "text-danger" : "text-green-600"}`}
                >
                  {fmt(balanceDue ?? 0, currency)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
