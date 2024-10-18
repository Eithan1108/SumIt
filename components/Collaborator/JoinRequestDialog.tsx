'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchUserById, acceptJoinRequest, rejectJoinRequest } from "@/lib/db"
import { Community, User } from "@/lib/types"

interface JoinRequestsDialogProps {
  isOpen: boolean
  onClose: () => void
  community: Community
  onUpdateCommunity: (updatedCommunity: Community) => void
}

export function JoinRequestDialog({
  isOpen,
  onClose,
  community,
  onUpdateCommunity
}: JoinRequestsDialogProps) {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPendingUsers = async () => {
      setIsLoading(true)
      try {
        const users = await Promise.all(
          (community.pendingMembers || []).map(id => fetchUserById(id))
        )
        setPendingUsers(users.filter(Boolean) as User[])
      } catch (error) {
        console.error("Error fetching pending users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchPendingUsers()
    }
  }, [isOpen, community.pendingMembers])

  const handleAccept = async (userId: string) => {
    try {
      const updatedCommunity = await acceptJoinRequest(community.id, userId, community.admins[0])
      onUpdateCommunity(updatedCommunity)
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    } catch (error) {
      console.error("Error accepting join request:", error)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const updatedCommunity = await rejectJoinRequest(community.id, userId, community.admins[0])
      onUpdateCommunity(updatedCommunity)
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    } catch (error) {
      console.error("Error rejecting join request:", error)
    }
  }

  const handleAcceptAll = async () => {
    try {
      const results = await Promise.all(pendingUsers.map(user => 
        acceptJoinRequest(community.id, user.id, community.admins[0])
      ))
      const updatedCommunity = results[results.length - 1] // Get the last updated community state
      if (updatedCommunity) {
        onUpdateCommunity(updatedCommunity)
        setPendingUsers([])
      } else {
        console.error("Failed to get updated community after accepting all requests")
      }
    } catch (error) {
      console.error("Error accepting all join requests:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-4 font-bold text-orange-800">Join Requests</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <p className="text-center text-gray-500 my-8">No pending join requests.</p>
        ) : (
          <>
            <Button
              onClick={handleAcceptAll}
              className=" mb-4 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Accept All ({pendingUsers.length})
            </Button>
            <div className="max-h-[300px] overflow-y-auto pr-4">
              <ul className="space-y-4">
                {pendingUsers.map(user => (
                  <li key={user.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-orange-200 text-orange-800">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-orange-800">{user.name}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleAccept(user.id)}
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(user.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}