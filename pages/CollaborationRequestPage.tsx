'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, X } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "@/components/Theme/Footer"
import { fetchCollaborationRequest, acceptCollaboration, rejectCollaboration } from '@/lib/db'
import { Repository, User } from '../lib/types'

export default function CollaborationRequestPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [inviter, setInviter] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const repoId = params?.repoId as string
      const userId = searchParams?.get('userId')
      if (!repoId || !userId) {
        setError('Invalid URL parameters')
        setLoading(false)
        return
      }

      try {
        const { repository, inviter } = await fetchCollaborationRequest(repoId, userId)
        setRepo(repository)
        setInviter(inviter)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, searchParams])

  const handleAccept = async () => {
    if (!repo || !inviter) return
    try {
      await acceptCollaboration(repo.id, inviter.id)
      // Show success message and redirect
    } catch (err) {
      console.error("Error accepting collaboration:", err)
      setError('Failed to accept collaboration. Please try again.')
    }
  }

  const handleReject = async () => {
    if (!repo || !inviter) return
    try {
      await rejectCollaboration(repo.id, inviter.id)
      // Show success message and redirect
    } catch (err) {
      console.error("Error rejecting collaboration:", err)
      setError('Failed to reject collaboration. Please try again.')
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4 bg-orange-50">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-orange-50">Error: {error}</div>
  }

  if (!repo || !inviter) {
    return <div className="container mx-auto p-4 bg-orange-50">Collaboration request not found</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={() => {}} userId={searchParams?.get('userId') || ''} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link
          href={`/dashboard?userId=${searchParams?.get('userId')}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-600">Collaboration Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {inviter.name} has invited you to collaborate on the repository "{repo.name}".
            </p>
            <div className="flex space-x-4">
              <Button onClick={handleAccept} className="bg-green-500 hover:bg-green-600 text-white">
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}