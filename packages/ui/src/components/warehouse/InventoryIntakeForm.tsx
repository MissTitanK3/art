import { UseFormReturn } from "react-hook-form";
import { useMemo } from "react";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { CategorySelector } from "./CategorySelector";
import { CatalogQuickAdd } from "./CatalogQuickAdd";
import {
    InventoryIntakeValues,
    WarehouseRecord,
    InventoryEntry,
    inventoryConditions,
    CatalogItem,
} from "./types";

interface InventoryIntakeFormProps {
    savedWarehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    catalogItems: CatalogItem[];
    intakeTab: string;
    intakeForm: UseFormReturn<InventoryIntakeValues>;
    watchWarehouseId: string;
    watchZoneId: string;
    watchBinId: string;
    availableZones: { id: string; name: string }[];
    availableBins: { id: string; label: string }[];
    handleIntakeSubmit: (values: InventoryIntakeValues) => void;
    handleTabsValueChange: (value: string) => void;
    handleLoadStandardItem: (name: string, cat: string, sku?: string) => void;
    handleGenerateSku: () => void;
}

export function InventoryIntakeForm({
    savedWarehouses,
    inventory,
    catalogItems,
    intakeTab,
    intakeForm,
    watchWarehouseId,
    watchZoneId,
    watchBinId,
    availableZones,
    availableBins,
    handleIntakeSubmit,
    handleTabsValueChange,
    handleLoadStandardItem,
    handleGenerateSku,
}: InventoryIntakeFormProps) {
    // Group catalog items by category
    const groupedCatalog = useMemo(() => {
        const groups: Record<string, CatalogItem[]> = {};
        for (const item of catalogItems) {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category]!.push(item);
        }
        return Object.entries(groups).map(([category, items]) => ({
            category,
            items,
        }));
    }, [catalogItems]);

    // Extract unique categories from catalog and inventory
    const availableCategories = useMemo(() => {
        const categorySet = new Set<string>();

        // Add categories from catalog items
        catalogItems.forEach((item) => {
            if (item.category) {
                categorySet.add(item.category.toLowerCase());
            }
        });

        // Add categories from inventory
        inventory.forEach((item) => {
            if (item.category) {
                categorySet.add(item.category.toLowerCase());
            }
        });

        // Convert to sorted array
        return Array.from(categorySet).sort();
    }, [catalogItems, inventory]);

    if (savedWarehouses.length === 0) {
        return (
            <Alert>
                <AlertTitle>Create a warehouse first</AlertTitle>
                <AlertDescription>
                    Use the builder to create your first warehouse to unlock intake, pick lists, and cycle counts.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Form {...intakeForm}>
            <form className="space-y-4" onSubmit={intakeForm.handleSubmit(handleIntakeSubmit)}>
                <div className="grid gap-4">
                    <FormField
                        control={intakeForm.control}
                        name="warehouseId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Warehouse</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger className="min-h-[44px]">
                                            <SelectValue placeholder="Select warehouse" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {savedWarehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.stewardDisplayName ?? warehouse.displayName} —{" "}
                                                {warehouse.regionZone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-xs sm:text-sm">
                                    Warehouses stay tied to display name only.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid gap-4 md:grid-cols-3 w-full">

                        <FormField
                            control={intakeForm.control}
                            name="zoneId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zone</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={availableZones.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full min-h-[44px]">
                                                <SelectValue placeholder="Select zone" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableZones.map((zone) => (
                                                <SelectItem key={zone.id} value={zone.id}>
                                                    {zone.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={intakeForm.control}
                            name="binId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bin</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={availableBins.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full min-h-[44px]">
                                                <SelectValue placeholder="Select bin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableBins.map((bin) => (
                                                <SelectItem key={bin.id} value={bin.id}>
                                                    {bin.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={intakeForm.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={field.value}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                field.onChange(value === "" ? "" : Number(value));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <Tabs value={intakeTab} onValueChange={handleTabsValueChange}>
                    <TabsList className="w-auto min-h-[44px]">
                        <TabsTrigger value="existing" className="min-h-[40px]">Catalog</TabsTrigger>
                        <TabsTrigger value="new" className="min-h-[40px]">Add new SKU</TabsTrigger>
                    </TabsList>
                    <TabsContent value="existing" className="mt-4 space-y-3">
                        <CatalogQuickAdd
                            groupedCatalog={groupedCatalog}
                            onLoadItem={handleLoadStandardItem}
                        />
                    </TabsContent>
                    <TabsContent value="new" className="mt-4">
                        <div className="grid gap-4">
                            <FormField
                                control={intakeForm.control}
                                name="itemName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Water 1L bottle" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={intakeForm.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU / shorthand</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <FormControl className="flex-1">
                                                <Input placeholder="water-1l-bottle" {...field} className="min-h-[44px]" />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleGenerateSku}
                                                className="min-h-[44px] sm:w-auto w-full"
                                            >
                                                Auto-generate
                                            </Button>
                                        </div>
                                        <FormDescription className="text-xs sm:text-sm text-muted-foreground">
                                            Use short, dash-separated labels. Auto-generate if you need a quick
                                            slug.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 mt-4">

                            <FormField
                                control={intakeForm.control}
                                name="category"
                                render={({ field }) => (
                                    <CategorySelector field={field} availableCategories={availableCategories} />
                                )}
                            />
                            <div className="grid gap-4">

                                <FormField
                                    control={intakeForm.control}
                                    name="condition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Condition</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full min-h-[44px]">
                                                        <SelectValue placeholder="Select condition" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {inventoryConditions.map((condition) => (
                                                        <SelectItem key={condition.value} value={condition.value}>
                                                            {condition.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={intakeForm.control}
                                    name="expirationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expiration date</FormLabel>
                                            <FormControl >
                                                <Input
                                                    type="date"
                                                    value={field.value ?? ""}
                                                    onChange={(event) =>
                                                        field.onChange(event.target.value || undefined)
                                                    }
                                                    className="min-h-[44px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 mt-4">
                            <FormField
                                control={intakeForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl className="w-full">
                                            <Input className="w-full min-h-[44px]" placeholder="Lot number, condition note…" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs sm:text-sm">Only in movement logs.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    intakeForm.reset({
                                        warehouseId: watchWarehouseId ?? "",
                                        zoneId: watchZoneId ?? "",
                                        binId: watchBinId ?? "",
                                        itemName: "",
                                        sku: "",
                                        category: "",
                                        quantity: 1,
                                        condition: intakeForm.getValues("condition"),
                                        expirationDate: undefined,
                                        notes: "",
                                    })
                                }
                                className="w-full sm:w-auto min-h-[44px]"
                            >
                                Clear
                            </Button>
                            <Button
                                type="submit"
                                disabled={!intakeForm.formState.isValid || savedWarehouses.length === 0}
                                className="w-full sm:w-auto min-h-[44px]"
                            >
                                Log Intake
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
