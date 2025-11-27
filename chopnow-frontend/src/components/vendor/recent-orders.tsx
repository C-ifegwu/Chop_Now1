import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Order = {
  id: string
  customer: string
  items: number
  amount: number
  status: "pending" | "processing" | "completed" | "cancelled"
  date: string
}

export function RecentOrders() {
  const orders: Order[] = [
    {
      id: "ORD-001",
      customer: "John Doe",
      items: 3,
      amount: 12500,
      status: "completed",
      date: "2023-05-15"
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      items: 2,
      amount: 8500,
      status: "processing",
      date: "2023-05-14"
    },
    {
      id: "ORD-003",
      customer: "Michael Johnson",
      items: 5,
      amount: 21500,
      status: "pending",
      date: "2023-05-14"
    },
    {
      id: "ORD-004",
      customer: "Sarah Williams",
      items: 1,
      amount: 4500,
      status: "completed",
      date: "2023-05-13"
    },
    {
      id: "ORD-005",
      customer: "Robert Brown",
      items: 4,
      amount: 18500,
      status: "cancelled",
      date: "2023-05-12"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "processing":
        return <Badge variant="default">Processing</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Order #{order.id}</div>
              <div className="text-sm text-muted-foreground">{order.customer}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="font-medium">₦{order.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{order.items} items</div>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">
        View all orders
      </Button>
    </div>
  )
}
