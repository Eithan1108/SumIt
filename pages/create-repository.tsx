'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Input from "@/components/ui/SeconInput"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from 'lucide-react'
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchUserById, fetchCommunities, addRepository } from '@/lib/db'
import { User, Community } from '@/lib/types'
import { ToastProvider, useToast } from '@/components/ui/Toats'

function CreateRepositoryContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('userId')
      if (!userId) return
      try {
        const [userData, communitiesData] = await Promise.all([
          fetchUserById(userId),
          fetchCommunities()
        ])
        setUser(userData)
        setCommunities(communitiesData.filter(community => community.admins.includes(userId)))
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        addToast("An error occurred while fetching data", "error")
        setIsLoading(false)
      }
    }
    fetchData()
  }, [addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const newRepo = await addRepository({
        name,
        description,
        author: user.name,
        owner: user.id,
        stars: 0,
        tags: [],
        rootFolder: {
          id: 'root',
          name: 'Root',
          items: [],
          path: []
        },
        views: 0,
        likes: 0,
      }, selectedCommunity || undefined)
      addToast("Repository created successfully!", "success")
      router.push(`/repository/${newRepo.id}?userId=${user.id}`)
    } catch (err) {
      console.error("Error creating repository:", err)
      addToast("An error occurred while creating the repository", "error")
    }
  }

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
  if (!user) return <div className="container mx-auto p-4">User not found</div>

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={() => {}} userId={user.id} />

      <main className="container mx-auto px-4 py-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-800">Create New Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Repository Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              {communities.length > 0 && (
                <div>
                  <Label htmlFor="community">Assign to Community (Optional)</Label>
                  <select
                    id="community"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">None</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button type="submit" className="w-full bg-orange-500 text-white hover:bg-orange-600">
                Create Repository
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function CreateRepositoryPage() {
  return (
    <ToastProvider>
      <CreateRepositoryContent />
    </ToastProvider>
  )
}