import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Users, User } from "lucide-react"

interface CommunityCardProps {
  community: {
    id: string
    name: string
    description?: string
    members: number
    role?: string
  }
  onClick?: (community: any) => void
}

export function CommunityCard({ community, onClick }: CommunityCardProps) {
  return (
    <Card
      className="mb-4 cursor-pointer hover:bg-orange-100"
      onClick={() => onClick && onClick(community)}
    >
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-orange-700 mb-2">
          {community.name}
        </h3>
        {community.description && (
          <p className="text-sm text-orange-600 mb-3">
            {community.description}
          </p>
        )}
        <div className="flex items-center text-sm text-orange-500">
          <Users className="mr-1 h-4 w-4" />
          <span className="mr-4">{community.members} members</span>
          {community.role && (
            <>
              <User className="mr-1 h-4 w-4" />
              <span>{community.role}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}