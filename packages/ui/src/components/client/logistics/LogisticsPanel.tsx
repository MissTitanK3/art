"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import AddLogisticsDrawer from "./AddLogisticsDrawer.tsx";
import EditLogisticsDrawer from "./EditLogisticsDrawer.tsx";
import { humanize, priorityColors, statusColors } from "@workspace/ui/lib/utils";

export default function LogisticsPanel({ dispatchId }: { dispatchId: string }) {
  const { submissions, updateSubmission } = useDispatchStore();
  const submission = submissions.find((s) => s.id === dispatchId);

  const [newItem, setNewItem] = useState({
    category: "supply",
    description: "",
    quantity: "",
    priority: "medium",
    status: "pending",
    responsible: "",
    warehouseName: "",
    warehouseLocation: "",
    warehouseContact: "",
    accountabilityNotes: "",
  });

  const addItem = () => {
    if (!submission) return;
    const item = {
      id: crypto.randomUUID(),
      category: newItem.category as any,
      description: newItem.description,
      quantity: newItem.quantity,
      priority: newItem.priority as any,
      status: newItem.status as any,
      responsibleParty: newItem.responsible
        ? { type: "anon" as const, name: newItem.responsible }
        : { type: "anon" as const, name: "Unassigned" },
      warehouse: {
        name: newItem.warehouseName,
        location: newItem.warehouseLocation,
        contact: newItem.warehouseContact,
      },
      accountabilityNotes: newItem.accountabilityNotes,
      updatedAt: new Date().toISOString(),
    };
    updateSubmission(dispatchId, {
      logistics: [...(submission.logistics ?? []), item],
    });
    setNewItem({
      category: "supply",
      description: "",
      quantity: "",
      priority: "medium",
      status: "pending",
      responsible: "",
      warehouseName: "",
      warehouseLocation: "",
      warehouseContact: "",
      accountabilityNotes: "",
    });
  };

  const deleteItem = (id: string) => {
    if (!submission) return;
    updateSubmission(dispatchId, {
      logistics: submission.logistics.filter((l) => l.id !== id),
    });
  };

  const saveItem = (updated: any) => {
    if (!submission) return;
    updateSubmission(dispatchId, {
      logistics: submission.logistics.map((l) => (l.id === updated.id ? updated : l)),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ground Logistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Track transport, supply chains, rally points, comms, warehouses, and accountability.
        </p>

        {/* Add new logistics item */}
        <AddLogisticsDrawer newItem={newItem} setNewItem={setNewItem} addItem={addItem} />

        {/* Existing logistics list */}
        {submission?.logistics?.length ? (
          <ul className="space-y-2">
            {submission.logistics.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item) => (
              <li key={item.id} className="text-sm">
                <div className="flex flex-col w-full justify-between">
                  <hr className="my-2 border-t border-muted-foreground" />
                  <div className="flex gap-2 w-full my-1">
                    <span className="font-bold text-xl m-auto">
                      {item.description} {item.quantity && `(${item.quantity})`}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center mb-1 w-full justify-evenly">
                    <Badge className={priorityColors[item.priority]}>
                      {humanize(item.priority)}
                    </Badge>
                    <Badge className={statusColors[item.status]}>
                      {humanize(item.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {humanize(item.category)} — Responsible:{" "}
                  {item.responsibleParty?.type === "user"
                    ? `User ${item.responsibleParty.userId}`
                    : item.responsibleParty?.name}
                </div>
                {item.warehouse?.name && (
                  <div className="text-xs mt-1">
                    Warehouse: {item.warehouse.name} ({item.warehouse.location}) —{" "}
                    {item.warehouse.contact}
                  </div>
                )}
                {item.accountabilityNotes && (
                  <div className="mt-2 text-xs text-white bg-indigo-800 p-2 rounded">
                    <span>
                      <strong>Note:</strong>
                    </span>
                    <div className="mt-1 text-xs">{item.accountabilityNotes}</div>
                  </div>
                )}
                {item.updatedAt && (
                  <div className="text-xs text-muted-foreground text-center my-3">
                    Last updated: {new Date(item.updatedAt).toLocaleString()}
                  </div>
                )}
                <div className="flex gap-2 pt-1 mt-3 w-full justify-evenly">
                  <EditLogisticsDrawer item={item} onSave={saveItem} />
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No logistics added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
