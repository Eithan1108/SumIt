'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Download, Eye, ArrowLeft, ThumbsUp, MessageSquare, Share2, Search, AlertCircle, Send, RefreshCw, Bookmark, User, Calendar, Sparkles  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "../../components/Theme/Header"
import Footer from "../../components/Theme/Footer"
import OwnerCard from '@/components/Cards/OwnerCard'
import { fetchSummaryById, fetchUserById, addCommentToSummary, likeSummary, saveSummary, viewSummary, fetchCommentsByIds } from "@/lib/db"
import UnauthorizedAccess from '@/components/Theme/UnauthorizedAccess'

export default function SummaryPage() {
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [owner, setOwner] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady) return;
  
      const { id, userId } = router.query;
      console.log("Route params:", { id, userId });
  
      if (typeof id !== 'string' || typeof userId !== 'string') {
        setError('Invalid URL parameters');
        setIsLoading(false);
        return;
      }
  
      try {
        setIsLoading(true);
        const { summary: updatedSummary, user: updatedUser, owner: updatedOwner } = await viewSummary(id, userId);
        console.log("Viewed summary");
  
        console.log("Fetched data:", { summary: updatedSummary, user: updatedUser, owner: updatedOwner });
  
        if (!updatedSummary || !updatedUser || !updatedOwner) {
          throw new Error('Summary, user, or owner not found');
        }
  
        setSummary(updatedSummary);
        setUser(updatedUser);
        setOwner(updatedOwner);
        
        const initialIsLiked = updatedUser.likedSummaries.includes(updatedSummary.id);
        console.log('Initial isLiked state:', initialIsLiked);
        setIsLiked(initialIsLiked);
        
        const initialIsSaved = updatedUser.savedSummaries.includes(updatedSummary.id);
        console.log('Initial isSaved state:', initialIsSaved);
        setIsSaved(initialIsSaved);
  
        console.log('Initial user liked summaries:', updatedUser.likedSummaries);

        // Fetch comments
        const fetchedComments = await fetchCommentsByIds(updatedSummary.comments);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [router.isReady, router.query]);

  const handleDownload = async () => {
    if (summary && summary.fileId) {
      try {
        const response = await fetch(`/api/download/${summary.fileId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('File not found');
          }
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = summary.fileId; // Use the fileId as the download filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Failed to download the file. Please try again.');
      }
    } else {
      setError('No file available for download');
    }
  };

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

  const handleLike = async () => {
    if (summary && user) {
      try {
        const { summary: updatedSummary, user: updatedUser, owner: updatedOwner } = await likeSummary(summary.id, user.id);
        console.log('Like operation result:', { updatedSummary, updatedUser, updatedOwner });
        
        setSummary(updatedSummary);
        setUser(updatedUser);
        setOwner(updatedOwner);
        
        // Check if the summary is now liked by the user
        const isNowLiked = updatedUser.likedSummaries.includes(updatedSummary.id);
        console.log('Is summary now liked:', isNowLiked);
        setIsLiked(isNowLiked);
  
        // Log the updated user's liked summaries
        console.log('Updated user liked summaries:', updatedUser.likedSummaries);
      } catch (err) {
        console.error("Error liking summary:", err);
        setError("Failed to like summary. Please try again.");
      }
    }
  }

  const handleSave = async () => {
    if (summary && user) {
      try {
        const updatedUser = await saveSummary(summary.id, user.id);
        setUser(updatedUser);
        setIsSaved(!isSaved);
      } catch (err) {
        console.error("Error saving summary:", err);
        setError("Failed to save summary. Please try again.");
      }
    }
  }

  const handleAddComment = async () => {
    if (newComment.trim() && summary && user) {
      const newCommentObj = {
        author: user.name,
        content: newComment.trim(),
        timestamp: new Date().toISOString()
      }
      try {
        const updatedSummary = await addCommentToSummary(summary.id, newCommentObj);
        setSummary(updatedSummary);
        setNewComment('');
        setIsCommentDialogOpen(false);
        // Fetch the updated comments
        const fetchedComments = await fetchCommentsByIds(updatedSummary.comments);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error adding comment:", err);
        setError("Failed to add comment. Please try again.");
      }
    }
  }

  const handleShare = () => {
    console.log('Sharing summary:', summary?.title)
    setIsShareDialogOpen(false)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.reload()} className="bg-orange-500 hover:bg-orange-600 text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  if (!summary || !user || !owner) {
    return <div className="flex justify-center items-center h-screen">Summary, user, or owner not found</div>
  }

  if(!summary || (summary.isPrivate && user.id !== summary.owner)) {
    return (
<UnauthorizedAccess 
        redirectPath={`/dashboard?userId=${user?.id}`}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={user.id}/>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${user.id}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-orange-800">{summary.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <span>By {summary.author}</span>
              <span>•</span>
              <span>Created: {summary.dateCreated}</span>
              <span>•</span>
              <span>Last Updated: {summary.lastUpdated}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-orange-200 text-orange-800">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-orange-700"><Eye className="mr-1 h-4 w-4" /> {summary.views}</span>
                <span className="flex items-center text-orange-700"><ThumbsUp className="mr-1 h-4 w-4" /> {summary.likes}</span>
                <span className="flex items-center text-orange-700"><MessageSquare className="mr-1 h-4 w-4" /> {summary.comments.length}</span>
              </div>
              <Button onClick={handleDownload} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                <Download className="mr-2 h-4 w-4" /> Download Summary
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={handleLike} variant={isLiked ? "secondary" : "outline"} className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <ThumbsUp className="mr-2 h-4 w-4" /> {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button onClick={handleSave} variant={isSaved ? "secondary" : "outline"} className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <Bookmark className="mr-2 h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={() => setIsCommentDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <MessageSquare className="mr-2 h-4 w-4" /> Comment
              </Button>

              <Button onClick={() => setIsShareDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
            <div className="h-48 overflow-y-auto rounded-md border border-orange-200 p-4 mb-4 bg-white">
              <p className="text-orange-800">{summary.description}</p>
            </div>
            <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border-2 border-orange-300">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-200">
            <CardTitle className="text-2xl font-bold text-orange-800 flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-orange-600" />
              AI Features Coming Soon!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-orange-700 mb-4">
              We're excited to announce that cutting-edge AI features are on their way to enhance your summary experience!
            </p>
            <ul className="list-disc list-inside space-y-2 text-orange-600">
              <li>AI-powered summary generation</li>
              <li>Intelligent keyword extraction</li>
              <li>Automated tagging suggestions</li>
              <li>Smart content recommendations</li>
            </ul>
          </CardContent>
        </Card>
            {searchResult && (
              <div className="mb-4 border border-orange-200 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">{searchResult.term}</h3>
                <p className="text-orange-700 mb-2">{searchResult.definition}</p>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Related Terms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.relatedTerms.map(term => (
                      <Button
                        key={term}
                        variant="outline"
                        className="border border-orange-300 text-orange-600 px-2 py-1 rounded-full text-sm hover:bg-orange-100 transition-colors duration-200"
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch();
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {notFound && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <AlertCircle  className="h-4 w-4 inline mr-2" />
                <span className="block sm:inline">Term not found. Please try a different search term.</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-orange-800">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <OwnerCard owner={owner} viewingUserId={user.id} />
          </CardContent>
        </Card>
        
        <Card className="bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-800">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border border-orange-200 rounded-lg p-4 bg-white">
                <p className="text-orange-700 mb-2">{comment.content}</p>
                <div className="flex items-center justify-between text-sm text-orange-600">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.author}`} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{comment.author}</span>
                  </div>
                  <span>{new Date(comment.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {isCommentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-orange-800">Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full h-32 border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsCommentDialogOpen(false)} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                  Cancel
                </Button>
                <Button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                  <Send className="mr-2 h-4 w-4" /> Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isShareDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-orange-800">Share this Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={`https://example.com/summary/${summary.id}`}
                readOnly
                className="w-full border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsShareDialogOpen(false)} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-100 transition-colors duration-200">
                  Cancel
                </Button>
                <Button onClick={handleShare} className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200">
                  <Share2 className="mr-2 h-4 w-4" /> Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}