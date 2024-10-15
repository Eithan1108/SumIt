'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Folder, File, Search, ArrowLeft, Edit, Eye, ThumbsUp, UserCircle  , MessageSquare, Clock, ArrowRight, Heart, X, Bookmark, Calendar } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "../../components/Theme/Footer"
import { SummaryCard } from "@/components/Cards/SummaryCard"
import { RepositoryCard } from "@/components/Cards/RepositoryCard"
import { fetchRepositoryById, fetchUserById, likeRepository, saveRepository, viewRepository } from '@/lib/db'


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
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const [repo, setRepo] = useState(null)
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRepoLiked, setIsRepoLiked] = useState(false)
  const [isRepoSaved, setIsRepoSaved] = useState(false)
  const [viewCounted, setViewCounted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      console.log("isReady", router.isReady)
      if (!router.isReady) return;

      const { id, userId } = router.query;
      console.log("Route params:", { id, userId });

      if (typeof id !== 'string' || typeof userId !== 'string') {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      try {
        const [repoData, userData] = await Promise.all([
          fetchRepositoryById(id),
          fetchUserById(userId)
        ])
        console.log("Fetched data:", { repoData, userData });

        if (!repoData) {
          throw new Error('Repository not found');
        }

        if (!userData) {
          throw new Error('User not found');
        }

        const ownerData = await fetchUserById(repoData.owner);
        if (!ownerData) {
          throw new Error('Owner not found');
        }

        const enhancedOwnerData = {
          ...ownerData,
          totalLikes: ownerData.totalLikes || 0,
          totalViews: ownerData.totalViews || 0,
          followers: ownerData.followers || 0,
          joinDate: ownerData.joinDate || new Date().toISOString()
        };

        setRepo(repoData);
        setUser(userData);
        setOwner(enhancedOwnerData);
        setIsRepoLiked(userData.likedRepositories?.includes(repoData.id) || false);
        setIsRepoSaved(userData.savedRepositories?.includes(repoData.id) || false);

        // Increment view count
        if (!viewCounted) {
          const { repository: updatedRepo, owner: updatedOwner } = await viewRepository(repoData.id, userData.id);
          setRepo(updatedRepo);
          setOwner(updatedOwner);
          setViewCounted(true);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, router.query, viewCounted]);

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary)
  }

  const navigateToSummary = (summary) => {
    router.push(`/summary/${summary.id}?userId=${user.id}`);
  }

  const handleSearch = () => {
    if (summary) {
      const lowercaseTerm = searchTerm.toLowerCase()
      const result = summary.neuronGraph[lowercaseTerm]
      if (result) {
        setSearchResult(result)
        setNotFound(false)
      } else {
        setSearchResult(null)
        setNotFound(true)
      }
    }
  }

  const handleLikeRepo = async () => {
    if (!repo || !user) return;
    try {
      const { repository: updatedRepo, user: updatedUser, owner: updatedOwner } = await likeRepository(repo.id, user.id);
      setUser(updatedUser);
      setRepo(updatedRepo);
      setOwner(updatedOwner);
      setIsRepoLiked(!isRepoLiked);
    } catch (error) {
      console.error("Error liking repository:", error);
      setError("Failed to like/unlike the repository. Please try again.");
    }
  }

  const handleSaveRepo = async () => {
    if (!repo || !user) return;
    try {
      const updatedUser = await saveRepository(repo.id, user.id);
      setUser(updatedUser);
      setIsRepoSaved(!isRepoSaved);
    } catch (error) {
      console.error("Error saving repository:", error);
      setError("Failed to save/unsave the repository. Please try again.");
    }
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

  if (loading) {
    return <div className="container mx-auto p-4 bg-orange-50">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-orange-50">Error: {error}</div>
  }

  if (!repo) {
    return <div className="container mx-auto p-4 bg-orange-50">Repository not found</div>
  }

  const summaries = filteredSummaries()

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={user.id}/>
      
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
      <div className="flex justify-between items-center mb-4">
      <Link
        href={`/dashboard?userId=${user.id}`}
        className="inline-flex items-center text-orange-600 hover:text-orange-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      {(user.id === repo.owner || repo.collaborators.includes(user.id)) && (
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 ease-in-out"
          onClick={() => router.push(`/repository/edit_repository/${repo.id}?userId=${user.id}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Repository
        </Button>
      )}
    </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-orange-600">{repo.name}</CardTitle>
                <CardDescription className="text-orange-700">{repo.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className={`flex items-center ${isRepoLiked ? 'text-orange-500 border-orange-500' : 'text-orange-500'}`} 
                  onClick={handleLikeRepo}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isRepoLiked ? 'fill-current' : ''}`} />
                  {repo.likes}
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex items-center ${isRepoSaved ? 'text-orange-500 border-orange-500' : 'text-orange-500'}`} 
                  onClick={handleSaveRepo}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${isRepoSaved ? 'fill-current' : ''}`} />
                  {isRepoSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <span className="mr-4">Author: {repo.author}</span>
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

        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-orange-200 shadow-md">
              <AvatarImage src={owner.avatar} alt={owner.name} />
              <AvatarFallback className='bg-orange-300 text-orange-800 text-1xl font-bold'>{owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-orange-700">{owner.name}</h3>
              <p className="text-sm text-gray-500">@{owner.username}</p>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {new Date(owner.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{owner.totalLikes}</p>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{owner.totalViews}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{owner.followers}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
          </div>
        </div>

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
  <Card className="mt-6 overflow-hidden border-2 border-orange-200 shadow-lg transition-all duration-300 hover:shadow-xl">
    <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 pb-6">
      <CardTitle className="text-2xl font-bold text-orange-800 mb-2">{selectedSummary.title}</CardTitle>
      <div className="flex items-center text-sm text-orange-600">
        <UserCircle className="w-5 h-5 mr-2" />
        <span>{selectedSummary.author}</span>
        <span className="mx-2">•</span>
        <Calendar className="w-5 h-5 mr-2" />
        <span>Updated: {new Date(selectedSummary.lastUpdated).toLocaleDateString()}</span>
      </div>
    </CardHeader>
    <CardContent className="p-6 bg-white">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-orange-800 mb-3">Description</h4>
        <p className="text-orange-700 leading-relaxed">{selectedSummary.description || "No description available."}</p>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center text-orange-600">
          <Clock className="w-5 h-5 mr-2" />
          <span className="text-sm">Estimated read time: 5 min</span>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 ease-in-out flex items-center px-4 py-2"
          onClick={() => navigateToSummary(selectedSummary)}
        >
          View Full Summary
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
)}
      </main>
      <Footer />
    </div>
  )
}