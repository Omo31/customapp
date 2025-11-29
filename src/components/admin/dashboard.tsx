
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { type Order, type UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, ShoppingBag, Truck } from "lucide-react";
import { useMemo } from "react";
import { subDays, format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    const sevenDaysAgo = useMemo(() => subDays(new Date(), 7), []);

    const { data: allDeliveredOrders, loading: ordersLoading } = useCollection<Order>(db, "orders", {
        where: ["status", "==", "Delivered"],
    });
    
    const { data: recentDeliveredOrders, loading: recentOrdersLoading } = useCollection<Order>(db, "orders", {
       where: ["createdAt", ">=", sevenDaysAgo],
       orderBy: ["createdAt", "asc"],
    });

    const { data: pendingOrders, loading: pendingOrdersLoading } = useCollection<Order>(db, "orders", {
        where: ["status", "==", "Pending"],
    });

    const { data: newUsers, loading: usersLoading } = useCollection<UserProfile>(db, "users", {
        where: ["createdAt", ">=", thirtyDaysAgo]
    });
    
    const { data: recentOrders, loading: recentOrdersListLoading } = useCollection<Order>(db, "orders", {
        orderBy: ["createdAt", "desc"],
        limit: 5
    });

    const totalRevenue = useMemo(() => {
        if (!allDeliveredOrders) return 0;
        return allDeliveredOrders.reduce((acc, order) => acc + order.totalCost, 0);
    }, [allDeliveredOrders]);
    
    const totalSales = useMemo(() => {
        if (!allDeliveredOrders) return 0;
        return allDeliveredOrders.length;
    }, [allDeliveredOrders]);

    const salesChartData = useMemo(() => {
        if (!recentDeliveredOrders) return [];
        const dailyRevenue: { [key: string]: number } = {};

        // Initialize last 7 days with 0 revenue
        for (let i = 0; i < 7; i++) {
            const date = format(subDays(new Date(), i), 'MMM d');
            dailyRevenue[date] = 0;
        }

        recentDeliveredOrders
            .filter(order => order.status === "Delivered")
            .forEach(order => {
                if (order.createdAt?.seconds) {
                    const date = format(new Date(order.createdAt.seconds * 1000), 'MMM d');
                    if (date in dailyRevenue) {
                        dailyRevenue[date] += order.totalCost;
                    }
                }
            });
        
        return Object.keys(dailyRevenue).map(date => ({
            name: date,
            total: dailyRevenue[date]
        })).reverse(); // Reverse to show oldest to newest

    }, [recentDeliveredOrders]);

    const newCustomersCount = newUsers?.length || 0;
    const pendingOrdersCount = pendingOrders?.length || 0;
    const loading = ordersLoading || pendingOrdersLoading || usersLoading || recentOrdersLoading || recentOrdersListLoading;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPIStatCard
                    title="Total Revenue"
                    value={`₦${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    loading={loading}
                    description="From delivered orders"
                />
                <KPIStatCard
                    title="New Customers"
                    value={newCustomersCount}
                    icon={Users}
                    loading={loading}
                    description="In the last 30 days"
                />
                <KPIStatCard
                    title="Sales"
                    value={totalSales}
                    icon={ShoppingBag}
                    loading={loading}
                    description="Total delivered orders"
                />
                <KPIStatCard
                    title="Pending Orders"
                    value={pendingOrdersCount}
                    icon={Truck}
                    loading={loading}
                    description="Awaiting confirmation"
                />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                 <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {loading ? (
                            <Skeleton className="h-[350px] w-full" />
                        ) : (
                             <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={salesChartData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₦${Number(value) / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{fill: 'hsl(var(--secondary))'}}
                                    content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                {payload[0].payload.name}
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                 ₦{payload[0].value?.toLocaleString()}
                                                </span>
                                            </div>
                                            </div>
                                        </div>
                                        )
                                    }
                                    return null
                                    }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                 <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                            The latest 5 orders from your store.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                             <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                             </div>
                         ) : (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {recentOrders && recentOrders.length > 0 ? recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                {order.customerEmail}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge>{order.status}</Badge></TableCell>
                                        <TableCell className="text-right">₦{order.totalCost.toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">No recent orders.</TableCell>
                                    </TableRow>
                                )}
                                </TableBody>
                            </Table>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    