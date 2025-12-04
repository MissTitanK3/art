import {
    WarehouseRecord,
    InventoryEntry,
    MovementLogEntry,
    PickListItem,
    CatalogItem,
    InventoryIntakeValues
} from "@workspace/ui/patterns/features/warehouse";

export type WarehouseDataResponse = {
    warehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    movementLogs: MovementLogEntry[];
    pickList: PickListItem[];
    confirmedPickLists: PickListItem[];
    catalogItems: CatalogItem[];
};

export type UpdateWarehouseRequest = Partial<WarehouseRecord>;

export type CreateInventoryRequest = InventoryIntakeValues;

export type AddToPickListRequest = {
    inventoryId: string;
};

export type ConfirmPickListRequest = {
    pickListIds: string[];
};
export type UpdateQuantityRequest = {
    quantity: number;
};
