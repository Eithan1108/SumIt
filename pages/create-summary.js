'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Bell, User, BookOpen, ChevronRight, Folder, Plus, X } from "lucide-react"
import Link from 'next/link'
import Footer from "../components/Theme/Footer"
import { addSummary, fetchUserById, fetchUserRepositories } from '@/lib/db'

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
    <div className="flex justify-between items-center">
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X size={16} />
      </button>
    </div>
  </div>
)

export default function CreateSummary() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [content, setContent] = useState('')
  const [user, setUser] = useState(null)
  const [userRepositories, setUserRepositories] = useState([])
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        if (userId) {
          const fetchedUser = await fetchUserById(userId);
          setUser(fetchedUser);
          const repos = await fetchUserRepositories(userId);
          setUserRepositories(repos);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setToast({ message: 'Failed to load user data. Please try again.', type: 'error' });
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!user) {
        throw new Error('User not found');
      }
      const [repoId, folderId] = location.split('/');
      const newSummary = {
        title,
        description,
        content,
        author: user.name,
        owner: user.id,
        tags: [subject],
        isPrivate,
        neuronGraph: {}
      }
      console.log("repo", repoId, "folder", folderId)
      const addedSummary = await addSummary(newSummary, repoId, folderId)

      console.log('Summary added successfully:', addedSummary)
      setToast({ message: 'Summary created successfully!', type: 'success' });
      router.push(`/dashboard?userId=${user.id}`)
    } catch (error) {
      console.error('Error creating summary:', error)
      setToast({ message: error.message || 'Failed to create summary. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationSelect = (repoId, folderId) => {
    const repo = userRepositories.find(r => r.id === repoId)
    const folder = folderId ? repo.rootFolder.items.find(f => f.id === folderId) : null
    setLocation(`${repoId}${folderId ? `/${folderId}` : ''}`)
    setSelectedRepo(repo)
    setIsLocationPickerOpen(false)
  }

  const handleCreateFolder = async () => {
    if (selectedRepo && newFolderName) {
      try {
        // Note: This function needs to be implemented to handle folder creation
        const updatedRepo = await createNewFolder(selectedRepo.id, newFolderName)
        setUserRepositories(prevRepos => 
          prevRepos.map(repo => 
            repo.id === updatedRepo.id ? updatedRepo : repo
          )
        )
        setNewFolderName('')
        setToast({ message: 'Folder created successfully!', type: 'success' });
      } catch (error) {
        console.error('Error creating new folder:', error)
        setToast({ message: 'Failed to create folder. Please try again.', type: 'error' });
      }
    }
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href={`/dashboard?userId=${user?.id}`} className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-orange-700">SumIt</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link href="/communities" className="text-orange-600 hover:text-orange-800">
                Communities
              </Link>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-orange-600" />
              </Button>
              <Link href={`/profile?userId=${user?.id}`}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-orange-600" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-orange-600">Create a new summary</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-lg font-medium text-orange-700">Summary title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter summary title" 
              className="mt-1 w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-lg font-medium text-orange-700">Description</Label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter summary description" 
              className="mt-1 w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-md p-2"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="content" className="text-lg font-medium text-orange-700">Content</Label>
            <textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Enter summary content" 
              className="mt-1 w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-md p-2"
              rows={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="subject" className="text-lg font-medium text-orange-700">Subject</Label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500 rounded-md p-2"
            >
              <option value="">Select a subject</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="history">History</option>
              <option value="literature">Literature</option>
            </select>
          </div>
          <div>
            <Label htmlFor="location" className="text-lg font-medium text-orange-700">Location</Label>
            <div className="mt-1 relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal border-orange-300 hover:bg-orange-50"
                onClick={() => setIsLocationPickerOpen(true)}
              >
                <Folder className="mr-2 h-4 w-4 text-orange-500" />
                {location || 'Choose location'}
              </Button>
              {location && (
                <div className="mt-2 text-sm text-orange-600">
                  <div className="flex items-center">
                    <Folder className="mr-1 h-4 w-4" />
                    <span>{selectedRepo?.name || 'My Summaries'}</span>
                    {location.split('/')[1] && (
                      <>
                        <ChevronRight className="mx-1 h-4 w-4" />
                        <span>{selectedRepo?.rootFolder.items.find(f => f.id === location.split('/')[1])?.name || ''}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
            />
            <Label htmlFor="private" className="text-orange-700">Make this summary private</Label>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  Private summaries are only visible to you and people you share them with.
                </p>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create summary'}
          </Button>
        </form>
      </main>

      {isLocationPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-700">Select Location</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsLocationPickerOpen(false)}>
                <X className="h-6 w-6 text-orange-600" />
              </Button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
            {userRepositories.map(repo => (
              <div key={repo.id} className="border-b border-orange-200 pb-4">
                <h3 className="font-semibold text-orange-600 mb-2">{repo.name}</h3>
                <ul className="space-y-2">
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-orange-700 hover:bg-orange-100"
                      onClick={() => handleLocationSelect(repo.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      Root
                    </Button>
                  </li>
                  {repo.rootFolder.items.map(folder => (
                    <li key={folder.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-orange-700 hover:bg-orange-100"
                        onClick={() => handleLocationSelect(repo.id, folder.id)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {folder.name}
                      </Button>
                    </li>
                  ))}
                </ul>
                {selectedRepo && selectedRepo.id === repo.id && (
                  <div className="mt-2 flex items-center">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder name"
                      className="mr-2 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                    <Button onClick={handleCreateFolder} className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="mt-2 text-orange-600 hover:text-orange-700"
                  onClick={() => setSelectedRepo(selectedRepo?.id === repo.id ? null : repo)}
                >
                  {selectedRepo?.id === repo.id ? 'Cancel' : 'Create Folder'}
                </Button>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Footer />
    </div>
  )
}