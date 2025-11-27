import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { VendorSidebar } from "@/components/vendor/sidebar"
import { VendorNavbar } from "@/components/vendor/navbar"

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "VENDOR") {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
