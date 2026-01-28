import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function LayoutWrapper({ title, children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}