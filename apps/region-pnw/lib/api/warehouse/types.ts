// Request/Response types for warehouse API routes
import {
    WarehouseRecord,
    InventoryEntry,
    MovementLogEntry,
    PickListItem,
    CatalogItem,
    InventoryIntakeValues
} from "@workspace/ui/components/warehouse/types";

// GET /api/warehouse/data response
export type WarehouseDataResponse = {
    warehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    movementLogs: MovementLogEntry[];
    pickList: PickListItem[];
    confirmedPickLists: PickListItem[];
    catalogItems: CatalogItem[];
};

// PATCH /api/warehouse/[id] request
export type UpdateWarehouseRequest = Partial<WarehouseRecord>;

// POST /api/warehouse/inventory request
export type CreateInventoryRequest = InventoryIntakeValues;

// POST /api/warehouse/pick-list request
export type AddToPickListRequest = {
    inventoryId: string;
};

// POST /api/warehouse/pick-list/confirm request  
export type ConfirmPickListRequest = {
    pickListIds: string[];
};

// PATCH requests for quantity updates
export type UpdateQuantityRequest = {
    quantity: number;
};
