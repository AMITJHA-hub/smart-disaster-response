"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, UserCircle, LogOut } from 'lucide-react';

interface NavbarProps {
  toggleSidebar?: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Administrator': return '/admin';
      case 'Citizen': return '/citizen';
      case 'Volunteer': return '/volunteer';
      case 'Donor': return '/donor';
      default: return '/';
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm z-50 fixed w-full top-0">
      <div className="flex-none lg:hidden">
        {toggleSidebar && user && (
          <button className="btn btn-square btn-ghost" onClick={toggleSidebar}>
            <Menu />
          </button>
        )}
      </div>
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl font-bold">
          Smart Disaster Response
        </Link>
      </div>
      <div className="flex-none gap-2">
        {!user ? (
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Register</Link></li>
          </ul>
        ) : (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title px-4 py-2">
                <span className="font-semibold block">{user.name}</span>
                <span className="text-xs text-gray-500 block">{user.role}</span>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link href={getDashboardLink()} className="justify-between">
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={logout} className="text-error">
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
