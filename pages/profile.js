"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Star,
  TrendingUp,
  Clock,
  Edit,
  Settings,
  Heart,
  Bookmark,
  BookOpen,
  Search,
  Bell,
  User,
  ArrowLeft,
} from "lucide-react";
import Header from "../components/Theme/Header";
import Footer from "../components/Theme/Footer";
import {
  currentUser,
  summaries,
  repositories,
  communities,
} from "@/lib/mockData";
import { SummaryCard } from "../components/Cards/SummaryCard";
import { CommunityCard } from "../components/Cards/CommunityCard";
import { RepositoryCard } from "../components/Cards/RepositoryCard";

export default function ProfilePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching in profile:", searchTerm);
    // Implement search functionality here
  };

  const navigateToRepository = (repo) => {
    // router.push(`/repository/${id}`);
    router.push({
      pathname: `/repository/${repo.id}`,
      query: { repo: JSON.stringify(repo) },
    });
  };

  const navigateToSummary = (summary) => {
    // router.push({
    //   pathname: `/summary/${summary.id}`,
    //   query: { summary: JSON.stringify(summary) },
    // });
    router.push({
      pathname: `/summary/${summary.id}`,
      query: {
        summary: JSON.stringify(summary),
      },
    });
  };

  const renderRepository = (repo, isSaved = false) => (
    <div
      key={repo.id}
      className="mb-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-orange-100"
      onClick={() => navigateToRepository(repo.id)}
    >
      <h3 className="text-lg font-semibold text-orange-700">{repo.name}</h3>
      <p className="text-sm text-orange-600">{repo.description}</p>
      <div className="flex items-center mt-2 text-xs text-orange-500">
        {isSaved && (
          <span className="flex items-center mr-4">
            <Bookmark className="w-3 h-3 mr-1" /> Saved
          </span>
        )}
        <span className="flex items-center">
          <Star className="w-3 h-3 mr-1" /> {repo.stars}
        </span>
      </div>
    </div>
  );

  const userSummaries = summaries;
  const likedSummaries = summaries
    .filter((summary) => summary.likes > 100)
    .slice(0, 2);
  const savedSummaries = summaries
    .filter((summary) => summary.views > 1000)
    .slice(0, 2);
  const userRepositories = repositories.slice(0, 3);
  const likedRepositories = repositories
    .filter((repo) => repo.stars > 100)
    .slice(0, 2);
  const savedRepositories = repositories
    .filter((repo) => repo.stars > 50)
    .slice(0, 2);
  const userCommunities = communities.slice(0, 3);

  return (
    <div className="min-h-screen bg-orange-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4 md:mb-0 md:mr-6">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-orange-700">
                  {currentUser.name}
                </h1>
                <p className="text-orange-600">@{currentUser.username}</p>
                <p className="mt-2 text-orange-800">{currentUser.bio}</p>
                <div className="flex justify-center md:justify-start mt-4 space-x-4 text-orange-600">
                  <span>{currentUser.followers} Followers</span>
                  <span>{currentUser.following} Following</span>
                  <span>{currentUser.summariesCount} Summaries</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <Button variant="outline" className="mr-2">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summaries" className="space-y-4">
          <TabsList className="bg-orange-100">
            <TabsTrigger
              value="summaries"
              className="data-[state=active]:bg-orange-200"
            >
              Summaries
            </TabsTrigger>
            <TabsTrigger
              value="repositories"
              className="data-[state=active]:bg-orange-200"
            >
              Repositories
            </TabsTrigger>
            <TabsTrigger
              value="communities"
              className="data-[state=active]:bg-orange-200"
            >
              Communities
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="data-[state=active]:bg-orange-200"
            >
              Liked
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-orange-200"
            >
              Saved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summaries">
            <Card>
              <CardHeader>
                <CardTitle>My Summaries</CardTitle>
                <CardDescription>Summaries you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {userSummaries.map((summary) => (
                    <SummaryCard
                      key={summary.id}
                      summary={summary}
                      onClick={() => navigateToSummary(summary)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="repositories">
            <Card>
              <CardHeader>
                <CardTitle>My Repositories</CardTitle>
                <CardDescription>
                  Repositories you've created or contributed to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {userRepositories.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repo={repo}
                      onClick={() => navigateToRepository(repo)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="communities">
            <Card>
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
                <CardDescription>Communities you're a part of</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  {userCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onClick={() => navigateToCommunity(community)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="liked">
            <Card>
              <CardHeader>
                <CardTitle>Liked Content</CardTitle>
                <CardDescription>
                  Summaries and repositories you've liked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Summaries
                    </h3>
                    {likedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Liked Repositories
                    </h3>
                    {likedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Content</CardTitle>
                <CardDescription>
                  Summaries and repositories you've saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Summaries
                    </h3>
                    {savedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-orange-700 mb-4">
                      Saved Repositories
                    </h3>
                    {savedRepositories.map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
