'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Download, Eye, ArrowLeft, ThumbsUp, MessageSquare, Share2, Search, AlertCircle, Send, Menu, X, BookOpen, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Header from "../../components/Theme/Header"
import Footer from "../../components/Theme/Footer"

const sampleSummary = {
  id: '1',
  title: 'Introduction to Quantum Mechanics and AI Assistants',
  description: 'This summary covers the fundamental concepts of quantum mechanics, including wave-particle duality, the Schrödinger equation, and the uncertainty principle. It also introduces modern AI assistants like v0. This comprehensive overview is suitable for undergraduate physics students and those interested in AI technology.',
  author: 'Dr. Jane Smith',
  dateCreated: '2023-05-15',
  lastUpdated: '2023-06-02',
  views: 1250,
  likes: 87,
  comments: [
    { id: '1', author: 'Alice', content: 'Great summary! Very helpful for my studies.', timestamp: '2023-06-05 14:30' },
    { id: '2', author: 'Bob', content: 'Could you elaborate more on the uncertainty principle?', timestamp: '2023-06-06 09:15' }
  ],
  tags: ['Physics', 'Quantum Mechanics', 'Undergraduate', 'AI'],
  fileUrl: '/path/to/quantum_mechanics_summary.pdf',

}

export default function Component() {
  const router = useRouter()
  const [summary, setSummary] = useState(sampleSummary)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (router.isReady) {
      const { id, summary: routerSummary } = router.query

      if (routerSummary) {
        try {
          const parsedSummary = typeof routerSummary === 'string' 
            ? JSON.parse(routerSummary) 
            : routerSummary

          setSummary(prevSummary => ({
            ...prevSummary,
            ...parsedSummary,
            id: id || prevSummary.id,
            neuronGraph: {
              ...prevSummary.neuronGraph,
              ...(parsedSummary.neuronGraph || {})
            }
          }))
        } catch (error) {
          console.error('Error parsing summary data:', error)
        }
      }
    }
  }, [router.isReady, router.query])

  const handleSearch = () => {
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

  const handleLike = () => {
    setSummary(prev => ({ ...prev, likes: prev.likes + 1 }))
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        author: 'Current User', // In a real app, this would be the logged-in user
        content: newComment.trim(),
        timestamp: new Date().toLocaleString()
      }
      setSummary(prev => ({
        ...prev,
        comments: [...prev.comments, newCommentObj]
      }))
      setNewComment('')
      setIsCommentDialogOpen(false)
    }
  }

  const handleShare = () => {
    // In a real app, this would implement actual sharing functionality
    console.log('Sharing summary:', summary.title)
    setIsShareDialogOpen(false)
  }

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
        <h1 className="text-3xl font-bold mb-4 text-orange-700">{summary.title}</h1>
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-orange-800 mb-2">By {summary.author}</p>
              <p className="text-sm text-orange-600">Created: {summary.dateCreated}</p>
              <p className="text-sm text-orange-600">Last Updated: {summary.lastUpdated}</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="mr-2 h-4 w-4" /> Download Summary
            </Button>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <span className="flex items-center text-orange-700"><Eye className="mr-1 h-4 w-4" /> {summary.views}</span>
            <span className="flex items-center text-orange-700"><ThumbsUp className="mr-1 h-4 w-4" /> {summary.likes}</span>
            <span className="flex items-center text-orange-700"><MessageSquare className="mr-1 h-4 w-4" /> {summary.comments.length}</span>
          </div>
          <div className="mb-4">
            {summary.tags.map(tag => (
              <span key={tag} className="inline-block bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
          <div className="h-48 overflow-y-auto rounded-md border border-orange-200 p-4 mb-4">
            <p className="text-orange-800">{summary.description}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search for a term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          {searchResult && (
            <div className="mb-4 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-700 mb-2">{searchResult.term}</h3>
              <p className="text-orange-800 mb-2">{searchResult.definition}</p>
              <div>
                <h4 className="font-semibold text-orange-700 mb-1">Related Terms:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResult.relatedTerms.map(term => (
                    <Button
                      key={term}
                      variant="outline"
                      className="border border-orange-500 text-orange-700 px-2 py-1 rounded-full text-sm hover:bg-orange-100"
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
              <AlertCircle className="h-4 w-4 inline mr-2" />
              <span className="block sm:inline">Term not found. Please try a different search term.</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-6">
          <Button onClick={handleLike} variant="outline" className="border border-orange-500 text-orange-500 hover:bg-orange-50">
            <ThumbsUp className="mr-2 h-4 w-4" /> Like ({summary.likes})
          </Button>
          <Button onClick={() => setIsCommentDialogOpen(true)} variant="outline" className="border border-orange-500 text-orange-500 hover:bg-orange-50">
            <MessageSquare className="mr-2 h-4 w-4" /> Comment ({summary.comments.length})
          </Button>
          <Button onClick={() => setIsShareDialogOpen(true)} variant="outline" className="border border-orange-500 text-orange-500 hover:bg-orange-50">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
        {isCommentDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add a Comment</h2>
              <textarea
                placeholder="Type your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full h-32 border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end">
                <Button onClick={() => setIsCommentDialogOpen(false)} variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button onClick={handleAddComment} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Send className="mr-2 h-4 w-4" /> Post Comment
                </Button>
              </div>
            </div>
          </div>
        )}
        {isShareDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Share this Summary</h2>
              <Input
                value={`https://example.com/summary/${summary.id}`}
                readOnly
                className="w-full border border-orange-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end">
                <Button onClick={() => setIsShareDialogOpen(false)} variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button onClick={handleShare} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Share2 className="mr-2 h-4 w-4" /> Copy Link
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-orange-600">Comments</h2>
          {summary.comments.map(comment => (
            <div key={comment.id} className="bg-white border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 mb-2">{comment.content}</p>
              <div className="flex justify-between text-sm text-orange-600">
                <span>{comment.author}</span>
                <span>{comment.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}