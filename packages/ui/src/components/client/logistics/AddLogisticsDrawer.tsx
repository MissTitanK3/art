import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";

function AddLogisticsDrawer({ newItem, setNewItem, addItem }: any) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">+ Add Logistics Item</Button>
      </DrawerTrigger>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
        <DrawerHeader>
          <DrawerTitle>Add Logistics Item</DrawerTitle>
          <DrawerDescription>
            Define transport, supply, comms, or rally point details.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <Select
            value={newItem.category}
            onValueChange={(v) => setNewItem({ ...newItem, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="supply">Supply</SelectItem>
              <SelectItem value="comms">Comms</SelectItem>
              <SelectItem value="rally_point">Rally Point</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
          />

          <Input
            placeholder="Quantity (e.g., 3 pallets, 50 units)"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: e.target.value })
            }
          />

          <Select
            value={newItem.priority}
            onValueChange={(v) => setNewItem({ ...newItem, priority: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={newItem.status}
            onValueChange={(v) => setNewItem({ ...newItem, status: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Responsible Party (name or leave blank)"
            value={newItem.responsible}
            onChange={(e) =>
              setNewItem({ ...newItem, responsible: e.target.value })
            }
          />

          <Input
            placeholder="Warehouse Name"
            value={newItem.warehouseName}
            onChange={(e) =>
              setNewItem({ ...newItem, warehouseName: e.target.value })
            }
          />
          <Input
            placeholder="Warehouse Location"
            value={newItem.warehouseLocation}
            onChange={(e) =>
              setNewItem({ ...newItem, warehouseLocation: e.target.value })
            }
          />
          <Input
            placeholder="Warehouse Contact"
            value={newItem.warehouseContact}
            onChange={(e) =>
              setNewItem({ ...newItem, warehouseContact: e.target.value })
            }
          />

          <Textarea
            placeholder="Accountability notes"
            value={newItem.accountabilityNotes}
            onChange={(e) =>
              setNewItem({ ...newItem, accountabilityNotes: e.target.value })
            }
            className="resize-y"
          />
        </div>
        <DrawerFooter className="sticky bottom-0 bg-background border-t p-4">
          <DrawerClose asChild>
            <Button
              onClick={() => {
                addItem();
              }}
              className="w-full"
            >
              Save Item
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default AddLogisticsDrawer;
