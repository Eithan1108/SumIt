import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Clock, TrendingUp, Star, Heart, Bookmark } from "lucide-react"

interface SummaryCardProps {
  summary: {
    id: string
    title: string
    description: string // Added description to the summary interface
    dateCreated?: string
    views: number
    likes: number
  }
  onClick: (summary: any) => void
  showBookmark?: boolean
}

export function SummaryCard({ summary, onClick, showBookmark = false }: SummaryCardProps) {
  return (
    <Card
      className="mb-4 cursor-pointer hover:bg-orange-100"
      onClick={() => onClick(summary)}
    >
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-orange-700 mb-2">
          {summary.title}
        </h3>
        <p className="text-sm text-orange-600 mb-3">
          {summary.description}
        </p>
        <div className="flex items-center text-sm text-orange-600">
          {summary.dateCreated && (
            <>
              <Clock className="mr-1 h-4 w-4" />
              <span className="mr-4">{summary.dateCreated}</span>
            </>
          )}
          <TrendingUp className="mr-1 h-4 w-4" />
          <span className="mr-4">{summary.views} views</span>
          {showBookmark ? (
            <>
              <Bookmark className="mr-1 h-4 w-4" />
              <span className="mr-4">Saved</span>
            </>
          ) : (
            <>
              <Star className="mr-1 h-4 w-4" />
              <span>{summary.likes} likes</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}