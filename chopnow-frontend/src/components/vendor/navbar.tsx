"use client"

import { useState } from "react"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export function VendorNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white md:ml-0">
            Vendor Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {session?.user?.name?.[0] || "U"}
              </span>
            </div>
            <span className="ml-2 hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:block">
              {session?.user?.name || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
