"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Star,
  TrendingUp,
  Clock,
  Edit,
  Settings,
  Heart,
  Bookmark,
  BookOpen,
  Search,
  Bell,
  User,
  ArrowLeft,
  Users,
} from "lucide-react"
import Header from "../components/Theme/Header"
import Footer from "../components/Theme/Footer"
import { SummaryCard } from "../components/Cards/SummaryCard"
import { CommunityCard } from "../components/Cards/CommunityCard"
import { RepositoryCard } from "../components/Cards/RepositoryCard"
import { EditProfileModal } from "./EditProfile"
import {
  fetchUserById,
  fetchSummariesByOwnerId,
  fetchLikedSummaries,
  fetchSavedSummaries,
  fetchRepositoriesByOwnerId,
  fetchLikedRepositories,
  fetchSavedRepositories,
  updateUser,
} from "@/lib/db"

export default function ProfilePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [user, setUser] = useState(null)
  const [userSummaries, setUserSummaries] = useState([])
  const [likedSummaries, setLikedSummaries] = useState([])
  const [savedSummaries, setSavedSummaries] = useState([])
  const [userRepositories, setUserRepositories] = useState([])
  const [likedRepositories, setLikedRepositories] = useState([])
  const [savedRepositories, setSavedRepositories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setIsLoading(true)
        try {
          const [
            userData,
            summariesData,
            likedSummariesData,
            savedSummariesData,
            reposData,
            likedReposData,
            savedReposData
          ] = await Promise.all([
            fetchUserById(userId),
            fetchSummariesByOwnerId(userId),
            fetchLikedSummaries(userId),
            fetchSavedSummaries(userId),
            fetchRepositoriesByOwnerId(userId),
            fetchLikedRepositories(userId),
            fetchSavedRepositories(userId)
          ])
          setUser(userData)
          setUserSummaries(summariesData)
          setLikedSummaries(likedSummariesData)
          setSavedSummaries(savedSummariesData)
          setUserRepositories(reposData)
          setLikedRepositories(likedReposData)
          setSavedRepositories(savedReposData)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching in profile:", searchTerm)
    // Implement search functionality here
  }

  const navigateToRepository = (repo) => {
    router.push({
      pathname: `/repository/${repo.id}`,
      query: { repo: JSON.stringify(repo) },
    })
  }

  const navigateToSummary = (summary) => {
    router.push(`/summary/${summary.id}?userId=${userId}`);
  }

  const navigateToCommunity = (community) => {
    router.push({
      pathname: `/community/${community.id}`,
      query: { community: JSON.stringify(community) },
    })
  }

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async (updatedUser) => {
    try {
      await updateUser(updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${userId}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="mb-8 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24 border-4 border-orange-200 shadow-md">
                {user && user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name || 'User avatar'} />
                ) : (
                  <AvatarFallback className="bg-orange-300 text-orange-800 text-2xl font-bold">
                    {user ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-orange-800">
                  {user ? user.name : 'User Not Found'}
                </h1>
                {user && (
                  <>
                    <p className="text-orange-600 font-medium">@{user.username}</p>
                    <p className="mt-2 text-gray-700 max-w-md">{user.bio}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <Users className="w-4 h-4" />
                        <span>{user.followers.toLocaleString()} Followers</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <User className="w-4 h-4" />
                        <span>{user.following} Following</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-200 text-orange-800">
                        <BookOpen className="w-4 h-4" />
                        <span>{user.summariesCount} Summaries</span>
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              {user && (
                <div className="mt-4 md:mt-0 md:ml-auto">
                  <Button variant="outline" className="mr-2" onClick={handleEditProfile}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summaries" className="space-y-4">
          <TabsList className="bg-white bg-opacity-70 backdrop-blur-sm">
            <TabsTrigger
              value="summaries"
              className="data-[state=active]:bg-orange-200"
            >
              Summaries
            </TabsTrigger>
            <TabsTrigger
              value="repositories"
              className="data-[state=active]:bg-orange-200"
            >
              Repositories
            </TabsTrigger>
            <TabsTrigger
              value="communities"
              className="data-[state=active]:bg-orange-200"
            >
              Communities
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="data-[state=active]:bg-orange-200"
            >
              Liked
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-orange-200"
            >
              Saved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summaries">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Summaries</CardTitle>
                <CardDescription>Summaries you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {userSummaries.map((summary) => (
                    <SummaryCard
                      key={summary.id}
                      summary={summary}
                      onClick={() => navigateToSummary(summary)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="repositories">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Repositories</CardTitle>
                <CardDescription>
                  Repositories you've created or contributed to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {userRepositories.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repo={repo}
                      onClick={() => navigateToRepository(repo)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="communities">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
                <CardDescription>Communities you're a part of</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {/* Implement community fetching and display logic here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="liked">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Liked Content</CardTitle>
                <CardDescription>
                  Summaries and repositories you've liked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Summaries
                    </h3>
                    {likedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Repositories
                    </h3>
                    {likedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="saved">
            <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Saved Content</CardTitle>
                <CardDescription>
                  Summaries and repositories you've saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Summaries
                    </h3>
                    {savedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Repositories
                    </h3>
                    {savedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}