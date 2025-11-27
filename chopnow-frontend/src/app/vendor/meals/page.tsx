import { auth } from "@/auth"
import { Meal } from "@/types/meal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { redirect } from "next/navigation"

async function getVendorMeals(token: string): Promise<Meal[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meals/vendor/my-meals`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch vendor meals');
  }

  return res.json();
}

export default async function VendorMealsPage() {
  const session = await auth();
  if (!session?.accessToken) {
    redirect('/auth/signin');
  }

  const meals = await getVendorMeals(session.accessToken);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Meals</h1>
        <Link href="/vendor/meals/new">
          <Button>Add New Meal</Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meals.map((meal) => (
              <TableRow key={meal.id}>
                <TableCell className="font-medium">{meal.name}</TableCell>
                <TableCell>₦{meal.discounted_price.toLocaleString()}</TableCell>
                <TableCell>{meal.quantity_available}</TableCell>
                <TableCell>
                  {meal.is_available ? "Available" : "Unavailable"}
                </TableCell>
                <TableCell>{meal.total_orders || 0}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <Link href={`/vendor/meals/edit/${meal.id}`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                      {/* TODO: Add delete functionality */}
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
