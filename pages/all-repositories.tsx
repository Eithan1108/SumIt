'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Input from "@/components/ui/SeconInput"
import { RepositoryCard } from "@/components/Cards/RepositoryCard"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchRepositories, fetchUserById } from '@/lib/db'
import { Repository, User } from '@/lib/types'
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
import RandomLoadingComponent from '@/components/ui/Loading'


export default function AllRepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'popular' | 'default'>('default')
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const repositoriesPerPage = 12
  const observer = useRef<IntersectionObserver | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const userId = searchParams.get('userId')
      const [allRepositories, userData] = await Promise.all([
        fetchRepositories(),
        userId ? fetchUserById(userId) : null
      ])
      setRepositories(allRepositories)
      setFilteredRepositories(allRepositories)
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let results = repositories.filter(repo =>
      (repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTags.length === 0 || selectedTags.some(tag => repo.tags.includes(tag)))
    )

    if (sortBy === 'popular') {
      results = results.sort((a, b) => b.stars - a.stars)
    }

    setFilteredRepositories(results)
    setCurrentPage(1)
    setHasMore(results.length > repositoriesPerPage)
  }, [searchTerm, repositories, selectedTags, sortBy])

  const loadMoreRepositories = useCallback(() => {
    if (!hasMore) return
    setCurrentPage(prevPage => prevPage + 1)
  }, [hasMore])

  const lastRepositoryElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreRepositories()
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore, loadMoreRepositories])

  const currentRepositories = filteredRepositories.slice(0, currentPage * repositoriesPerPage)

  const navigateToRepository = (repo: Repository) => {
    router.push(`/repository/${repo.id}?userId=${user?.id || ''}`)
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

  const allTags = Array.from(new Set(repositories.flatMap(repo => repo.tags)))

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

          <h1 className="text-3xl font-bold text-orange-700">All Repositories</h1>
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
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
          </div>
          <Select value={sortBy} onValueChange={(value: 'popular' | 'default') => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
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
            {currentRepositories.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No repositories found. Try adjusting your filters or search term.
              </div>
            ) : (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-6'}`}>
                {currentRepositories.map((repo, index) => (
                  <div
                    key={repo.id}
                    ref={index === currentRepositories.length - 1 ? lastRepositoryElementRef : null}
                  >
                    <RepositoryCard
                      repo={repo}
                      onClick={() => navigateToRepository(repo)}
                    />
                  </div>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="flex justify-center items-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}