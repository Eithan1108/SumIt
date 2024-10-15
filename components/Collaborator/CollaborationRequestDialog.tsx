'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { acceptCollaboration, rejectCollaboration } from "@/lib/db"
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

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptCollaboration(repository.id, currentUserId)
      onClose()
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
      onClose()
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
      </DialogContent>
    </Dialog>
  )
}