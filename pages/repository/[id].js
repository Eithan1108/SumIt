'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Folder, File, Search, ArrowLeft, Star, Eye, ThumbsUp, MessageSquare, BookOpen, Bell, User, Menu, X } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "../../components/Theme/Footer"
import { SummaryCard } from "@/components/Cards/SummaryCard"
import { RepositoryCard } from "@/components/Cards/RepositoryCard"
import { useRouter } from "next/navigation"

function FolderStructure({ folder, onSelectSummary, level = 0 }) {
  const [isOpen, setIsOpen] = useState(level === 0)

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <button 
        className="flex items-center py-2 w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <Folder className="w-4 h-4 mr-2 text-orange-500" />
        ) : (
          <Folder className="w-4 h-4 mr-2 text-orange-300" />
        )}
        <span className="font-medium text-orange-700">{folder.name}</span>
      </button>
      {isOpen && (
        <div>
          {folder.items.map((item) => (
            'items' in item ? (
              <FolderStructure key={item.id} folder={item} onSelectSummary={onSelectSummary} level={level + 1} />
            ) : (
              <button 
                key={item.id} 
                className="flex items-center py-2 w-full text-left hover:bg-orange-100" 
                style={{ marginLeft: `${(level + 1) * 20}px` }} 
                onClick={() => onSelectSummary(item)}
              >
                <File className="w-4 h-4 mr-2 text-orange-400" />
                <span className="text-orange-600">{item.title}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default function RepositoryPage() {
  const searchParams = useSearchParams()
  const [repo, setRepo] = useState(null)
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const repoData = searchParams.get('repo')
    if (repoData) {
      setRepo(JSON.parse(repoData))
    }
  }, [searchParams])

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary)
  }

  const navigateToSummary = (summary) => {
    router.push({
      pathname: `/summary/${summary.id}`,
      query: {
        summary: JSON.stringify(summary),
      },
    })
  }

  const filteredSummaries = () => {
    if (!repo) return []
    const allSummaries = []
    const traverse = (folder) => {
      folder.items.forEach(item => {
        if ('items' in item) {
          traverse(item)
        } else {
          allSummaries.push(item)
        }
      })
    }
    traverse(repo.rootFolder)
    return allSummaries.filter(summary => 
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (!repo) {
    return <div className="container mx-auto p-4 bg-orange-50">Repository not found</div>
  }

  const summaries = filteredSummaries()

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header />

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-orange-200">
          <nav className="container mx-auto py-2 px-4">
            <Link href="/communities" className="block py-2 text-orange-600 hover:text-orange-800">Communities</Link>
            <Link href="/notifications" className="block py-2 text-orange-600 hover:text-orange-800">Notifications</Link>
            <Link href="/profile" className="block py-2 text-orange-600 hover:text-orange-800">Profile</Link>
          </nav>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-orange-600">{repo.name}</CardTitle>
                <CardDescription className="text-orange-700">{repo.description}</CardDescription>
              </div>
              <Button variant="outline" className="flex items-center">
                <Star className="mr-2 h-4 w-4" /> Star ({repo.stars})
              </Button>
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <span className="mr-4">Owner: {repo.owner}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {repo.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Repository Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto pr-4">
                <FolderStructure folder={repo.rootFolder} onSelectSummary={handleSelectSummary} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input
                  id="search"
                  placeholder="Search summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="h-[400px] overflow-y-auto pr-4">
                {summaries.length > 0 ? (
                  <ul className="space-y-4">
                    {summaries.map(summary => (
                      <SummaryCard
                        key={summary.id}
                        summary={{
                          id: summary.id,
                          title: summary.title,
                          description: summary.description,
                          dateCreated: summary.lastUpdated,
                          views: summary.views,
                          likes: summary.likes
                        }}
                        onClick={() => handleSelectSummary(summary)}
                        customContent={
                          <div>
                            <p className="text-sm text-orange-600 mb-2">{summary.description}</p>
                            <div className="flex items-center text-xs text-orange-500 space-x-4">
                              <span>By {summary.author}</span>
                              <span>Updated: {summary.lastUpdated}</span>
                              <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {summary.views}</span>
                              <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {summary.likes}</span>
                              <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> {summary.comments}</span>
                            </div>
                          </div>
                        }
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Search className="w-12 h-12 text-orange-300 mb-4" />
                    <p className="text-orange-600 text-center">No summaries found matching your search.</p>
                    <p className="text-orange-500 text-sm text-center mt-2">Try adjusting your search terms or browse the repository structure.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedSummary && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{selectedSummary.title}</CardTitle>
              <CardDescription>{selectedSummary.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-2">Author: {selectedSummary.author}</p>
              <p className="text-orange-700 mb-2">Last Updated: {selectedSummary.lastUpdated}</p>
              <div className="flex items-center space-x-4 text-orange-600">
                <span className="flex items-center"><Eye className="w-4 h-4 mr-1" /> {selectedSummary.views}</span>
                <span className="flex items-center"><ThumbsUp className="w-4 h-4 mr-1" /> {selectedSummary.likes}</span>
                <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {selectedSummary.comments}</span>
              </div>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigateToSummary(selectedSummary)}>
                View Full Summary
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}