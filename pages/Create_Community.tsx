'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Search, Menu, X, User as UserIcon, Bell, ChevronDown } from "lucide-react"
import { addCommunity, fetchUserById } from '@/lib/db'
import { User, Community } from '@/lib/types'
import Header from '@/components/Theme/Header'
import Footer from '@/components/Theme/Footer'
import { ToastProvider, useToast } from '@/components/ui/Toats'

function CreateCommunityContent() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [joinPolicy, setJoinPolicy] = useState('open')
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        if (userId) {
          const fetchedUser = await fetchUserById(userId);
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Failed to load data. Please try again.', 'error');
      }
    };
    fetchData();
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!user) {
        throw new Error('User not found');
      }
      const newCommunity: Omit<Community, 'id'> = {
        name,
        description,
        members: [user.id],
        admins: [user.id],
        tags: [],
        rules: [],
        creationDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        totalMembers: 1,
        totalContent: 0,
        repositories: [],
        joinPolicy: joinPolicy as 'open' | 'request' | 'invite',
        pendingMembers: []
      }
      const addedCommunity = await addCommunity(newCommunity)
      addToast('Community created successfully!', 'success');
      router.push(`/community/${addedCommunity.id}?userId=${user.id}`)
    } catch (error) {
      console.error('Error creating community:', error)
      addToast(error instanceof Error ? error.message : 'Failed to create community. Please try again.', 'error');
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSearch(query: string) {
    // Implement search functionality
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-2">
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">Home</a>
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">Explore</a>
            <a href="#" className="block py-2 text-gray-600 hover:text-orange-600">My Communities</a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-orange-700 mb-6">Create a New Community</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-orange-700 mb-2">Community Name</label>
              <input 
                id="name" 
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter community name" 
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-lg font-medium text-orange-700 mb-2">Description</label>
              <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter community description" 
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label htmlFor="joinPolicy" className="block text-lg font-medium text-orange-700 mb-2">Join Policy</label>
              <select
                id="joinPolicy"
                value={joinPolicy}
                onChange={(e) => setJoinPolicy(e.target.value)}
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="open">Open</option>
                <option value="request">Request to Join</option>
                <option value="invite">Invite Only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="private" className="text-orange-700">Make this community private</label>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  Private communities are only visible to members and require an invitation to join.
                </p>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Community'}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default function CreateCommunity() {
  return (
    <ToastProvider>
      <CreateCommunityContent />
    </ToastProvider>
  )
}