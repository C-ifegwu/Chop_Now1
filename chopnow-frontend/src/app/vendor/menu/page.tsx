import { MenuItemsTable } from "@/components/vendor/menu-items-table"

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
        <p className="text-muted-foreground">
          Manage your restaurant's menu items and categories
        </p>
      </div>
      <MenuItemsTable />
    </div>
  )
}
