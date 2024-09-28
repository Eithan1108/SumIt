'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Folder, Plus, X, Tag, Search } from "lucide-react"
import Footer from "../components/Theme/Footer"
import Header from "../components/Theme/Header"
import { addSummary, fetchUserById, fetchUserRepositories, fetchAllTags } from '@/lib/db'

export default function CreateSummary() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
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
          const tags = await fetchAllTags();
          setAvailableTags(tags);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ message: 'Failed to load data. Please try again.', type: 'error' });
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
        tags: selectedTags,
        isPrivate,
        neuronGraph: {}
      }
      const addedSummary = await addSummary(newSummary, repoId, folderId)
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

  const handleSearch = (term) => {
    // Implement search functionality
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

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setNewTag('')
      setTagSearch('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(tag)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header onSearch={handleSearch} userId={user?.id} />

      <main className="container mx-auto p-4 max-w-3xl">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-orange-700 mb-6">Create a New Summary</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-medium text-orange-700 mb-2">Summary Title</label>
              <input 
                id="title" 
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter summary title" 
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
                placeholder="Enter summary description" 
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-lg font-medium text-orange-700 mb-2">Content</label>
              <textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Enter summary content" 
                className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={8}
                required
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-lg font-medium text-orange-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-orange-600 hover:text-orange-800">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value)
                        setIsTagDropdownOpen(true)
                      }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                      placeholder="Search or add new tag"
                      className="w-full px-3 py-2 border border-orange-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagSearch)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <Tag className="h-5 w-5" />
                  </button>
                </div>
                {isTagDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-orange-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTags.map((tag, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-orange-100 cursor-pointer"
                        onClick={() => {
                          handleAddTag(tag)
                          setIsTagDropdownOpen(false)
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-lg font-medium text-orange-700 mb-2">Location</label>
              <button
                type="button"
                className="w-full px-3 py-2 border border-orange-300 rounded-md text-left font-normal hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onClick={() => setIsLocationPickerOpen(true)}
              >
                <Folder className="inline-block mr-2 h-4 w-4 text-orange-500" />
                {location || 'Choose location'}
              </button>
              {location && (
                <div className="mt-2 text-sm text-orange-600">
                  <div className="flex items-center">
                    <Folder className="mr-1 h-4 w-4" />
                    <span>{selectedRepo?.name || 'My Summaries'}</span>
                    {location.split('/')[1] && (
                      <>
                        <span className="mx-1">/</span>
                        <span>{selectedRepo?.rootFolder.items.find(f => f.id === location.split('/')[1])?.name || ''}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="private" className="text-orange-700">Make this summary private</label>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  Private summaries are only visible to you and people you share them with.
                </p>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Summary'}
            </button>
          </form>
        </div>
      </main>

      {isLocationPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-700">Select Location</h2>
              <button onClick={() => setIsLocationPickerOpen(false)} className="text-orange-600 hover:text-orange-800">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userRepositories.map(repo => (
                <div key={repo.id} className="border-b border-orange-200 pb-4">
                  <h3 className="font-semibold text-orange-600 mb-2">{repo.name}</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        className="w-full text-left px-2 py-1 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onClick={() => handleLocationSelect(repo.id)}
                      >
                        <Folder className="inline-block mr-2 h-4 w-4" />
                        Root
                      </button>
                    </li>
                    {repo.rootFolder.items.map(folder => (
                      <li key={folder.id}>
                        <button
                          className="w-full text-left px-2 py-1 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          onClick={() => handleLocationSelect(repo.id, folder.id)}
                        >
                          <Folder className="inline-block mr-2 h-4 w-4" />
                          {folder.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {selectedRepo && selectedRepo.id === repo.id && (
                    <div className="mt-2 flex items-center">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="New folder name"
                        className="flex-grow mr-2 px-2 py-1 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button 
                        onClick={handleCreateFolder}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button
                    className="mt-2 text-orange-600 hover:text-orange-700 focus:outline-none focus:underline"
                    onClick={() => setSelectedRepo(selectedRepo?.id === repo.id ? null : repo)}
                  >
                    {selectedRepo?.id === repo.id ? 'Cancel' : 'Create Folder'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          <div className="flex justify-between items-center">
            <p>{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-4 text-white hover:text-gray-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}