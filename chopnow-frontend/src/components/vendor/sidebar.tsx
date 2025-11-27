"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Utensils,
  ShoppingCart,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react"

export function VendorSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/vendor/dashboard", icon: Home },
    { name: "Menu", href: "/vendor/menu", icon: Utensils },
    { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/vendor/analytics", icon: BarChart2 },
    { name: "Settings", href: "/vendor/settings", icon: Settings },
  ]

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive
                          ? "text-gray-500 dark:text-gray-300"
                          : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                        "mr-3 flex-shrink-0 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 mt-4">
              <Button asChild className="w-full">
                <Link href="/vendor/menu/new" className="flex items-center justify-center">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Meal
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                    <span className="text-sm font-medium leading-none text-white">U</span>
                  </span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      User Name
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      View profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
