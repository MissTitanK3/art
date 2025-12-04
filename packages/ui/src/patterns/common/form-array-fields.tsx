import {
  type Control,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
  type Path,
  useFieldArray,
} from "react-hook-form";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { FormArrayCard } from "./form-array-card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/primitives/form";
import { Input } from "@workspace/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Textarea } from "@workspace/ui/primitives/textarea";
type SourceTypeOption = {
  value: string;
  label: string;
};
interface BaseArrayFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: React.ReactNode;
  description?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  addLabel?: React.ReactNode;
  removeLabel?: React.ReactNode;
}
export interface StringArrayFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends BaseArrayFieldProps<TFieldValues, TName> {
  placeholder?: string;
}
export function StringArrayField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  emptyMessage = "No entries added yet.",
  addLabel = "Add entry",
  removeLabel = "Remove",
  placeholder,
}: StringArrayFieldProps<TFieldValues, TName>) {
  const fieldArrayName = name as FieldArrayPath<TFieldValues>;
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>
  >({
    control,
    name: fieldArrayName,
  });
  return (
    <FormArrayCard
      label={label}
      description={description}
      addLabel={addLabel}
      onAdd={() => append("" as unknown as never)}
      emptyMessage={
        fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null
      }
    >
      {fields.map((fieldItem, index) => (
        <div key={fieldItem.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`${name}.${index}` as FieldPath<TFieldValues>}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    ref={field.ref}
                    name={field.name}
                    value={(field.value as string | undefined) ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder={placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="mt-1"
          >
            {removeLabel}
          </Button>
        </div>
      ))}
    </FormArrayCard>
  );
}
export interface ContactArrayFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends BaseArrayFieldProps<TFieldValues, TName> {
  namePlaceholder?: string;
  relationPlaceholder?: string;
  phonePlaceholder?: string;
  emailPlaceholder?: string;
  nameLabel?: React.ReactNode;
  relationLabel?: React.ReactNode;
  phoneLabel?: React.ReactNode;
  emailLabel?: React.ReactNode;
  badgeLabel?: (index: number) => React.ReactNode;
}
export function ContactArrayField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  emptyMessage = "No contacts recorded.",
  addLabel = "Add contact",
  removeLabel = "Remove",
  namePlaceholder = "Full name",
  relationPlaceholder = "Witness, family, dispatcher...",
  phonePlaceholder = "(555) 123-4567",
  emailPlaceholder = "name@example.org",
  nameLabel = "Name",
  relationLabel = "Relation",
  phoneLabel = "Phone",
  emailLabel = "Email",
  badgeLabel = (index) => `Contact ${index + 1}`,
}: ContactArrayFieldProps<TFieldValues, TName>) {
  const fieldArrayName = name as FieldArrayPath<TFieldValues>;
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>
  >({
    control,
    name: fieldArrayName,
  });
  return (
    <FormArrayCard
      label={label}
      description={description}
      addLabel={addLabel}
      onAdd={() =>
        append({
          name: "",
          phone: "",
          email: "",
          relation: "",
        } as unknown as never)
      }
      emptyMessage={
        fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null
      }
    >
      {fields.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <Badge variant="outline">{badgeLabel(index)}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              {removeLabel}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name={`${name}.${index}.name` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{nameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={namePlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.relation` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{relationLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={relationPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.phone` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{phoneLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={phonePlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.email` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{emailLabel}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={emailPlaceholder}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </FormArrayCard>
  );
}
export interface TransferArrayFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends BaseArrayFieldProps<TFieldValues, TName> {
  fromFacilityLabel?: React.ReactNode;
  toFacilityLabel?: React.ReactNode;
  transferDateLabel?: React.ReactNode;
  methodLabel?: React.ReactNode;
  fromFacilityPlaceholder?: string;
  toFacilityPlaceholder?: string;
  transferDatePlaceholder?: string;
  methodPlaceholder?: string;
  badgeLabel?: (index: number) => React.ReactNode;
}
export function TransferArrayField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  emptyMessage = "No transfers recorded.",
  addLabel = "Add transfer",
  removeLabel = "Remove",
  fromFacilityLabel = "From Facility",
  toFacilityLabel = "To Facility",
  transferDateLabel = "Transfer Date",
  methodLabel = "Method",
  fromFacilityPlaceholder = "Origin facility",
  toFacilityPlaceholder = "Destination facility",
  transferDatePlaceholder = "YYYY-MM-DD or ISO timestamp",
  methodPlaceholder = "Van, flight, unknown...",
  badgeLabel = (index) => `Transfer ${index + 1}`,
}: TransferArrayFieldProps<TFieldValues, TName>) {
  const fieldArrayName = name as FieldArrayPath<TFieldValues>;
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>
  >({
    control,
    name: fieldArrayName,
  });
  return (
    <FormArrayCard
      label={label}
      description={description}
      addLabel={addLabel}
      onAdd={() =>
        append({
          fromFacility: "",
          toFacility: "",
          transferDate: "",
          method: "",
        } as unknown as never)
      }
      emptyMessage={
        fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null
      }
    >
      {fields.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <Badge variant="outline">{badgeLabel(index)}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              {removeLabel}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name={`${name}.${index}.fromFacility` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fromFacilityLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={fromFacilityPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.toFacility` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{toFacilityLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={toFacilityPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.transferDate` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{transferDateLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={transferDatePlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.method` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{methodLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={methodPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </FormArrayCard>
  );
}
export interface InfoSourceArrayFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends BaseArrayFieldProps<TFieldValues, TName> {
  fieldLabel?: React.ReactNode;
  fieldPlaceholder?: string;
  sourceTypeLabel?: React.ReactNode;
  sourceTypePlaceholder?: string;
  sourceTypeOptions?: SourceTypeOption[];
  timestampLabel?: React.ReactNode;
  timestampPlaceholder?: string;
  confidenceLabel?: React.ReactNode;
  confidencePlaceholder?: string;
  confidenceHelpText?: React.ReactNode;
  detailsLabel?: React.ReactNode;
  detailsPlaceholder?: string;
  badgeLabel?: (index: number) => React.ReactNode;
  minConfidence?: number;
  maxConfidence?: number;
}
const defaultSourceTypes: SourceTypeOption[] = [
  { value: "witness", label: "Witness" },
  { value: "document", label: "Document" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];
export function InfoSourceArrayField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  emptyMessage = "No sources captured.",
  addLabel = "Add source",
  removeLabel = "Remove",
  fieldLabel = "Field",
  fieldPlaceholder = "Which field this applies to",
  sourceTypeLabel = "Source Type",
  sourceTypePlaceholder = "Select a source type",
  sourceTypeOptions = defaultSourceTypes,
  timestampLabel = "Timestamp",
  timestampPlaceholder = "ISO timestamp",
  confidenceLabel = "Confidence (1-5)",
  confidencePlaceholder = "1-5",
  confidenceHelpText,
  detailsLabel = "Details",
  detailsPlaceholder = "Summary or citation",
  badgeLabel = (index) => `Source ${index + 1}`,
  minConfidence = 1,
  maxConfidence = 5,
}: InfoSourceArrayFieldProps<TFieldValues, TName>) {
  const fieldArrayName = name as FieldArrayPath<TFieldValues>;
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>
  >({
    control,
    name: fieldArrayName,
  });
  const defaultSourceTypeValue =
    sourceTypeOptions.find((option) => option.value === "other")?.value ??
    sourceTypeOptions[0]?.value ??
    "other";
  return (
    <FormArrayCard
      label={label}
      description={description}
      addLabel={addLabel}
      onAdd={() =>
        append({
          field: "",
          sourceType: defaultSourceTypeValue,
          details: "",
          timestamp: "",
          confidence: undefined,
        } as unknown as never)
      }
      emptyMessage={
        fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null
      }
    >
      {fields.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <Badge variant="outline">{badgeLabel(index)}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              {removeLabel}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name={`${name}.${index}.field` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={fieldPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.sourceType` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{sourceTypeLabel}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? defaultSourceTypeValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={sourceTypePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.timestamp` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{timestampLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={timestampPlaceholder} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.confidence` as FieldPath<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{confidenceLabel}</FormLabel>
                  {confidenceHelpText ? (
                    <FormDescription>{confidenceHelpText}</FormDescription>
                  ) : null}
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={minConfidence}
                      max={maxConfidence}
                      step={1}
                      placeholder={confidencePlaceholder}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`${name}.${index}.details` as FieldPath<TFieldValues>}
            render={({ field }) => (
              <FormItem className="pt-3">
                <FormLabel>{detailsLabel}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={detailsPlaceholder}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </FormArrayCard>
  );
}
