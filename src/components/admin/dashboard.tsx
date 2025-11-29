"use client"

import { useFirestore, useCollection } from "@/firebase";
import { type Order, type UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, ShoppingBag, Truck } from "lucide-react";
import { useMemo } from "react";
import { subDays } from 'date-fns';

const KPIStatCard = ({ title, value, icon: Icon, loading, description }: { title: string, value: string | number, icon: React.ElementType, loading: boolean, description: string }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                     <Skeleton className="h-8 w-2/3" />
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
    const db = useFirestore();

    const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30), []);

    const { data: deliveredOrders, loading: ordersLoading } = useCollection<Order>(db, "orders", {
        where: ["status", "==", "Delivered"],
    });

    const { data: pendingOrders, loading: pendingOrdersLoading } = useCollection<Order>(db, "orders", {
        where: ["status", "==", "Pending"],
    });

    const { data: newUsers, loading: usersLoading } = useCollection<UserProfile>(db, "users", {
        where: ["createdAt", ">=", thirtyDaysAgo]
    });

    const totalRevenue = useMemo(() => {
        if (!deliveredOrders) return 0;
        return deliveredOrders.reduce((acc, order) => acc + order.totalCost, 0);
    }, [deliveredOrders]);

    const totalSales = useMemo(() => {
        if (!deliveredOrders) return 0;
        return deliveredOrders.reduce((acc, order) => acc + order.items.reduce((itemAcc, item) => itemAcc + Number(item.quantity), 0), 0);
    }, [deliveredOrders]);

    const newCustomersCount = newUsers?.length || 0;
    const pendingOrdersCount = pendingOrders?.length || 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPIStatCard
                title="Total Revenue"
                value={`₦${totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                loading={ordersLoading}
                description="From delivered orders"
            />
            <KPIStatCard
                title="New Customers"
                value={newCustomersCount}
                icon={Users}
                loading={usersLoading}
                description="In the last 30 days"
            />
            <KPIStatCard
                title="Total Sales"
                value={totalSales}
                icon={ShoppingBag}
                loading={ordersLoading}
                description="Items in delivered orders"
            />
            <KPIStatCard
                title="Pending Orders"
                value={pendingOrdersCount}
                icon={Truck}
                loading={pendingOrdersLoading}
                description="Awaiting confirmation/shipping"
            />
        </div>
    );
}
