import { OrdersTable } from "@/components/vendor/orders-table"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>
      <OrdersTable />
    </div>
  )
}
