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
import { summaries, communities, repositories, currentUser } from "@/lib/mockData";
import { SummaryCard } from "../components/Cards/SummaryCard";
import { CommunityCard } from "../components/Cards/CommunityCard";
import { RepositoryCard } from "../components/Cards/RepositoryCard";
import UserStats from "../components/Theme/UserStats"
import OnboardingTour from "../pages/OnboardingTour";
import AddSummeryPageImage from "../public/Images/AddSummeryPage.png"

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
  

  const popularCommunities = communities.filter(
    (community) => community.members > 4000,
  );
  const myCommunities = communities.filter((community) => community.role);
  const allSummaries = summaries;
  const popularRepositories = repositories.filter((repo) => repo.stars > 96);

  useEffect(() => {
    const hasCompletedOnboarding = (currentUser.status == "new")
    setIsNewUser(hasCompletedOnboarding);
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowercaseTerm = term.toLowerCase();
  
    const filteredSummaries = allSummaries.filter(
      (summary) =>
        summary.title.toLowerCase().includes(lowercaseTerm) ||
        summary.author.toLowerCase().includes(lowercaseTerm)
    );
  
    const filteredRepositories = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(lowercaseTerm) ||
        (repo.description?.toLowerCase() ?? "").includes(lowercaseTerm)
    );
  
    const filteredCommunities = communities.filter(
      (community) =>
        community.name.toLowerCase().includes(lowercaseTerm) ||
        (community.description?.toLowerCase() ?? "").includes(lowercaseTerm)
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

  const navigateToRepository = (repo) => {
    // router.push(`/repository/${id}`);
    router.push({
      pathname: `/repository/${repo.id}`,
      query: { repo: JSON.stringify(repo) },
    });
  };

  const onboardingSteps = [
    {
      title: "Welcome to SummaryShare",
      content: "Let's take a quick tour to help you get started with our platform. SummaryShare is designed to help you create, share, and collaborate on summaries of various content.",
      target: "body",
      image: "/Images/LandPage.png",
      actionLabel: "Learn More",
      action: () => window.open("https://summaryshare.com/about", "_blank")
    },
    {
      title: "Create Your First Summary",
      content: "Click here to start creating your first summary. You can summarize articles, books, or any content you like. Our AI-powered tools will help you create concise and informative summaries.",
      target: ".create-summary-button",
      image: "/Images/AddSummeryPage.png"
    },
    {
      title: "Track Your Progress",
      content: "Check out your stats, including total summaries, views, and likes. Set goals and watch your progress over time.",
      target: ".user-stats-card",
      image: "/Images/StatComponnent.png"
    },
    {
      title: "Serch for terms",
      content: "Leveraging cutting-edge AI technology, we meticulously analyze your summaries to extract key terms and concepts. Our system then intelligently maps out the connections between these elements, providing you with comprehensive insights and valuable data to enhance your understanding and productivity.",
      target: ".communities-card",
      image: "/Images/SearchTerm2.png"
    },
    {
      title: "Discover Repositories",
      content: "Explore and contribute to popular repositories on various topics. Repositories are collections of summaries organized by theme or subject matter.",
      target: ".repositories-card",
      image: "/Images/repoPage.png"
    }
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsNewUser(false);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Header onSearch={handleSearch}/>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-700">
            Welcome back, {currentUser.name}
          </h1>
          <Link href="/create-summary">
            <Button className="bg-orange-500 hover:bg-orange-600">
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
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">Summaries</h3>
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
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">Repositories</h3>
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
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">Communities</h3>
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
                <p className="text-orange-600">No results found for "{searchTerm}". Try a different search term.</p>
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
                      ) // Sort by most recent date
                      .slice(0, 3) // Get the 3 most recent summaries
                      .map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={() => navigateToSummary(summary)} // Pass the summary to navigate
                        />
                      ))
                  ) : (
                    <p>No recent summaries available.</p>
                  )}
                </TabsContent>

                <TabsContent value="popular">
                  {allSummaries && allSummaries.length > 0 ? (
                    allSummaries
                      .sort((a, b) => b.views - a.views) // Sort by views (most to least)
                      .slice(0, 3) // Take the top 3 summaries based on views
                      .map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={() => navigateToSummary(summary)} // Pass the summary to navigate
                        />
                      ))
                  ) : (
                    <p>No popular summaries available.</p>
                  )}
                </TabsContent>

                <TabsContent value="liked">
                  {allSummaries && allSummaries.length > 0 ? (
                    allSummaries
                      .sort((a, b) => b.likes - a.likes) // Sort by likes (most to least)
                      .slice(0, 3) // Take the top 3 summaries based on likes
                      .map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={() => navigateToSummary(summary)} // Pass the summary to navigate
                        />
                      ))
                  ) : (
                    <p>No liked summaries available.</p>
                  )}
                </TabsContent>

                <TabsContent value="saved">
                  {allSummaries && allSummaries.length > 0 ? (
                    allSummaries
                      .slice(0, 3)
                      .map((summary) => (
                        <SummaryCard
                          key={summary.id}
                          summary={summary}
                          onClick={navigateToSummary}
                        />
                      ))
                  ) : (
                    <p>No saved summaries available.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <UserStats user={currentUser} />
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
              {false ? (
                <p>Loading...</p>
              ) : popularRepositories.length > 0 ? (
                popularRepositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repo={repo}
                    onClick={navigateToRepository}
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
      <OnboardingTour 
        steps={onboardingSteps} 
        onComplete={handleOnboardingComplete}
        theme="light"
      /></div>
  );
}
