import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Users, User, BookOpen, Edit, Settings, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SummaryCard } from '@/components/Cards/SummaryCard'
import { RepositoryCard } from '@/components/Cards/RepositoryCard'
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchUserByUsername, fetchUserById, fetchSummariesByOwnerId, fetchUserRepositories, followUser, unfollowUser } from "@/lib/db"

interface User {
  id: string
  name: string
  username: string
  avatar: string
  totalLikes: number
  totalViews: number
  followers: number
  following: number
  bio: string
  summariesCount: number
  followingId: string[]
  followerIds: string[]
  likedSummaries: string[]
  savedSummaries: string[]
  likedRepositories: string[]
  savedRepositories: string[]
  rate: number
  status: string
}

interface Summary {
  id: string
  title: string
  description: string
  likes: number
  views: number
  dateCreated: string
}

interface Repo {
  id: string
  name: string
  description: string
  likes: number
  views: number
}

export default function ViewUserProfile() {
  const router = useRouter()
  const { id, viewerId } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [userSummaries, setUserSummaries] = useState<Summary[]>([])
  const [userRepos, setUserRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (id && viewerId) {
        setIsLoading(true)
        try {
          const [userData, viewerData] = await Promise.all([
            fetchUserByUsername(id as string),
            fetchUserById(viewerId as string)
          ])
          setUser(userData)
          setViewingUser(viewerData)
          if (viewerData && userData) {
            setIsFollowing(viewerData.followingId.includes(userData.id))
          }

          const summariesData = await fetchSummariesByOwnerId(userData?.id as string)
          setUserSummaries(summariesData)

          const reposData = await fetchUserRepositories(userData?.id as string)
          setUserRepos(reposData)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()
  }, [id, viewerId])

  function handleSearch() {
    // Implement search functionality here
  }

  const handleSummaryClick = (summaryId: string) => {
    router.push(`/summary/${summaryId}?userId=${viewerId}`)
  }

  const handleRepoClick = (repoId: string) => {
    router.push(`/repo/${repoId}?userId=${viewerId}`)
  }

  const handleFollowToggle = async () => {
    if (user && viewingUser) {
      try {
        if (isFollowing) {
          const { follower: updatedFollower, unfollowedUser } = await unfollowUser(user.id, viewingUser.id)
          setUser(unfollowedUser)
          setViewingUser(updatedFollower)
        } else {
          const { follower: updatedFollower, followedUser } = await followUser(user.id, viewingUser.id)
          setUser(followedUser)
          setViewingUser(updatedFollower)
        }
        setIsFollowing(!isFollowing)
      } catch (error) {
        console.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user:`, error)
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user || !viewingUser) {
    return <div className="flex justify-center items-center h-screen">User not found</div>
  }

  return (
    <>
      <Head>
        <title>{user.name}&apos;s Profile</title>
        <meta name="description" content={`View ${user.name}'s profile, summaries, and repositories`} />
      </Head>

      <div className="min-h-screen bg-orange-50">
        <Header onSearch={handleSearch} userId={viewingUser.id} />

        <main className="container mx-auto px-4 py-8">
          <Link
            href={`/dashboard?userId=${viewerId}`}
            className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <Card className="mb-8 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="w-24 h-24 border-4 border-orange-200 shadow-md">
                  <AvatarImage src={user.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
                  <AvatarFallback className="bg-orange-300 text-orange-800 text-2xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-orange-800">{user.name}</h1>
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
                </div>
                <div className="mt-4 md:mt-0 md:ml-auto">
                  {user.id === viewingUser.id ? (
                    <>
                      <Button variant="outline" className="mr-2">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className={`transition-colors duration-200 ${
                        isFollowing 
                          ? 'bg-white hover:bg-gray-100 text-orange-500 border border-orange-500' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {user.id !== viewingUser.id && (
            <div className="mb-6 bg-orange-100 rounded-lg p-4">
              <p className="text-orange-800">You are viewing this profile as: {viewingUser.name} (@{viewingUser.username})</p>
            </div>
          )}

          <Tabs defaultValue="summaries" className="space-y-4">
            <TabsList className="bg-white bg-opacity-70 backdrop-blur-sm">
              <TabsTrigger value="summaries" className="data-[state=active]:bg-orange-200">Summaries</TabsTrigger>
              <TabsTrigger value="repos" className="data-[state=active]:bg-orange-200">Repositories</TabsTrigger>
              <TabsTrigger value="followers" className="data-[state=active]:bg-orange-200">Followers</TabsTrigger>
            </TabsList>
            <TabsContent value="summaries">
              <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>User Summaries</CardTitle>
                  <CardDescription>Summaries created by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => handleSummaryClick(summary.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="repos">
              <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>User Repositories</CardTitle>
                  <CardDescription>Repositories created by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userRepos.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => handleRepoClick(repo.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="followers">
              <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Followers</CardTitle>
                  <CardDescription>Users following {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.followerIds.map((followerId) => (
                      <div key={followerId} className="p-2 bg-orange-100 rounded-md">
                        <Link href={`/view_user_profile/${followerId}?viewerId=${viewerId}`} className="text-orange-600 hover:text-orange-800">
                          {followerId}
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </>
  )
}