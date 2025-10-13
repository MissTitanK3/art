"use client";

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
  SelectContent,
  SelectItem,
  SelectValue,
} from "@workspace/ui/components/select";
import { useState, useEffect } from "react";

export default function EditLogisticsDrawer({ item, onSave }: { item: any; onSave: (updated: any) => void }) {
  const [form, setForm] = useState(item);

  useEffect(() => {
    setForm(item);
  }, [item]);

  const handleSave = () => {
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">Edit</Button>
      </DrawerTrigger>
      <DrawerContent className="p-4 max-w-3xl m-auto bg-secondary text-foreground">
        <DrawerHeader>
          <DrawerTitle>Edit Logistics Item</DrawerTitle>
          <DrawerDescription>Update details for this logistics entry.</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
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
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <Select
            value={form.priority}
            onValueChange={(v) => setForm({ ...form, priority: v })}
          >
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Responsible Party"
            value={form.responsibleParty?.name || ""}
            onChange={(e) =>
              setForm({ ...form, responsibleParty: { type: "anon", name: e.target.value } })
            }
          />

          <Input
            placeholder="Warehouse Name"
            value={form.warehouse?.name || ""}
            onChange={(e) =>
              setForm({ ...form, warehouse: { ...form.warehouse, name: e.target.value } })
            }
          />
          <Input
            placeholder="Warehouse Location"
            value={form.warehouse?.location || ""}
            onChange={(e) =>
              setForm({ ...form, warehouse: { ...form.warehouse, location: e.target.value } })
            }
          />
          <Input
            placeholder="Warehouse Contact"
            value={form.warehouse?.contact || ""}
            onChange={(e) =>
              setForm({ ...form, warehouse: { ...form.warehouse, contact: e.target.value } })
            }
          />

          <Textarea
            placeholder="Accountability notes"
            value={form.accountabilityNotes || ""}
            onChange={(e) => setForm({ ...form, accountabilityNotes: e.target.value })}
          />
        </div>

        <DrawerFooter className="sticky bottom-0 bg-background border-t p-4">
          <DrawerClose asChild>
            <Button onClick={handleSave} className="w-full">Save Changes</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
