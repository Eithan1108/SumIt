'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Folder, File, Search, ArrowLeft, Edit, Eye, ThumbsUp, UserCircle, MessageSquare, Clock, ArrowRight, Heart, Bookmark, Calendar, Lock } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "@/components/Theme/Footer"
import { SummaryCard } from "@/components/Cards/SummaryCard"
import { fetchRepositoryById, fetchUserById, likeRepository, saveRepository, viewRepository } from '@/lib/db'
import OwnerCard from '@/components/Cards/OwnerCard'

function FolderStructure({ folder, onSelectSummary, level = 0, userPermissions }) {
  const [isOpen, setIsOpen] = useState(level === 0)

  const canViewItem = (item) => {
    return !item.isPrivate || userPermissions.canViewPrivate
  }

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
              <FolderStructure key={item.id} folder={item} onSelectSummary={onSelectSummary} level={level + 1} userPermissions={userPermissions} />
            ) : (
              canViewItem(item) && (
                <button 
                  key={item.id} 
                  className="flex items-center py-2 w-full text-left hover:bg-orange-100 transition-colors duration-200" 
                  style={{ marginLeft: `${(level + 1) * 20}px` }} 
                  onClick={() => onSelectSummary(item)}
                >
                  <File className="w-4 h-4 mr-2 text-orange-400" />
                  <span className="text-orange-600">{item.title}</span>
                  {item.isPrivate && <Lock className="w-4 h-4 ml-2 text-orange-500" />}
                </button>
              )
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default function RepositoryPage() {
  const router = useRouter()
  const params = useParams()
  const [repo, setRepo] = useState(null)
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRepoLiked, setIsRepoLiked] = useState(false)
  const [isRepoSaved, setIsRepoSaved] = useState(false)
  const [viewCounted, setViewCounted] = useState(false)
  const [userPermissions, setUserPermissions] = useState({
    canViewPrivate: false,
    canEditRepo: false,
  })

  useEffect(() => {
    const fetchData = async () => {
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

        const isOwner = repoData.owner === userData.id;
        const isCollaborator = repoData.collaborators.includes(userData.id);

        setUserPermissions({
          canViewPrivate: isOwner || isCollaborator,
          canEditRepo: isOwner || isCollaborator,
        });

        const ownerData = await fetchUserById(repoData.owner);
        if (!ownerData) {
          throw new Error('Owner not found');
        }

        setRepo(repoData);
        setUser(userData);
        setOwner(ownerData);
        setIsRepoLiked(userData.likedRepositories?.includes(repoData.id) || false);
        setIsRepoSaved(userData.savedRepositories?.includes(repoData.id) || false);

        if (!viewCounted && (isOwner || isCollaborator || !repoData.isPrivate)) {
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
    if (!summary.isPrivate || userPermissions.canViewPrivate) {
      setSelectedSummary(summary)
    } else {
      setError("You don't have permission to view this summary.")
    }
  }

  const navigateToSummary = (summary) => {
    if (!summary.isPrivate || userPermissions.canViewPrivate) {
      router.push(`/summary/${summary.id}?userId=${user?.id}`);
    } else {
      setError("You don't have permission to view this summary.")
    }
  }

  const handleSearch = () => {
    // Implement search functionality here
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
          if (!item.isPrivate || userPermissions.canViewPrivate) {
            allSummaries.push(item)
          }
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

  if (!repo || (repo.isPrivate && !userPermissions.canViewPrivate)) {
    return <div className="container mx-auto p-4 bg-orange-50">Repository not found or you don't have access to it.</div>
  }

  const summaries = filteredSummaries()

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id || ''}/>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link
            href={`/dashboard?userId=${user?.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          {userPermissions.canEditRepo && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 ease-in-out"
              onClick={() => router.push(`/repository/edit_repository/${repo.id}?userId=${user?.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Repository
            </Button>
          )}
        </div>
        
        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-orange-800">
                  {repo.name}
                  {repo.isPrivate && (
                    <Lock className="inline-block ml-2 w-5 h-5 text-orange-500" />
                  )}
                </CardTitle>
                <CardDescription className="text-orange-700">{repo.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className={`flex items-center ${isRepoLiked ? 'text-orange-500 border-orange-500' : 'text-orange-500'} transition-colors duration-200`} 
                  onClick={handleLikeRepo}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isRepoLiked ? 'fill-current' : ''}`} />
                  {repo.likes}
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex items-center ${isRepoSaved ? 'text-orange-500 border-orange-500' : 'text-orange-500'} transition-colors duration-200`} 
                  onClick={handleSaveRepo}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${isRepoSaved ? 'fill-current' : ''}`} />
                  {isRepoSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <span className="mr-4">Author: {repo.author}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {repo.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <OwnerCard owner={owner} viewingUserId={user?.id || ''} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-orange-800">Repository Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto pr-4">
                <FolderStructure folder={repo.rootFolder} onSelectSummary={handleSelectSummary} userPermissions={userPermissions} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-orange-800">Summaries</CardTitle>
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
                          likes: summary.likes,
                          isPrivate: summary.isPrivate
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
                              {summary.isPrivate && <Lock className="w-3 h-3" />}
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
          <Card className="mt-6 overflow-hidden border-2 border-orange-200 shadow-lg transition-all duration-300 hover:shadow-xl bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 pb-6">
              <CardTitle className="text-2xl font-bold text-orange-800 mb-2">
                {selectedSummary.title}
                {selectedSummary.isPrivate && <Lock className="inline-block ml-2 w-5 h-5 text-orange-500" />}
              </CardTitle>
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