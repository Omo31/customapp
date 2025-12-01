
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { type Order, type UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, ShoppingBag, Truck, Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";

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

    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const { data: rangedDeliveredOrders, loading: ordersLoading } = useCollection<Order>(db, "orders", {
        where: [
            "createdAt", 
            ">=", 
            date?.from ? startOfDay(date.from) : new Date(0)
        ],
        // Firestore requires separate range filters for a single query
    });
    
    // A second query to filter by the 'to' date.
    const filteredDeliveredOrders = useMemo(() => {
        if (!rangedDeliveredOrders) return [];
        return rangedDeliveredOrders.filter(order => 
            order.status === "Delivered" &&
            order.createdAt?.seconds * 1000 <= (date?.to ? endOfDay(date.to) : new Date()).getTime()
        );
    }, [rangedDeliveredOrders, date]);


    const { data: pendingOrders, loading: pendingOrdersLoading } = useCollection<Order>(db, "orders", {
        where: ["status", "==", "Pending"],
    });

    const { data: newUsers, loading: usersLoading } = useCollection<UserProfile>(db, "users", {
        where: [
            "createdAt", 
            ">=", 
            date?.from ? startOfDay(date.from) : new Date(0)
        ],
    });
    
    const filteredNewUsers = useMemo(() => {
        if (!newUsers) return [];
        return newUsers.filter(user => 
            user.createdAt?.seconds * 1000 <= (date?.to ? endOfDay(date.to) : new Date()).getTime()
        );
    }, [newUsers, date]);

    
    const { data: recentOrders, loading: recentOrdersListLoading } = useCollection<Order>(db, "orders", {
        orderBy: ["createdAt", "desc"],
        limit: 5
    });

    const totalRevenue = useMemo(() => {
        if (!filteredDeliveredOrders) return 0;
        return filteredDeliveredOrders.reduce((acc, order) => acc + order.totalCost, 0);
    }, [filteredDeliveredOrders]);
    
    const totalSales = useMemo(() => {
        if (!filteredDeliveredOrders) return 0;
        return filteredDeliveredOrders.length;
    }, [filteredDeliveredOrders]);

    const salesChartData = useMemo(() => {
        if (!filteredDeliveredOrders || !date?.from) return [];
        
        const dailyRevenue: { [key: string]: number } = {};
        let currentDate = startOfDay(date.from);
        const endDate = endOfDay(date.to || date.from);

        while (currentDate <= endDate) {
            dailyRevenue[format(currentDate, 'MMM d')] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        filteredDeliveredOrders.forEach(order => {
                if (order.createdAt?.seconds) {
                    const orderDate = format(new Date(order.createdAt.seconds * 1000), 'MMM d');
                    if (date in dailyRevenue) {
                        dailyRevenue[orderDate] += order.totalCost;
                    }
                }
            });
        
        return Object.keys(dailyRevenue).map(dateStr => ({
            name: dateStr,
            total: dailyRevenue[dateStr]
        }));

    }, [filteredDeliveredOrders, date]);

    const newCustomersCount = filteredNewUsers?.length || 0;
    const pendingOrdersCount = pendingOrders?.length || 0;
    const loading = ordersLoading || pendingOrdersLoading || usersLoading || recentOrdersListLoading;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
                <div className="flex items-center space-x-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
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
                    description="In selected period"
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
                    loading={pendingOrdersLoading}
                    description="Awaiting confirmation"
                />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                 <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                         <CardDescription>
                            Revenue from delivered orders in the selected period.
                        </CardDescription>
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
                         {recentOrdersListLoading ? (
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

    