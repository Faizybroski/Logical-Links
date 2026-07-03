"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Control, UseFormReturn } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { LineItem, LineItemCategory } from "@/types/api.types";
import { LINE_ITEM_CATEGORY_LABELS } from "@/types/api.types";

// ── Schema ─────────────────────────────────────────────────────────────────────

const LINE_ITEM_CATEGORIES = Object.keys(LINE_ITEM_CATEGORY_LABELS) as LineItemCategory[];

const rowSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Maximum 500 characters")
    .refine((v) => v.trim().length >= 3, "Minimum 3 characters"),
  category:   z.enum(LINE_ITEM_CATEGORIES as [LineItemCategory, ...LineItemCategory[]]),
  quantity:   z.number().gt(0, "Must be greater than 0").finite("Must be a valid number"),
  unit:       z.string().min(1, "Unit is required").max(50, "Too long"),
  unit_price: z.number().gte(0, "Must be 0 or greater").finite("Must be a valid number"),
  amount:     z.number(),
  notes:      z.string().max(500, "Maximum 500 characters").optional().nullable(),
  sort_order: z.number(),
});

const formSchema = z.object({
  items: z.array(rowSchema).min(1, "At least one line item is required before saving"),
});

type FormSchema = z.infer<typeof formSchema>;
type FormItem   = Omit<LineItem, "id" | "created_at" | "updated_at">;

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = Object.entries(LINE_ITEM_CATEGORY_LABELS) as [LineItemCategory, string][];

const BLANK_ITEM = (sortOrder = 0): FormItem => ({
  description: "",
  category:    "miscellaneous",
  quantity:    1,
  unit:        "unit",
  unit_price:  0,
  amount:      0,
  sort_order:  sortOrder,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(n);
}

// ── Sortable row ───────────────────────────────────────────────────────────────

interface RowProps {
  control:       Control<FormSchema>;
  index:         number;
  fieldId:       string;
  readOnly:      boolean;
  item:          FormItem;
  onDuplicate:   (i: number) => void;
  onDelete:      (i: number) => void;
  isDragOverlay?: boolean;
  getValues:     UseFormReturn<FormSchema>["getValues"];
  setValue:      UseFormReturn<FormSchema>["setValue"];
}

function SortableRow({
  control, index, fieldId, readOnly, item, onDuplicate, onDelete,
  isDragOverlay, getValues, setValue,
}: RowProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: fieldId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  function recalcAmount(changed: "quantity" | "unit_price", val: number) {
    const qty   = changed === "quantity"   ? val : getValues(`items.${index}.quantity`);
    const price = changed === "unit_price" ? val : getValues(`items.${index}.unit_price`);
    setValue(`items.${index}.amount`, Math.round(qty * price * 100) / 100, { shouldDirty: true });
  }

  const labelCls = "text-[10px] font-semibold uppercase tracking-wide text-muted";
  const inputCls = (hasError?: boolean) =>
    cn(
      "h-9 w-full min-w-0 bg-background px-2.5 text-sm transition-colors",
      hasError && "border-danger focus:border-danger focus-visible:ring-danger/20",
    );

  return (
    // eslint-disable-next-line react/forbid-dom-props -- dnd-kit requires inline transform/transition for drag animations
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-t border-card-border",
        isDragging     ? "opacity-40"   : "opacity-100",
        isDragOverlay  ? "rounded-xl shadow-xl bg-card ring-2 ring-primary/20" : "",
        !readOnly && !isDragging && !isDragOverlay ? "hover:bg-primary/[0.02]" : "",
        index % 2 === 1 && readOnly ? "bg-muted/20" : "",
      )}
    >
      <div className="px-4 py-3">
        {/* ── Row 1: drag handle · description · actions ── */}
        <div className="flex items-start gap-2">
          <span
            {...(readOnly ? {} : { ...attributes, ...listeners })}
            className={cn(
              "mt-2.5 flex shrink-0 items-center justify-center",
              readOnly
                ? "cursor-default text-muted-light/20"
                : "cursor-grab active:cursor-grabbing text-muted-light hover:text-primary",
            )}
          >
            <GripVertical className="h-4 w-4" />
          </span>

          {/* Description */}
          <div className="flex-1 min-w-0">
            {readOnly ? (
              <p className={cn("text-sm font-medium text-foreground leading-snug py-2",
                !item.description && "text-muted-light italic")}>
                {item.description || "No description"}
              </p>
            ) : (
              <FormField
                control={control}
                name={`items.${index}.description`}
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-0.5">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Describe the charge or service…"
                        className={inputCls(!!fieldState.error)}
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Action buttons */}
          {!readOnly && (
            <div className="flex shrink-0 items-center gap-0.5 mt-0.5">
              <Button
                type="button" variant="ghost" size="icon"
                className="h-8 w-8 text-muted-light hover:text-primary hover:bg-primary/5 rounded-lg"
                onClick={() => onDuplicate(index)} title="Duplicate row"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button" variant="ghost" size="icon"
                className="h-8 w-8 text-muted-light hover:text-red-500 rounded-lg"
                onClick={() => onDelete(index)} title="Delete row"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* ── Row 2: category · qty · unit · unit price · amount ── */}
        <div className={cn(readOnly ? "" : "mt-2 ml-6 grid grid-cols-2 gap-2 min-w-0 sm:flex sm:flex-wrap", "col-span-2 sm:col-span-1")}>

          {/* Category */}
          {readOnly ? (
            <div>
              <p className={labelCls}>Category</p>
              <p className="text-xs text-foreground mt-0.5">{LINE_ITEM_CATEGORY_LABELS[item.category]}</p>
            </div>
          ) : (
            <FormField
              control={control}
              name={`items.${index}.category`}
              render={({ field, fieldState }) => (
                <FormItem className="col-span-2 space-y-0.5 sm:col-span-1">
                  <span className={labelCls}>Category</span>
                  <SearchableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    options={CATEGORIES.map(([val, label]) => ({ value: val, label }))}
                    searchPlaceholder="Search category…"
                    className={cn("h-9 text-xs", fieldState.error && "border-destructive")}
                  />
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          )}

          {/* Qty */}
          {readOnly ? (
            <div>
              <p className={labelCls}>Qty</p>
              <p className="text-sm font-medium tabular-nums mt-0.5">{item.quantity}</p>
            </div>
          ) : (
            <FormField
              control={control}
              name={`items.${index}.quantity`}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-0.5">
                  <span className={labelCls}>Qty</span>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={field.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        field.onChange(val);
                        recalcAmount("quantity", val);
                      }}
                      onBlur={field.onBlur}
                      className={inputCls(!!fieldState.error)}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          )}

          {/* Unit */}
          {readOnly ? (
            <div>
              <p className={labelCls}>Unit</p>
              <p className="text-xs text-muted mt-0.5">{item.unit}</p>
            </div>
          ) : (
            <FormField
              control={control}
              name={`items.${index}.unit`}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-0.5">
                  <span className={labelCls}>Unit</span>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. hrs"
                      className={inputCls(!!fieldState.error)}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          )}

          {/* Unit Price */}
          {readOnly ? (
            <div>
              <p className={labelCls}>Unit Price</p>
              <p className="text-sm font-medium tabular-nums mt-0.5">{fmt(item.unit_price)}</p>
            </div>
          ) : (
            <FormField
              control={control}
              name={`items.${index}.unit_price`}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-0.5">
                  <span className={labelCls}>Unit Price</span>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={field.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        field.onChange(val);
                        recalcAmount("unit_price", val);
                      }}
                      onBlur={field.onBlur}
                      className={cn(inputCls(!!fieldState.error), "text-right")}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          )}

          {/* Amount — always read-only */}
          <div className={cn(readOnly ? "" : "col-span-2 flex flex-col gap-0.5 sm:col-span-1")}>
            {!readOnly && <span className={labelCls}>Amount</span>}
            <div className={cn("flex items-center rounded-xl px-3", readOnly ? "mt-0.5" : "h-9 bg-primary/5")}>
              {readOnly ? (
                <div>
                  <p className={labelCls}>Amount</p>
                  <p className="text-sm font-bold tabular-nums text-primary mt-0.5">{fmt(item.amount)}</p>
                </div>
              ) : (
                <span className="text-sm font-bold tabular-nums text-primary w-full text-right">
                  {fmt(item.amount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Public handle & props ──────────────────────────────────────────────────────

export interface LineItemsTableHandle {
  /** Triggers full validation on all rows. Returns true if all rows are valid. */
  validate: () => Promise<boolean>;
  /** Focuses and scrolls to the first invalid field after a failed validate() call. */
  focusFirstError: () => void;
}

export interface LineItemsTableProps {
  items:    FormItem[];
  onChange: (items: FormItem[]) => void;
  readOnly?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────────

export const LineItemsTable = forwardRef<LineItemsTableHandle, LineItemsTableProps>(
  function LineItemsTable({ items, onChange, readOnly = false }, ref) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const form = useForm<FormSchema>({
      resolver: zodResolver(formSchema),
      defaultValues: { items: items ?? [] },
      mode: "onTouched",
    });

    const { fields, append, remove, move } = useFieldArray({
      control: form.control,
      name: "items",
    });

    useImperativeHandle(ref, () => ({
      validate: () => form.trigger("items"),
      focusFirstError: () => {
        const errors = form.formState.errors.items;
        if (!errors) return;

        if (Array.isArray(errors)) {
          // Row-level errors — find the first row with an error
          for (let i = 0; i < errors.length; i++) {
            const rowErr = errors[i] as Record<string, unknown> | undefined;
            if (!rowErr) continue;
            const field = (["description", "quantity", "unit", "unit_price"] as const).find(
              (f) => rowErr[f],
            );
            if (field) {
              form.setFocus(`items.${i}.${field}`);
              setTimeout(() => {
                document.activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 50);
              return;
            }
          }
        } else {
          // Collection-level error (e.g. min(1)) — scroll to the table
          const tableEl = document.querySelector("[data-testid='line-items-table']");
          tableEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    }));

    // Keep stable ref to onChange so the subscription doesn't need to resubscribe
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Sync form state up to the parent (for subtotal calculations)
    useEffect(() => {
      const subscription = form.watch((values) => {
        onChangeRef.current((values.items as FormItem[]) ?? []);
      });
      return () => subscription.unsubscribe();
    }, [form]);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function addRow() {
      append({ ...BLANK_ITEM(fields.length) });
    }

    function duplicateRow(i: number) {
      const item = form.getValues(`items.${i}`);
      append({ ...item, sort_order: fields.length });
    }

    function removeRow(i: number) {
      remove(i);
    }

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      move(oldIndex, newIndex);
      // Keep sort_order consistent with array positions after reorder
      const current = form.getValues("items");
      arrayMove(current, oldIndex, newIndex).forEach((_, i) => {
        form.setValue(`items.${i}.sort_order`, i, { shouldDirty: false, shouldValidate: false });
      });
    }

    const watchedItems = form.watch("items") ?? [];
    const subtotal     = watchedItems.reduce((s, it) => s + (it?.amount ?? 0), 0);
    const hasErrors    = !!form.formState.errors.items;
    const activeIndex  = activeId ? fields.findIndex((f) => f.id === activeId) : -1;

    // Collection-level error (min(1) — no items)
    const itemsErr = form.formState.errors.items;
    const collectionError =
      !Array.isArray(itemsErr) && (itemsErr as { message?: string } | undefined)?.message
        ? (itemsErr as { message: string }).message
        : null;

    return (
      <Form {...form}>
        <div
          data-testid="line-items-table"
          className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm"
        >

          {/* Header */}
          <div className="border-b border-card-border bg-primary px-4 py-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar">Line Items</p>
            {!readOnly && hasErrors && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-200">
                <AlertCircle className="h-3 w-3" />
                Fix errors to save
              </span>
            )}
          </div>

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl",
                collectionError ? "bg-destructive/10" : "bg-primary/5",
              )}>
                <Plus className={cn("h-6 w-6", collectionError ? "text-destructive/60" : "text-primary/50")} />
              </div>
              <p className="text-sm font-medium text-foreground">No line items yet</p>
              {collectionError ? (
                <p className="mt-1.5 text-xs font-medium text-destructive">{collectionError}</p>
              ) : !readOnly && (
                <p className="mt-1 text-xs text-muted">
                  Click &ldquo;Add Item&rdquo; below to add freight charges, fees, or other items.
                </p>
              )}
            </div>
          )}

          {/* Rows */}
          {readOnly ? (
            fields.map((field, idx) => (
              <SortableRow
                key={field.id}
                control={form.control}
                index={idx}
                fieldId={field.id}
                readOnly
                item={watchedItems[idx] ?? BLANK_ITEM()}
                onDuplicate={() => {}}
                onDelete={() => {}}
                getValues={form.getValues}
                setValue={form.setValue}
              />
            ))
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
              onDragStart={(e) => setActiveId(String(e.active.id))}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field, idx) => (
                  <SortableRow
                    key={field.id}
                    control={form.control}
                    index={idx}
                    fieldId={field.id}
                    readOnly={false}
                    item={watchedItems[idx] ?? BLANK_ITEM()}
                    onDuplicate={duplicateRow}
                    onDelete={removeRow}
                    getValues={form.getValues}
                    setValue={form.setValue}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeIndex >= 0 && (
                  <SortableRow
                    control={form.control}
                    index={activeIndex}
                    fieldId={fields[activeIndex]?.id ?? "overlay"}
                    readOnly={false}
                    item={watchedItems[activeIndex] ?? BLANK_ITEM()}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                    isDragOverlay
                    getValues={form.getValues}
                    setValue={form.setValue}
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border bg-muted/20 px-4 py-3">
            {readOnly ? (
              <span />
            ) : (
              <Button
                type="button" variant="ghost" size="sm" onClick={addRow}
                className="h-8 gap-1.5 rounded-lg text-xs text-primary hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Subtotal</span>
              <span className="text-sm font-bold tabular-nums text-foreground">{fmt(subtotal)}</span>
            </div>
          </div>
        </div>
      </Form>
    );
  },
);
