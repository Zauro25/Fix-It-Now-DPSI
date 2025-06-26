'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  PlusIcon, 
  BellIcon, 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const pathname = usePathname()

  const menuItems = [
    { icon: HomeIcon, href: '/', active: pathname === '/' },
    { icon: PlusIcon, href: '/add', active: false },
    { icon: BellIcon, href: '/notifications', active: false },
    { icon: ChatBubbleLeftIcon, href: '/messages', active: false },
    { icon: UserGroupIcon, href: '/users', active: false },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-blue-600 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-blue-600 rounded-sm"></div>
            <div className="bg-blue-600 rounded-sm"></div>
            <div className="bg-blue-600 rounded-sm"></div>
            <div className="bg-blue-600 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-4 flex-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              item.active 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button className="w-10 h-10 rounded-lg flex items-center justify-center text-blue-100 hover:bg-blue-500 hover:text-white transition-colors">
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Sidebar