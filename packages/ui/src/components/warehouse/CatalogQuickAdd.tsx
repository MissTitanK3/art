import { Button } from "@workspace/ui/components/button";
import { humanize } from "@workspace/ui/lib/utils";
import { CatalogItem } from "./types";

interface CatalogQuickAddProps {
    groupedCatalog: { category: string; items: CatalogItem[] }[];
    onLoadItem: (name: string, category: string, sku?: string) => void;
}

export function CatalogQuickAdd({ groupedCatalog, onLoadItem }: CatalogQuickAddProps) {
    return (
        <div className="rounded-lg border border-dashed p-3 w-full">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Standard kit quick-add
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Tap an item to prefill the new SKU form.
            </p>
            <div className="mt-3 space-y-3">
                {groupedCatalog.length === 0 ? (
                    <p className="text-xs sm:text-sm text-muted-foreground">Loading catalog...</p>
                ) : (
                    groupedCatalog.map((section) => (
                        <div key={section.category}>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                                {humanize(section.category)}
                            </p>
                            <div className="mt-1 flex flex-col md:flex-row flex-wrap gap-2">
                                {section.items.map((item) => (
                                    <Button
                                        key={`${section.category}-${item.itemName}`}
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-full border min-h-[40px] px-2 sm:px-4 text-xs sm:text-sm max-w-[200px] truncate"
                                        onClick={() => onLoadItem(item.itemName, item.category, item.sku)}
                                    >
                                        <span className="truncate">{humanize(item.itemName)}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
