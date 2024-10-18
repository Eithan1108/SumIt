'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { acceptCollaboration, rejectCollaboration, fetchRepositoryById } from "@/lib/db"
import { Repository, User } from "@/lib/types"

interface CollaborationRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  repository: Repository
  inviter: User
  currentUserId: string
}

export function CollaborationRequestDialog({
  isOpen,
  onClose,
  repository,
  inviter,
  currentUserId
}: CollaborationRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [collaborationStatus, setCollaborationStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null)

  useEffect(() => {
    const checkCollaborationStatus = async () => {
      if (isOpen) {
        const updatedRepo = await fetchRepositoryById(repository.id)
        if (updatedRepo) {
          if (updatedRepo.collaborators.includes(currentUserId)) {
            setCollaborationStatus('accepted')
          } else if (updatedRepo.pendingCollaborators.includes(currentUserId)) {
            setCollaborationStatus('pending')
          } else {
            setCollaborationStatus(null)
          }
        }
      }
    }

    checkCollaborationStatus()
  }, [isOpen, repository.id, currentUserId])

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptCollaboration(repository.id, currentUserId)
      setCollaborationStatus('accepted')
    } catch (error) {
      console.error("Error accepting collaboration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await rejectCollaboration(repository.id, currentUserId)
      setCollaborationStatus('rejected')
    } catch (error) {
      console.error("Error rejecting collaboration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Collaboration Request</DialogTitle>
          <DialogDescription>
            {inviter.username} has invited you to collaborate on the repository "{repository.name}".
          </DialogDescription>
        </DialogHeader>
        {collaborationStatus === 'pending' && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={handleReject} variant="destructive" disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleAccept} disabled={isLoading}>
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        )}
        {collaborationStatus === 'accepted' && (
          <div className="text-center text-green-600 mt-4">
            You have already accepted this collaboration request.
          </div>
        )}
        {collaborationStatus === 'rejected' && (
          <div className="text-center text-red-600 mt-4">
            You have already rejected this collaboration request.
          </div>
        )}
        {collaborationStatus === null && (
          <div className="text-center text-gray-600 mt-4">
            This collaboration request is no longer valid.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}