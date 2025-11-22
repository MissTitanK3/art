import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { LucideIcon } from "lucide-react";

export function StatCard({
    icon: Icon,
    label,
    value,
    caption,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    caption: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{caption}</p>
            </CardContent>
        </Card>
    );
}
