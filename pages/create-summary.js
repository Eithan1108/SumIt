'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Bell, User, BookOpen, ChevronRight, Folder, Upload, Plus, X } from "lucide-react"
import Link from 'next/link'
import Footer from "../components/Theme/Footer"
import { repositories } from '@/lib/mockData'



export default function CreateSummary() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log({ title, description, isPrivate, subject, location })
  }

  const handleLocationSelect = (repoId, folderId) => {
    const repo = repositories.find(r => r.id === repoId)
    const folder = repo.rootFolder.items.find(f => f.id === folderId)
    setLocation(`${repo.name}/${folder.name}`)
    setIsLocationPickerOpen(false)
  }

  const handleCreateFolder = () => {
    if (selectedRepo && newFolderName) {
      // In a real app, you would update the backend here
      console.log(`Creating new folder "${newFolderName}" in repo "${selectedRepo.name}"`)
      setNewFolderName('')
    }
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
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
              <Link href="/profile">
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
                    <span>My Summaries</span>
                    <ChevronRight className="mx-1 h-4 w-4" />
                    <span>{location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="file" className="text-lg font-medium text-orange-700">Upload summary file</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-orange-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-orange-400" />
                <div className="flex text-sm text-orange-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-orange-500">PDF, DOC, TXT up to 10MB</p>
              </div>
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
          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Create summary
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
            {repositories.map(repo => (
  <div key={repo.id} className="border-b border-orange-200 pb-4">
    <h3 className="font-semibold text-orange-600 mb-2">{repo.name}</h3>
    <ul className="space-y-2">
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
      <Footer />
    </div>
  )
}