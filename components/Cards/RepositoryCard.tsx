import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Star, Bookmark } from "lucide-react"

interface RepositoryCardProps {
  repo: {
    id: string
    name: string
    description: string
    stars: number
  }
  onClick: (repo: any) => void
  showBookmark?: boolean
}

export function RepositoryCard({ repo, onClick, showBookmark = false }: RepositoryCardProps) {
  return (
    <Card
      className="mb-4 cursor-pointer hover:bg-orange-100"
      onClick={() => onClick(repo)}
    >
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-orange-700 mb-2">
          {repo.name}
        </h3>
        <p className="text-sm text-orange-600 mb-3">
          {repo.description}
        </p>
        <div className="flex items-center text-sm text-orange-500">
          {showBookmark ? (
            <>
              <Bookmark className="mr-1 h-4 w-4" />
              <span className="mr-4">Saved</span>
            </>
          ) : (
            <>
              <Star className="mr-1 h-4 w-4" />
              <span>{repo.stars} stars</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}