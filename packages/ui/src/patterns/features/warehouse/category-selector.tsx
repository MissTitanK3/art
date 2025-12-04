import { ControllerRenderProps } from "react-hook-form";
import {
  FormControl,
  FormDescription,
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
import { humanize } from "@workspace/ui/lib/utils";
import { InventoryIntakeValues } from "./types";

interface CategorySelectorProps {
  field: ControllerRenderProps<InventoryIntakeValues, "category">;
  availableCategories: string[];
}

export function CategorySelector({
  field,
  availableCategories,
}: CategorySelectorProps) {
  const isCustomCategory =
    field.value && !availableCategories.includes(field.value.toLowerCase());
  const selectValue = isCustomCategory
    ? "__custom__"
    : field.value?.toLowerCase() || "";

  return (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select
        value={selectValue}
        onValueChange={(value) => {
          if (value === "__custom__") {
            // Clear the field to show the input
            field.onChange("");
          } else {
            field.onChange(value);
          }
        }}
      >
        <FormControl>
          <SelectTrigger className="w-full min-h-[44px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-64">
          {availableCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {humanize(category)}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">+ Create new category...</SelectItem>
        </SelectContent>
      </Select>
      {(field.value === "" || isCustomCategory) && (
        <FormControl>
          <Input
            placeholder="Enter category name (e.g., food, med, warmth...)"
            value={field.value || ""}
            onChange={(e) => {
              const normalized = e.target.value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-");
              field.onChange(normalized);
            }}
            className="mt-2 min-h-[44px]"
          />
        </FormControl>
      )}
      <FormDescription className="text-xs sm:text-sm text-muted-foreground">
        Select existing or create new category (lowercase, dash-separated)
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
