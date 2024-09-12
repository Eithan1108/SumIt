'use client'

import Link from 'next/link'
import { useState, ChangeEvent, FormEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input as BaseInput } from "@/components/ui/input"
import { BookOpen, Search, Bell, User } from "lucide-react"

interface HeaderProps {
  onSearch: (searchTerm: string) => void;
}

// Custom Input component that accepts the props we need
const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <BaseInput {...props} />;
};

export default function Header({ onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-700">SumIt</span>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-orange-400" />
              <Input
                type="search"
                placeholder="Search summaries..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 pr-4 py-2 w-full"
              />
            </div>
          </form>
          <nav className="flex items-center space-x-4">
            <Link href="/communities" className="text-orange-600 hover:text-orange-800">
              Communities
            </Link>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-orange-600" />
            </Button>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5 text-orange-600" />
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}