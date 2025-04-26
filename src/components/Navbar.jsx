import React, { useState } from 'react';
import { Menu, Bell, User, Moon, Sun } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'New Project Created',
    message: 'Project Alpha has been created',
    time: '2 minutes ago'
  },
  {
    id: 2,
    title: 'Task Completed',
    message: 'Database migration completed successfully',
    time: '1 hour ago'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'New features have been deployed',
    time: '3 hours ago'
  }
];

const Navbar = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          
          
          {/* <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}



          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                  <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center border-l dark:border-gray-600 pl-3 ml-3">
            <div className="h-9 w-9 rounded-full bg-accent-600 text-white flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com AQUI PONER LOS DATOS DEL USUARIO</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;