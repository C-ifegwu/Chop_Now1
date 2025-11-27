"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, Filter } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Order = {
  id: string
  customer: string
  items: { name: string; quantity: number }[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  orderTime: string
  deliveryTime: string
}

export function OrdersTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  const orders: Order[] = [
    {
      id: "ORD-1001",
      customer: "John Doe",
      items: [
        { name: "Jollof Rice", quantity: 2 },
        { name: "Grilled Chicken", quantity: 2 },
        { name: "Chapman", quantity: 2 }
      ],
      total: 7500,
      status: "pending",
      orderTime: "2023-05-15T10:30:00",
      deliveryTime: "2023-05-15T11:30:00"
    },
    {
      id: "ORD-1002",
      customer: "Jane Smith",
      items: [
        { name: "Pounded Yam & Egusi", quantity: 1 },
        { name: "Beef", quantity: 2 }
      ],
      total: 4500,
      status: "confirmed",
      orderTime: "2023-05-15T11:15:00",
      deliveryTime: "2023-05-15T12:15:00"
    },
    {
      id: "ORD-1003",
      customer: "Michael Brown",
      items: [
        { name: "Fried Rice", quantity: 3 },
        { name: "Grilled Chicken", quantity: 3 },
        { name: "Cola", quantity: 3 }
      ],
      total: 10200,
      status: "preparing",
      orderTime: "2023-05-15T11:45:00",
      deliveryTime: "2023-05-15T12:45:00"
    },
    {
      id: "ORD-1004",
      customer: "Sarah Johnson",
      items: [
        { name: "Amala & Ewedu", quantity: 1 },
        { name: "Gbegiri", quantity: 1 },
        { name: "Beef", quantity: 2 }
      ],
      total: 3800,
      status: "ready",
      orderTime: "2023-05-15T12:00:00",
      deliveryTime: "2023-05-15T13:00:00"
    },
    {
      id: "ORD-1005",
      customer: "David Wilson",
      items: [
        { name: "Ofada Rice", quantity: 2 },
        { name: "Assorted Meat", quantity: 1 },
        { name: "Plantain", quantity: 2 }
      ],
      total: 6500,
      status: "completed",
      orderTime: "2023-05-14T19:30:00",
      deliveryTime: "2023-05-14T20:30:00"
    },
    {
      id: "ORD-1006",
      customer: "Emily Davis",
      items: [
        { name: "Eba & Egusi", quantity: 1 },
        { name: "Ponmo", quantity: 2 }
      ],
      total: 3200,
      status: "cancelled",
      orderTime: "2023-05-14T20:15:00",
      deliveryTime: "2023-05-14T21:15:00"
    }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>
      case 'preparing':
        return <Badge variant="secondary">Preparing</Badge>
      case 'ready':
        return <Badge variant="success">Ready for Pickup</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Confirm Order'
      case 'confirmed':
        return 'Start Preparing'
      case 'preparing':
        return 'Mark as Ready'
      case 'ready':
        return 'Mark as Completed'
      default:
        return null
    }
  }

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    // In a real app, this would make an API call to update the order status
    console.log(`Updating order ${orderId} from ${currentStatus} to next status`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('preparing')}>
                Preparing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('ready')}>
                Ready
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total (₦)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Time</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const nextAction = getNextStatus(order.status)
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="line-clamp-2">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {item.quantity}x {item.name}
                          {i < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {nextAction && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(order.id, order.status)}
                          >
                            {nextAction}
                          </DropdownMenuItem>
                        )}
                        {order.status === 'pending' && (
                          <DropdownMenuItem className="text-red-600">
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
