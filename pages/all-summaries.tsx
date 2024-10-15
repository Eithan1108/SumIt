'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link";
import Input from "@/components/ui/SeconInput"
import { SummaryCard } from "@/components/Cards/SummaryCard"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchSummaries, fetchUserById } from '@/lib/db'
import { Summary, User } from '@/lib/types'
import { Search, ChevronLeft, ChevronRight, Grid, List, Tag, Filter, ArrowLeft, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function AllSummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'default'>('default')
  const router = useRouter()
  const searchParams = useSearchParams()
  const summariesPerPage = 12

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const userId = searchParams.get('userId')
        const [allSummaries, userData] = await Promise.all([
          fetchSummaries(),
          userId ? fetchUserById(userId) : null
        ])
        setSummaries(allSummaries)
        setFilteredSummaries(allSummaries)
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [searchParams])

  useEffect(() => {
    let results = summaries.filter(summary =>
      (summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTags.length === 0 || selectedTags.some(tag => summary.tags.includes(tag)))
    )

    switch (sortBy) {
      case 'recent':
        results = results.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
        break
      case 'popular':
        results = results.sort((a, b) => b.views - a.views)
        break
      default:
        // Keep the default order
        break
    }

    setFilteredSummaries(results)
    setCurrentPage(1)
  }, [searchTerm, summaries, selectedTags, sortBy])

  const indexOfLastSummary = currentPage * summariesPerPage
  const indexOfFirstSummary = indexOfLastSummary - summariesPerPage
  const currentSummaries = filteredSummaries.slice(indexOfFirstSummary, indexOfLastSummary)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const navigateToSummary = (summary: Summary) => {
    router.push(`/summary/${summary.id}?userId=${user?.id || ''}`)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTags([])
    setSortBy('default')
  }

  const allTags = Array.from(new Set(summaries.flatMap(summary => summary.tags)))

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />
      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${user?.id || ''}`}
          className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">All Summaries</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-orange-200' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-orange-200' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search summaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
          </div>
          <Select value={sortBy} onValueChange={(value: 'recent' | 'popular' | 'default') => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        className={selectedTags.includes(tag) ? 'bg-orange-200' : ''}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-6'}`}>
              {currentSummaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  summary={summary}
                  onClick={() => navigateToSummary(summary)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              {Array.from({ length: Math.ceil(filteredSummaries.length / summariesPerPage) }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={currentPage === i + 1 ? "bg-orange-500 text-white" : "text-orange-500"}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastSummary >= filteredSummaries.length}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}