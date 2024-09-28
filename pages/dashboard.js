"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import Header from "../components/Theme/Header";
import Footer from "../components/Theme/Footer";
import { communities } from "@/lib/mockData";
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
} from "@/lib/db";

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

  const popularCommunities = communities.filter(
    (community) => community.members > 4000,
  );
  const myCommunities = communities.filter((community) => community.role);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const [foundUser, summariesData, likedData, savedData, reposData] =
          await Promise.all([
            userId ? fetchUserById(userId) : null,
            fetchSummaries(),
            userId ? fetchLikedSummaries(userId) : [],
            userId ? fetchSavedSummaries(userId) : [],
            fetchRepositories(),
          ]);
        if (userId) {
          setUser(foundUser);
          setIsNewUser(foundUser?.status === "new");
          setLikedSummaries(likedData);
          setSavedSummaries(savedData);
        }
        setAllSummaries(summariesData);
        setRepositories(reposData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    router.push({
      pathname: `/community/${community.id}`,
      query: { community: JSON.stringify(community) },
    });
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

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setIsNewUser(false);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch} userId={user?.id} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-700">
            Welcome back, {user ? user.name : "User"}
          </h1>
          <Link href={`/create-summary?userId=${user?.id}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 create-summary-button">
              <Plus className="mr-2 h-4 w-4" /> Create New Summary
            </Button>
          </Link>
        </div>

        {searchTerm !== "" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results for "{searchTerm}"</CardTitle>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="liked">Liked</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="recent">
                  {allSummaries && allSummaries.length > 0 ? (
                    allSummaries
                      .sort(
                        (a, b) =>
                          new Date(b.dateCreated).getTime() -
                          new Date(a.dateCreated).getTime(),
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
                    <p>No recent summaries available.</p>
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
                    <p>No popular summaries available.</p>
                  )}
                </TabsContent>

                <TabsContent value="liked">
                  {isLoading ? (
                    <p>Loading liked summaries...</p>
                  ) : likedSummaries && likedSummaries.length > 0 ? (
                    likedSummaries.map((summary) => (
                      <SummaryCard
                        key={summary.id}
                        summary={summary}
                        onClick={() => navigateToSummary(summary)}
                      />
                    ))
                  ) : (
                    <p>No liked summaries available.</p>
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
                    <p>No saved summaries available.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p>Loading user stats...</p>
              </CardContent>
            </Card>
          ) : user ? (
            <UserStats user={user} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p>User stats not available</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Popular Communities</CardTitle>
            </CardHeader>
            <CardContent>
              {popularCommunities && popularCommunities.length > 0 ? (
                popularCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))
              ) : (
                <p className="text-orange-600">
                  No popular communities available at the moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Communities</CardTitle>
            </CardHeader>
            <CardContent>
              {myCommunities && myCommunities.length > 0 ? (
                myCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))
              ) : (
                <p className="text-orange-600">
                  You haven't joined any communities yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Repositories</CardTitle>
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
      </main>
      <Footer />
      {
        <OnboardingTour
          steps={onboardingSteps}
          onComplete={handleOnboardingComplete}
          theme="light"
        />
      }
    </div>
  );
}