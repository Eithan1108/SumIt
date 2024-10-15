"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, FolderPlus, Users, Sparkles, ArrowRight, TrendingUp, Heart, Bookmark } from "lucide-react"
import Header from "../components/Theme/Header";
import Footer from "../components/Theme/Footer";
import { SummaryCard } from "../components/Cards/SummaryCard";
import { CommunityCard } from "../components/Cards/CommunityCard";
import { RepositoryCard } from "../components/Cards/RepositoryCard";
import UserStats from "../components/Theme/UserStats";
import OnboardingTour from "../pages/OnboardingTour";
import {
  fetchUserById,
  fetchSummaries,
  fetchLikedSummaries,
  fetchSavedSummaries,
  fetchRepositories,
  fetchCommunities,
} from "@/lib/db";
import RandomLoadingComponent from '@/components/ui/Loading'


export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    summaries: [],
    repositories: [],
    communities: [],
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("recent");
  const [isNewUser, setIsNewUser] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allSummaries, setAllSummaries] = useState([]);
  const [likedSummaries, setLikedSummaries] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const [
          foundUser,
          summariesData,
          likedData,
          savedData,
          reposData,
          communitiesData,
        ] = await Promise.all([
          userId ? fetchUserById(userId) : null,
          fetchSummaries(),
          userId ? fetchLikedSummaries(userId) : [],
          userId ? fetchSavedSummaries(userId) : [],
          fetchRepositories(),
          fetchCommunities(),
        ]);
        if (userId) {
          setUser(foundUser);
          setIsNewUser(foundUser?.status === "new");
          setLikedSummaries(likedData);
          setSavedSummaries(savedData);
        }
        setAllSummaries(summariesData);
        setRepositories(reposData);
        setCommunities(communitiesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <RandomLoadingComponent />
  }

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowercaseTerm = term.toLowerCase();

    const filteredSummaries = allSummaries.filter(
      (summary) =>
        summary.title.toLowerCase().includes(lowercaseTerm) ||
        summary.author.toLowerCase().includes(lowercaseTerm),
    );

    const filteredRepositories = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(lowercaseTerm) ||
        (repo.description?.toLowerCase() ?? "").includes(lowercaseTerm),
    );

    const filteredCommunities = communities.filter(
      (community) =>
        community.name.toLowerCase().includes(lowercaseTerm) ||
        (community.description?.toLowerCase() ?? "").includes(lowercaseTerm),
    );

    setSearchResults({
      summaries: filteredSummaries,
      repositories: filteredRepositories,
      communities: filteredCommunities,
    });
  };

  const hasSearchResults =
    searchResults.summaries.length > 0 ||
    searchResults.repositories.length > 0 ||
    searchResults.communities.length > 0;

  const navigateToSummary = (summary) => {
    if (user) {
      router.push(`/summary/${summary.id}?userId=${user.id}`);
    }
  };

  const navigateToRepository = (repo) => {
    if (user) {
      router.push(`/repository/${repo.id}?userId=${user.id}`);
    }
  };

  const navigateToCommunity = (community) => {
    router.push(`/community/${community.id}?userId=${user.id}`);
  };

  const onboardingSteps = [
    {
      title: "Welcome to SummaryShare",
      content:
        "Let's take a quick tour to help you get started with our platform. SummaryShare is designed to help you create, share, and collaborate on summaries of various content.",
      target: "body",
      image: "/Images/LandPage.png",
      actionLabel: "Learn More",
      action: () => window.open("https://summaryshare.com/about", "_blank"),
    },
    {
      title: "Create Your First Summary",
      content:
        "Click here to start creating your first summary. You can summarize articles, books, or any content you like. Our AI-powered tools will help you create concise and informative summaries.",
      target: ".create-summary-button",
      image: "/Images/AddSummeryPage.png",
    },
    {
      title: "Track Your Progress",
      content:
        "Check out your stats, including total summaries, views, and likes. Set goals and watch your progress over time.",
      target: ".user-stats-card",
      image: "/Images/StatComponnent.png",
    },
    {
      title: "Search for terms",
      content:
        "Leveraging cutting-edge AI technology, we meticulously analyze your summaries to extract key terms and concepts. Our system then intelligently maps out the connections between these elements, providing you with comprehensive insights and valuable data to enhance your understanding and productivity.",
      target: ".communities-card",
      image: "/Images/SearchTerm2.png",
    },
    {
      title: "Discover Repositories",
      content:
        "Explore and contribute to popular repositories on various topics. Repositories are collections of summaries organized by theme or subject matter.",
      target: ".repositories-card",
      image: "/Images/repoPage.png",
    },
  ];

  const createOptions = [
    {
      name: "Summary",
      icon: FileText,
      color: "bg-orange-500",
      hover: "hover:bg-orange-600",
      path: "/create-summary",
    },
    {
      name: "Repository",
      icon: FolderPlus,
      color: "bg-blue-500",
      hover: "hover:bg-blue-600",
      path: "/create-repository",
    },
    {
      name: "Community",
      icon: Users,
      color: "bg-green-500",
      hover: "hover:bg-green-600",
      path: "/Create_Community",
    },
  ];

  const handleCreate = (path) => {
    router.push(`${path}?userId=${user?.id}`);
    setIsDropdownOpen(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setIsNewUser(false);
  };

  const popularCommunities = communities.filter(
    (community) => community.totalMembers > 400,
  );
  const myCommunities = communities.filter(
    (community) => user && community.members.includes(user.id),
  );

  

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-700">
            Welcome back, {user ? user.name : "User"}
          </h1>
          <div className="relative">
          <Button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Plus className="mr-2 h-5 w-5 inline-block" />
          Create New
        </Button>
        {isDropdownOpen && (
          <Card className="absolute right-0 mt-2 w-48 z-10 shadow-lg">
            <CardContent className="p-2">
              {createOptions.map((option) => (
                <Button
                  key={option.name}
                  onClick={() => handleCreate(option.path)}
                  variant="ghost"
                  className="w-full justify-start mb-1 text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  <option.icon className="mr-2 h-5 w-5" />
                  {option.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
        </div>

        {searchTerm !== "" && (
          <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-700">Search Results for "{searchTerm}"</CardTitle>
            </CardHeader>
            <CardContent>
              {hasSearchResults ? (
                <>
                  {searchResults.summaries.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">
                        Summaries
                      </h3>
                      {searchResults.summaries.map((result) => (
                        <SummaryCard
                          key={result.id}
                          summary={result}
                          onClick={() => navigateToSummary(result)}
                        />
                      ))}
                    </div>
                  )}
                  {searchResults.repositories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">
                        Repositories
                      </h3>
                      {searchResults.repositories.map((result) => (
                        <RepositoryCard
                          key={result.id}
                          repo={result}
                          onClick={() => navigateToRepository(result)}
                        />
                      ))}
                    </div>
                  )}
                  {searchResults.communities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">
                        Communities
                      </h3>
                      {searchResults.communities.map((result) => (
                        <CommunityCard
                          key={result.id}
                          community={result}
                          onClick={() => navigateToCommunity(result)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-orange-600">
                  No results found for "{searchTerm}". Try a different search
                  term.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-orange-700">Your Summaries</CardTitle>
                <Button
                  onClick={() => router.push(`all-summaries?userId=${user?.id}` )}
                  variant="ghost"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4 bg-orange-100 p-1 rounded-lg">
                    <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-orange-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Recent
                    </TabsTrigger>
                    <TabsTrigger value="popular" className="data-[state=active]:bg-white data-[state=active]:text-orange-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Popular
                    </TabsTrigger>
                    <TabsTrigger value="liked" className="data-[state=active]:bg-white data-[state=active]:text-orange-700">
                      <Heart className="w-4 h-4 mr-2" />
                      Liked
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:text-orange-700">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent">
                    {allSummaries && allSummaries.length > 0 ? (
                      allSummaries
                        .sort(
                          (a, b) =>
                            new Date(b.dateCreated).getTime() -
                            new Date(a.dateCreated).getTime()
                        )
                        .slice(0, 3)
                        .map((summary) => (
                          <SummaryCard
                            key={summary.id}
                            summary={summary}
                            onClick={() => navigateToSummary(summary)}
                          />
                        ))
                    ) : (
                      <p className="text-orange-600">No recent summaries available.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="popular">
                    {allSummaries && allSummaries.length > 0 ? (
                      allSummaries
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 3)
                        .map((summary) => (
                          <SummaryCard
                            key={summary.id}
                            summary={summary}
                            onClick={() => navigateToSummary(summary)}
                          />
                        ))
                    ) : (
                      <p className="text-orange-600">No popular summaries available.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="liked">
                    {isLoading ? (
                      <p className="text-orange-600">Loading liked summaries...</p>
                    ) : likedSummaries && likedSummaries.length > 0 ? (
                      likedSummaries.map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={() => navigateToSummary(summary)}
                        />
                      ))
                    ) : (
                      <p className="text-orange-600">No liked summaries available.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="saved">
                    {savedSummaries && savedSummaries.length > 0 ? (
                      savedSummaries.map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={() => navigateToSummary(summary)}
                        />
                      ))
                    ) : (
                      <p className="text-orange-600">No saved summaries available.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-orange-700">Popular Repositories</CardTitle>
                <Button
                  onClick={() => router.push(`all-repositories?userId=${user?.id}` )}
                  variant="ghost"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {repositories.length > 0 ? (
                  repositories
                    .sort((a, b) => b.stars - a.stars)
                    .slice(0, 3)
                    .map((repo) => (
                      <RepositoryCard
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigateToRepository(repo)}
                      />
                    ))
                ) : (
                  <p className="text-orange-600">
                    No popular repositories available at the moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <p className="text-orange-600">Loading user stats...</p>
                </CardContent>
              </Card>
            ) : user ? (
              <UserStats user={user} />
            ) : (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <p className="text-orange-600">User stats not available</p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-700">Popular Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {popularCommunities && popularCommunities.length > 0 ? (
                  popularCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onClick={() => navigateToCommunity(community)}
                    />
                  ))
                ) : (
                  <p className="text-orange-600">
                    No popular communities available at the moment.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-700">My Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {myCommunities && myCommunities.length > 0 ? (
                  myCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onClick={() => navigateToCommunity(community)}
                    />
                  ))
                ) : (
                  <p className="text-orange-600">
                    You haven't joined any communities yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      {isNewUser && (
        <OnboardingTour
          steps={onboardingSteps}
          onComplete={handleOnboardingComplete}
          theme="light"
        />
      )}
    </div>
  );
}
