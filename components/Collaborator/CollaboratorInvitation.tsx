import React from 'react'
import { Button } from "@/components/ui/button"
import { X, UserMinus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CollaboratorInvitationProps {
  collaborators: string[]
  pendingCollaborators: string[]
  onRemoveCollaborator: (userId: string) => void
  onCancelInvitation: (userId: string) => void
}

export const CollaboratorInvitation: React.FC<CollaboratorInvitationProps> = ({
  collaborators,
  pendingCollaborators,
  onRemoveCollaborator,
  onCancelInvitation
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700">Current Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length > 0 ? (
            <ul className="space-y-3">
              {collaborators.map((userId) => (
                <li key={userId} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userId}`} />
                      <AvatarFallback>{userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-orange-800">{userId}</span>
                  </div>
                  <Button
                    onClick={() => onRemoveCollaborator(userId)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No current collaborators</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700">Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCollaborators.length > 0 ? (
            <ul className="space-y-3">
              {pendingCollaborators.map((userId) => (
                <li key={userId} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userId}`} />
                      <AvatarFallback>{userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-orange-800">{userId}</span>
                  </div>
                  <Button onClick={() => onCancelInvitation(userId)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Invitation
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No pending invitations</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}