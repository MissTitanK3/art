"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { X, UserPlus, Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";

export interface InviteUsersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUserIds: string[];
    onSelectedUsersChange: (userIds: string[]) => void;
    onSave: (userIds: string[]) => void;
}

// Mock user data type - replace with actual user type
interface User {
    id: string;
    name: string;
    email: string;
}

export function InviteUsersModal({
    open,
    onOpenChange,
    selectedUserIds,
    onSelectedUsersChange,
    onSave,
}: InviteUsersModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // TODO: Replace with actual user fetching logic
    const allUsers: User[] = [
        { id: "1", name: "Alice Johnson", email: "alice@example.com" },
        { id: "2", name: "Bob Smith", email: "bob@example.com" },
        { id: "3", name: "Carol Martinez", email: "carol@example.com" },
        { id: "4", name: "David Lee", email: "david@example.com" },
        { id: "5", name: "Eve Taylor", email: "eve@example.com" },
    ];

    const filteredUsers = allUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedUsers = allUsers.filter((user) =>
        selectedUserIds.includes(user.id)
    );

    const toggleUser = (userId: string) => {
        if (selectedUserIds.includes(userId)) {
            onSelectedUsersChange(selectedUserIds.filter((id) => id !== userId));
        } else {
            onSelectedUsersChange([...selectedUserIds, userId]);
        }
    };

    const handleSave = () => {
        onSave(selectedUserIds);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Users</DialogTitle>
                    <DialogDescription>
                        Select users who can access this resource
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Selected ({selectedUsers.length})
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <Badge
                                        key={user.id}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => toggleUser(user.id)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="user-search">Search Users</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="user-search"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                No users found
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => toggleUser(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors ${isSelected ? "bg-muted" : ""
                                            }`}
                                    >
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected
                                                        ? "bg-primary border-primary"
                                                        : "border-muted-foreground"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <svg
                                                        className="w-3 h-3 text-primary-foreground"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={3}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {user.email}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Save Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Trigger button variant for ease of use
export function InviteUsersButton({
    selectedUserIds = [],
    onSelectedUsersChange,
    onSave,
    children,
    variant = "outline",
    size = "default",
}: {
    selectedUserIds?: string[];
    onSelectedUsersChange: (userIds: string[]) => void;
    onSave: (userIds: string[]) => void;
    children?: React.ReactNode;
    variant?: "outline" | "default" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg";
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant={variant} size={size} onClick={() => setOpen(true)}>
                {children ?? (
                    <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Users
                    </>
                )}
            </Button>
            <InviteUsersModal
                open={open}
                onOpenChange={setOpen}
                selectedUserIds={selectedUserIds}
                onSelectedUsersChange={onSelectedUsersChange}
                onSave={onSave}
            />
        </>
    );
}
