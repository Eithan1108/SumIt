import Link from 'next/link'
import { Calendar, ThumbsUp, Eye, Users, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Owner {
  id: string
  name: string
  username: string
  avatar: string
  totalLikes: number
  totalViews: number
  followers: number
  bio?: string
}

interface OwnerCardProps {
  owner: Owner
  viewingUserId: string
}

export default function OwnerCard({ owner, viewingUserId }: OwnerCardProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={owner.avatar} alt={owner.name} />
            <AvatarFallback className="bg-orange-300 text-orange-800 text-3xl font-bold">
              {owner.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-orange-800">{owner.name}</h3>
            <p className="text-md text-orange-600 font-medium">@{owner.username}</p>
            {owner.bio && (
              <p className="mt-2 text-sm text-gray-600 max-w-md">{owner.bio}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-4 mt-4 sm:mt-0">
          <StatItem icon={ThumbsUp} value={owner.totalLikes} label="Likes" />
          <StatItem icon={Eye} value={owner.totalViews} label="Views" />
          <StatItem icon={Users} value={owner.followers} label="Followers" />
        </div>
      </div>
      <div className="mt-6 text-center sm:text-right">
        <Link 
          href={`/view_user_profile/${owner.username}?viewerId=${viewingUserId}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
        >
          View Full Profile
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: React.ElementType
  value: number
  label: string
}

function StatItem({ icon: Icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded-lg p-3 shadow-sm">
      <Icon className="w-6 h-6 text-orange-500 mb-1" />
      <p className="text-lg font-bold text-orange-800">{value.toLocaleString()}</p>
      <p className="text-xs text-orange-600">{label}</p>
    </div>
  )
}