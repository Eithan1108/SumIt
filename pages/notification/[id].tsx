'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCircle, ExternalLink, UserPlus, ThumbsUp, MessageSquare, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Theme/Header"
import Footer from "@/components/Theme/Footer"
import { fetchUserById, updateUser } from "@/lib/db"

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  summariesCount: number;
  totalLikes: number;
  totalViews: number;
  rate: number;
  status: string;
  likedSummaries: string[];
  savedSummaries: string[];
  likedRepositories: string[];
  savedRepositories: string[];
  followingId: string[];
  followerIds: string[];
  notifications: Notification[];
}

interface Notification {
  id: string;
  date: string;
  read: boolean;
  content: string;
  link: string;
  sender: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'summary';
}

export default function NotificationPage() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const userData = await fetchUserById(id as string)
          if (!userData) {
            throw new Error('User not found')
          }

          const updatedNotifications = userData.notifications.map(notification => ({
            ...notification,
            read: true
          }))

          const updatedUser = {
            ...userData,
            notifications: updatedNotifications
          }

          await updateUser(updatedUser)

          setUser(updatedUser)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-orange-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-orange-50">
        <h1 className="text-2xl font-bold text-orange-800 mb-4">User not found</h1>
        <Link href="/dashboard" className="text-orange-600 hover:text-orange-800">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-5 w-5 text-orange-500" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      case 'mention':
        return <Bell className="h-5 w-5 text-orange-500" />;
      case 'summary':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-orange-500" />;
    }
  };

  const getActionLink = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return (
          <Link 
            href={`/view_user_profile/${notification.sender}?viewerId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Profile
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'like':
        return (
          <Link 
            href={`/${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Liked Summary
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'comment':
        return (
          <Link 
            href={`/${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Comment
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'mention':
        return (
          <Link 
            href={`/view_summary/${notification.link}?viewerId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            View Mention
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      case 'summary':
        return (
          <Link 
            href={`/${notification.link}?userId=${user.id}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
          >
            Read Summary
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Notifications - SumIt</title>
        <meta name="description" content="View your notifications" />
      </Head>

      <div className="min-h-screen bg-orange-50">
        <Header onSearch={() => {}} userId={user.id} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <Link
              href={`/dashboard?userId=${user.id}`}
              className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-orange-800">Your Notifications</h1>
          </div>

          <Card className="mb-8 bg-white bg-opacity-90 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-orange-100">
              <CardTitle className="flex items-center text-orange-800">
                <Bell className="mr-2 h-6 w-6 text-orange-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-orange-300 mb-2" />
                  <p className="text-lg font-medium">You have no notifications.</p>
                </div>
              ) : (
                <ul className="divide-y divide-orange-100">
                  {user.notifications                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      ).map((notification) => (
                    <li key={notification.id} className="p-6 hover:bg-orange-50 transition-colors duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-orange-100 rounded-full p-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-orange-800 text-lg">{notification.sender}</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                              <CheckCircle className="h-3 w-3 mr-1 inline" />
                              Read
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{new Date(notification.date).toLocaleString()}</p>
                          <p className="text-gray-700 mb-3">{notification.content}</p>
                          <div className="flex justify-between items-center">
                            {getActionLink(notification)}
                            <span className="text-xs text-gray-400">{notification.type}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  )
}