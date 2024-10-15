// This file contains all database-related operations
import { User, Community, Summary, Repository, Notification, Comment, NeuronGraph, RepositoryItem, RepositoryFolder } from './types'


  
  const mockApiUrl = 'http://localhost:5000/users';
  
  export async function fetchUsers(): Promise<User[]> {
    const response = await fetch(mockApiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData = await response.json();
    return Array.isArray(userData) ? userData : Object.values(userData);
  }
  
  export async function createUser(newUser: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(mockApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    if (!response.ok) {
      throw new Error('Failed to create new user');
    }
    return await response.json();
  }
  
  export function findUserByUsername(users: User[], username: string): User | undefined {
    return users.find((user) => user.username === username);
  }
  
  export function isUsernameTaken(users: User[], username: string): boolean {
    return users.some((user) => user.username === username);
  }
  
  export async function fetchUserById(userId: string): Promise<User | null> {
    try {
      const users = await fetchUsers();
      const foundUser = users.find((u) => u.id === userId);
      return foundUser || null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  export async function fetchSummaries(): Promise<Summary[]> {
    const response = await fetch('http://localhost:5000/summeries');
    if (!response.ok) {
      throw new Error('Failed to fetch summaries');
    }
    return await response.json();
  }

  export async function fetchLikedSummaries(userId: string): Promise<Summary[]> {
    const response = await fetch(`http://localhost:5000/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData: User = await response.json();
    const summariesResponse = await fetch('http://localhost:5000/summeries');
    if (!summariesResponse.ok) {
      throw new Error('Failed to fetch summaries');
    }
    const allSummaries: Summary[] = await summariesResponse.json();
    return allSummaries.filter(summary => userData.likedSummaries.includes(summary.id));
  }
  
  export async function fetchSavedSummaries(userId: string): Promise<Summary[]> {
    const response = await fetch(`http://localhost:5000/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData: User = await response.json();
    const summariesResponse = await fetch('http://localhost:5000/summeries');
    if (!summariesResponse.ok) {
      throw new Error('Failed to fetch summaries');
    }
    const allSummaries: Summary[] = await summariesResponse.json();
    return allSummaries.filter(summary => userData.savedSummaries.includes(summary.id));
  }

  export async function fetchLikedRepositories(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData: User = await response.json();
      const reposResponse = await fetch('http://localhost:5000/repositories');
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await reposResponse.json();
      return allRepositories.filter(repo => userData.likedRepositories.includes(repo.id));
    } catch (error) {
      console.error('Error fetching liked repositories:', error);
      throw error;
    }
  }
  
  export async function fetchSavedRepositories(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData: User = await response.json();
      const reposResponse = await fetch('http://localhost:5000/repositories');
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await reposResponse.json();
      return allRepositories.filter(repo => userData.savedRepositories.includes(repo.id));
    } catch (error) {
      console.error('Error fetching saved repositories:', error);
      throw error;
    }
  }

  export async function fetchRepositories(): Promise<Repository[]> {
    try {
      const response = await fetch('http://localhost:5000/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const repositories: Repository[] = await response.json();
      return repositories;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }
  
  export async function fetchRepositoryById(id: string): Promise<Repository | null> {
    try {
      const repositories = await fetchRepositories();
      const repository = repositories.find(repo => repo.id === id);
      return repository || null;
    } catch (error) {
      console.error(`Error fetching repository with id ${id}:`, error);
      throw error;
    }
  }
  
  function findItemInFolder(folder: RepositoryFolder, itemId: string): RepositoryItem | null {
    for (const item of folder.items) {
      if ('title' in item && item.id === itemId) {
        return item as RepositoryItem;
      } else if ('items' in item) {
        const foundItem = findItemInFolder(item as RepositoryFolder, itemId);
        if (foundItem) return foundItem;
      }
    }
    return null;
  }
  
  export async function fetchRepositoryItem(repoId: string, itemId: string): Promise<RepositoryItem | null> {
    try {
      const repository = await fetchRepositoryById(repoId);
      if (!repository) return null;
  
      return findItemInFolder(repository.rootFolder, itemId);
    } catch (error) {
      console.error(`Error fetching item ${itemId} from repository ${repoId}:`, error);
      throw error;
    }
  }

  export async function fetchSummariesByOwnerId(userId: string): Promise<Summary[]> {
    try {
      const response = await fetch('http://localhost:5000/summeries');
      if (!response.ok) {
        throw new Error('Failed to fetch summaries');
      }
      const allSummaries: Summary[] = await response.json();
      return allSummaries.filter(summary => summary.owner === userId);
    } catch (error) {
      console.error('Error fetching summaries by owner ID:', error);
      throw error;
    }
  }

  export async function fetchRepositoriesByOwnerId(userId: string): Promise<Repository[]> {
    try {
      const response = await fetch('http://localhost:5000/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const allRepositories: Repository[] = await response.json();
      return allRepositories.filter(repo => repo.owner === userId);
    } catch (error) {
      console.error('Error fetching repositories by owner ID:', error);
      throw error;
    }
  }

  export async function updateUserWithCascade(updatedUser: User): Promise<User> {
  try {
    // Update user
    const userResponse = await fetch(`${mockApiUrl}/${updatedUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });

    if (!userResponse.ok) {
      throw new Error('Failed to update user');
    }

    // Update summaries
    const summariesResponse = await fetch('http://localhost:5000/summeries');
    if (!summariesResponse.ok) {
      throw new Error('Failed to fetch summaries');
    }
    const summaries: Summary[] = await summariesResponse.json();
    
    const updatedSummaries = summaries.map(summary => {
      if (summary.owner === updatedUser.id) {
        return { ...summary, author: updatedUser.name };
      }
      return summary;
    });

    await Promise.all(updatedSummaries.map(summary => 
      fetch(`http://localhost:5000/summeries/${summary.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summary),
      })
    ));

    // Update repositories
    const reposResponse = await fetch('http://localhost:5000/repositories');
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }
    const repositories: Repository[] = await reposResponse.json();
    
    const updatedRepositories = repositories.map(repo => {
      if (repo.owner === updatedUser.id) {
        return { ...repo, owner: updatedUser.id };
      }
      return repo;
    });

    await Promise.all(updatedRepositories.map(repo => 
      fetch(`http://localhost:5000/repositories/${repo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repo),
      })
    ));

    // Update comments (assuming comments are stored within summaries)
    const updatedSummariesWithComments = updatedSummaries.map(summary => {
      const updatedComments = summary.comments.map(comment => {
        if (comment.author === updatedUser.id) {
          return { ...comment, author: updatedUser.name };
        }
        return comment;
      });
      return { ...summary, comments: updatedComments };
    });

    await Promise.all(updatedSummariesWithComments.map(summary => 
      fetch(`http://localhost:5000/summeries/${summary.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summary),
      })
    ));

    console.log("User updated successfully with cascading changes");
    return updatedUser;
  } catch (error) {
    console.error("Error updating user with cascade:", error);
    throw error;
  }
  }

  export async function updateUser(updatedUser: User): Promise<User> {
    try {
      return await updateUserWithCascade(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  export async function fetchSummaryById(id: string): Promise<Summary | null> {
    try {
      const response = await fetch('http://localhost:5000/summeries');
      if (!response.ok) {
        throw new Error('Failed to fetch summaries');
      }
      const summaries: Summary[] = await response.json();
      return summaries.find(summary => summary.id === id) || null;
    } catch (error) {
      console.error('Error fetching summary by ID:', error);
      throw error;
    }
  }

  export async function addCommentToSummary(summaryId: string, newComment: Comment): Promise<Summary> {
    try {
      const response = await fetch(`http://localhost:5000/summeries/${summaryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      const summary: Summary = await response.json();
  
      summary.comments.push(newComment);
  
      // Fetch the summary owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch summary owner data');
      }
      const owner: User = await ownerResponse.json();
  
      // Create a new notification for the owner
      const newNotification: Notification = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        read: false,
        content: `${newComment.author} commented on your summary "${summary.title}"`,
        link: `/summary/${summaryId}`,
        sender: newComment.author,
        type: 'comment'
      };
  
      owner.notifications.push(newNotification);
  
      const [updateSummaryResponse, updateOwnerResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        }),
        fetch(`http://localhost:5000/users/${summary.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        })
      ]);
  
      if (!updateSummaryResponse.ok || !updateOwnerResponse.ok) {
        throw new Error('Failed to update summary or owner data');
      }
  
      return await updateSummaryResponse.json();
    } catch (error) {
      console.error('Error adding comment to summary:', error);
      throw error;
    }
  }

  export async function likeSummary(summaryId: string, userId: string): Promise<{ summary: Summary; user: User; owner: User }> {
    try {
      const [summaryResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!summaryResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch summary or user data');
      }
  
      const summary: Summary = await summaryResponse.json();
      const user: User = await userResponse.json();
  
      // Fetch the summary owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch summary owner data');
      }
      const owner: User = await ownerResponse.json();
  
      const isLiked = user.likedSummaries.includes(summaryId);
      const isOwnSummary = userId === summary.owner;
  
      if (isLiked) {
        // Unlike the summary
        if (!isOwnSummary) {
          summary.likes--;
          owner.totalLikes--;
        }
        user.likedSummaries = user.likedSummaries.filter(id => id !== summaryId);
      } else {
        // Like the summary
        if (!isOwnSummary) {
          summary.likes++;
          owner.totalLikes++;
  
          // Create a new notification for the owner
          const newNotification: Notification = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            read: false,
            content: `${user.name} liked your summary "${summary.title}"`,
            link: `/summary/${summaryId}`,
            sender: user.username,
            type: 'like'
          };
  
          owner.notifications.push(newNotification);
        }
        user.likedSummaries.push(summaryId);
      }
  
      const [updatedSummaryResponse, updatedUserResponse, updatedOwnerResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(summary),
        }),
        fetch(`http://localhost:5000/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        }),
        fetch(`http://localhost:5000/users/${summary.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        })
      ]);
  
      if (!updatedSummaryResponse.ok || !updatedUserResponse.ok || !updatedOwnerResponse.ok) {
        throw new Error('Failed to update summary, user, or owner data');
      }
  
      return {
        summary: await updatedSummaryResponse.json(),
        user: await updatedUserResponse.json(),
        owner: await updatedOwnerResponse.json()
      };
    } catch (error) {
      console.error('Error liking/unliking summary:', error);
      throw error;
    }
  }

  export async function viewSummary(summaryId: string, userId: string): Promise<{ summary: Summary; user: User; owner: User }> {
    try {
      const [summaryResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/summeries/${summaryId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);

      if (!summaryResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch summary or user data');
      }

      const summary: Summary = await summaryResponse.json();
      const user: User = await userResponse.json();

      // Fetch the summary owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${summary.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch summary owner data');
      }
      const owner: User = await ownerResponse.json();

      let summaryUpdated = false;
      let ownerUpdated = false;

      // Check if the viewer is not the owner of the summary
      if (userId !== summary.owner) {
        // Increment view count for the summary
        summary.views++;
        summaryUpdated = true;

        // Increment total views for the owner
        owner.totalViews++;
        ownerUpdated = true;
      }

      const updatePromises = [];

      if (summaryUpdated) {
        updatePromises.push(
          fetch(`http://localhost:5000/summeries/${summaryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(summary),
          })
        );
      }

      if (ownerUpdated) {
        updatePromises.push(
          fetch(`http://localhost:5000/users/${summary.owner}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(owner),
          })
        );
      }

      if (updatePromises.length > 0) {
        const updateResponses = await Promise.all(updatePromises);
        if (!updateResponses.every(response => response.ok)) {
          throw new Error('Failed to update summary or owner data');
        }
      }

      return {
        summary: summaryUpdated ? await updatePromises[0].then(res => res.json()) : summary,
        user: user, // Return the original user object as we didn't modify it
        owner: ownerUpdated ? await updatePromises[1].then(res => res.json()) : owner
      };
    } catch (error) {
      console.error('Error updating view count:', error);
      throw error;
    }
  }

  export async function saveSummary(summaryId: string, userId: string): Promise<User> {
    try {
      const userResponse = await fetch(`http://localhost:5000/users/${userId}`);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const user: User = await userResponse.json();

      if (user.savedSummaries.includes(summaryId)) {
        // Unsave the summary
        user.savedSummaries = user.savedSummaries.filter(id => id !== summaryId);
      } else {
        // Save the summary
        user.savedSummaries.push(summaryId);
      }

      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!updatedUserResponse.ok) {
        throw new Error('Failed to update user data');
      }

      return await updatedUserResponse.json();
    } catch (error) {
      console.error('Error saving/unsaving summary:', error);
      throw error;
    }
  }

  export async function likeRepository(repoId: string, userId: string): Promise<{ repository: Repository; user: User; owner: User }> {
    try {
      const [repoResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/repositories/${repoId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!repoResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch repository or user data');
      }
  
      const repository: Repository = await repoResponse.json();
      const user: User = await userResponse.json();
  
      // Fetch the owner data
      const ownerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch repository owner data');
      }
      const owner: User = await ownerResponse.json();
  
      const isLiked = user.likedRepositories.includes(repoId);
      const isOwnRepository = userId === repository.owner;
  
      if (isLiked) {
        // Unlike the repository
        repository.likes = Math.max(0, repository.likes - 1);
        user.likedRepositories = user.likedRepositories.filter(id => id !== repoId);
        if (!isOwnRepository) {
          owner.totalLikes = Math.max(0, owner.totalLikes - 1);
        }
      } else {
        // Like the repository
        repository.likes++;
        user.likedRepositories.push(repoId);
        if (!isOwnRepository) {
          owner.totalLikes++;
        }
      }
  
      // Always update the repository, regardless of who likes it
      const updatedRepoResponse = await fetch(`http://localhost:5000/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repository),
      });
  
      // Always update the user who performed the action
      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      // Only update the owner if it's not the same as the user who performed the action
      let updatedOwnerResponse;
      if (!isOwnRepository) {
        updatedOwnerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        });
      }
  
      if (!updatedRepoResponse.ok || !updatedUserResponse.ok || (!isOwnRepository && !updatedOwnerResponse?.ok)) {
        throw new Error('Failed to update repository, user, or owner data');
      }
  
      return {
        repository: await updatedRepoResponse.json(),
        user: await updatedUserResponse.json(),
        owner: isOwnRepository ? owner : await updatedOwnerResponse!.json()
      };
    } catch (error) {
      console.error('Error liking/unliking repository:', error);
      throw error;
    }
  }

  export async function saveRepository(repoId: string, userId: string): Promise<User> {
    try {
      const userResponse = await fetch(`http://localhost:5000/users/${userId}`);
  
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
  
      const user: User = await userResponse.json();
  
      if (user.savedRepositories.includes(repoId)) {
        // Unsave the repository
        user.savedRepositories = user.savedRepositories.filter(id => id !== repoId);
      } else {
        // Save the repository
        user.savedRepositories.push(repoId);
      }
  
      const updatedUserResponse = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      if (!updatedUserResponse.ok) {
        throw new Error('Failed to update user data');
      }
  
      return await updatedUserResponse.json();
    } catch (error) {
      console.error('Error saving/unsaving repository:', error);
      throw error;
    }
  }
  
  export async function viewRepository(repoId: string, userId: string): Promise<{ repository: Repository; user: User; owner: User }> {
    try {
      const [repoResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:5000/repositories/${repoId}`),
        fetch(`http://localhost:5000/users/${userId}`)
      ]);
  
      if (!repoResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch repository or user data');
      }
  
      const repository: Repository = await repoResponse.json();
      const user: User = await userResponse.json();
  
      // Fetch the repository owner
      const ownerResponse = await fetch(`http://localhost:5000/users/${repository.owner}`);
      if (!ownerResponse.ok) {
        throw new Error('Failed to fetch repository owner data');
      }
      const owner: User = await ownerResponse.json();
  
      // Increment view count for the repository
      repository.views++;
  
      // Increment total views for the owner
      owner.totalViews = (owner.totalViews || 0) + 1;
  
      const updatePromises = [
        fetch(`http://localhost:5000/repositories/${repoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(repository),
        }),
        fetch(`http://localhost:5000/users/${repository.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(owner),
        })
      ];
  
      const updateResponses = await Promise.all(updatePromises);
      if (!updateResponses.every(response => response.ok)) {
        throw new Error('Failed to update repository or owner data');
      }
  
      const [updatedRepository, updatedOwner] = await Promise.all(
        updateResponses.map(response => response.json())
      );
  
      return {
        repository: updatedRepository,
        user: user, // Return the original user object as we didn't modify it
        owner: updatedOwner
      };
    } catch (error) {
      console.error('Error updating view count:', error);
      throw error;
    }
  }

  export async function updateRepository(id: string, updatedData: Partial<Repository>): Promise<Repository> {
    try {
      const response = await fetch(`http://localhost:5000/repositories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedRepository: Repository = await response.json();
      return updatedRepository;
    } catch (error) {
      console.error('Error updating repository:', error);
      throw error;
    }
  }

  export async function fetchUserRepositories(userId: string) {
    try {
      const response = await fetch(`http://localhost:5000/repositories?owner=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user repositories');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  }

  export function formatDate(date: string | Date): string {
    let d: Date;
  
    if (typeof date === 'string') {
      // Check if the date is already in "dd-mm-yyyy" format
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date; // Already in the correct format, return as is
      }
      // Parse the string date
      d = new Date(date);
    } else {
      d = date;
    }
  
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid Date';
    }
  
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
  
    return `${year}-${month}-${day}`;
  }


  export async function addSummary(
    newSummary: Omit<Summary, 'id' | 'views' | 'likes' | 'comments' | 'dateCreated' | 'lastUpdated'>,
    repoId?: string,
    folderId?: string
  ): Promise<Summary> {
    try {
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);
  
      const summaryResponse = await fetch('http://localhost:5000/summeries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSummary,
          id: Date.now().toString(),
          views: 0,
          likes: 0,
          comments: [],
          dateCreated: formattedDate,
          lastUpdated: formattedDate,
        }),
      });
  
      if (!summaryResponse.ok) {
        throw new Error(`Failed to add new summary: ${summaryResponse.statusText}`);
      }
  
      const addedSummary: Summary = await summaryResponse.json();
  
      // Update the user's summariesCount
      const userResponse = await fetch(`http://localhost:5000/users/${newSummary.owner}`);
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.statusText}`);
      }
      const userData: User = await userResponse.json();
      
      userData.summariesCount += 1;
  
      // Fetch all users
      const allUsersResponse = await fetch('http://localhost:5000/users');
      if (!allUsersResponse.ok) {
        throw new Error('Failed to fetch all users');
      }
      const allUsers: User[] = await allUsersResponse.json();
  
      // Create notifications for followers
      const followerNotifications = allUsers
        .filter(user => user.followingId.includes(newSummary.owner))
        .map(follower => {
          const notification: Notification = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            read: false,
            content: `${userData.name} posted a new summary: "${addedSummary.title}"`,
            link: `/summary/${addedSummary.id}`,
            sender: userData.username,
            type: 'summary'
          };
          follower.notifications.push(notification);
          return fetch(`http://localhost:5000/users/${follower.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(follower),
          });
        });
  
      const updatePromises = [
        fetch(`http://localhost:5000/users/${newSummary.owner}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }),
        ...followerNotifications
      ];
  
      await Promise.all(updatePromises);
  
      // Handle repository update separately
      if (repoId) {
        await updateRepositoryToAddSummary(repoId, addedSummary, folderId);
      }
  
      return addedSummary;
    } catch (error) {
      console.error('Error adding new summary:', error);
      throw error;
    }
  }
  
  export async function updateRepositoryToAddSummary(repoId: string, summary: Summary, folderId?: string): Promise<Repository> {
    try {
      const repoResponse = await fetch(`http://localhost:5000/repositories/${repoId}`);
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
      }
      const repo: Repository = await repoResponse.json();
  
      const newItem: RepositoryItem = {
        id: summary.id,
        title: summary.title,
        description: summary.description,
        author: summary.author,
        owner: summary.owner,
        lastUpdated: summary.lastUpdated,
        views: summary.views,
        likes: summary.likes,
        comments: summary.comments.length,
        path: [],
      };
  
      if (folderId) {
        const folder = findFolderById(repo.rootFolder, folderId);
        if (folder) {
          folder.items.push(newItem);
          newItem.path = getFolderPath(repo.rootFolder, folderId);
        } else {
          throw new Error(`Folder with ID ${folderId} not found in repository`);
        }
      } else {
        repo.rootFolder.items.push(newItem);
        newItem.path = [repo.rootFolder.name];
      }
  
      const updateResponse = await fetch(`http://localhost:5000/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repo),
      });
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update repository: ${updateResponse.statusText}`);
      }
  
      return await updateResponse.json();
    } catch (error) {
      console.error('Error updating repository to add summary:', error);
      throw error;
    }
  }
  
  function findFolderById(folder: RepositoryFolder, id: string): RepositoryFolder | null {
    if (folder.id === id) {
      return folder;
    }
    for (const item of folder.items) {
      if ('items' in item) {
        const found = findFolderById(item, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
  
  function getFolderPath(rootFolder: RepositoryFolder, folderId: string): string[] {
    const path: string[] = [];
  
    function traverse(folder: RepositoryFolder, currentPath: string[]) {
      if (folder.id === folderId) {
        path.push(...currentPath, folder.name);
        return true;
      }
  
      for (const item of folder.items) {
        if ('items' in item) {
          if (traverse(item, [...currentPath, folder.name])) {
            return true;
          }
        }
      }
  
      return false;
    }
  
    traverse(rootFolder, []);
    return path;
  }


export async function fetchUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await fetchUsers();
    const foundUser = users.find((u) => u.username === username);
    return foundUser || null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

export async function followUser(userId: string, followerId: string): Promise<{ follower: User; followedUser: User }> {
  try {
    const [userResponse, followerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/users/${followerId}`)
    ]);

    if (!userResponse.ok || !followerResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user: User = await userResponse.json();
    const follower: User = await followerResponse.json();

    // Update follower's data
    follower.following++;
    if (!follower.followingId.includes(userId)) {
      follower.followingId.push(userId);
    }

    // Update user's data
    user.followers++;
    if (!user.followerIds.includes(followerId)) {
      user.followerIds.push(followerId);
    }

    // Create a new notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
      content: `${follower.name} started following you!`,
      link: `/profile/${follower.username}`,
      sender: follower.username,
      type: 'follow'  // New field
    };

    user.notifications.push(newNotification);

    // Update both users in the database
    const [updateUserResponse, updateFollowerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/users/${followerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(follower),
      })
    ]);

    if (!updateUserResponse.ok || !updateFollowerResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return { follower, followedUser: user };
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: string, followerId: string): Promise<{ follower: User; unfollowedUser: User }> {
  try {
    const [userResponse, followerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/users/${followerId}`)
    ]);

    if (!userResponse.ok || !followerResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user: User = await userResponse.json();
    const follower: User = await followerResponse.json();

    // Update follower's data
    follower.following--;
    follower.followingId = follower.followingId.filter(id => id !== userId);

    // Update user's data
    user.followers--;
    user.followerIds = user.followerIds.filter(id => id !== followerId);

    // Update both users in the database
    const [updateUserResponse, updateFollowerResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/users/${followerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(follower),
      })
    ]);

    if (!updateUserResponse.ok || !updateFollowerResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return { follower, unfollowedUser: user };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function inviteCollaborator(repoId: string, username: string): Promise<Repository> {
  // Fetch the repository
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }

  // Fetch the user to be invited
  const user = await fetchUserByUsername(username)
  if (!user) {
    throw new Error('User not found')
  }

  // Check if the user is already a collaborator or has a pending invitation
  if (repo.collaborators.includes(user.id) || repo.pendingCollaborators.includes(user.id)) {
    throw new Error('User is already a collaborator or has a pending invitation')
  }

  // Add the user to pending collaborators
  const updatedPendingCollaborators = [...repo.pendingCollaborators, user.id]
  const updatedRepo = await updateRepository(repoId, { pendingCollaborators: updatedPendingCollaborators })

  // Create a notification for the invited user
  const notification: Notification = {
    id: Date.now().toString(),
    type: 'collaboration_invite',
    content: `You've been invited to collaborate on the repository "${repo.name}"`,
    date: new Date().toISOString(),
    read: false,
    sender: repo.owner,
    link: `/collaboration-request/${repoId}?userId=${user.id}`
  }

  // Add the notification to the user's notifications
  const updatedUser: User = {
    ...user,
    notifications: [...user.notifications, notification]
  }
  await updateUser(updatedUser)

  return updatedRepo
}

export async function removeCollaborator(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.collaborators = repo.collaborators.filter(id => id !== userId)
  return await updateRepository(repoId, { collaborators: repo.collaborators })
}

export async function cancelCollaborationInvitation(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.pendingCollaborators = repo.pendingCollaborators.filter(id => id !== userId)
  return await updateRepository(repoId, { pendingCollaborators: repo.pendingCollaborators })
}

export async function acceptCollaboration(repoId: string, userId: string): Promise<Repository> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  repo.pendingCollaborators = repo.pendingCollaborators.filter(id => id !== userId)
  repo.collaborators.push(userId)
  return await updateRepository(repoId, {
    pendingCollaborators: repo.pendingCollaborators,
    collaborators: repo.collaborators
  })
}

export async function rejectCollaboration(repoId: string, userId: string): Promise<Repository> {
  return await cancelCollaborationInvitation(repoId, userId)
}

export async function fetchCollaborationRequest(repoId: string, userId: string): Promise<{ repository: Repository; inviter: User }> {
  const repo = await fetchRepositoryById(repoId)
  if (!repo) {
    throw new Error('Repository not found')
  }
  const inviter = await fetchUserById(repo.owner)
  if (!inviter) {
    throw new Error('Inviter not found')
  }
  return { repository: repo, inviter }
}

export async function fetchCommunities(): Promise<Community[]> {
  try {
    const response = await fetch('http://localhost:5000/communities');
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
}

export async function fetchCommunityById(id: string): Promise<Community | null> {
  try {
    const response = await fetch(`http://localhost:5000/communities/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch community');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching community by ID:', error);
    throw error;
  }
}

export async function joinCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is already a member
    if (community.members.includes(userId)) {
      throw new Error('User is already a member of this community');
    }

    // Check the join policy
    if (community.joinPolicy !== 'open') {
      throw new Error('This community requires an invitation or request to join');
    }

    // Update user's communities
    user.communities.push(communityId);

    // Update community's members and totalMembers
    community.members.push(userId);
    community.totalMembers += 1;

    // Update both user and community in the database
    const [updatedUserResponse, updatedCommunityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(community),
      })
    ]);

    if (!updatedUserResponse.ok || !updatedCommunityResponse.ok) {
      throw new Error('Failed to update user or community data');
    }

    return {
      user: await updatedUserResponse.json(),
      community: await updatedCommunityResponse.json()
    };
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
}

export async function leaveCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is a member
    if (!community.members.includes(userId)) {
      throw new Error('User is not a member of this community');
    }

    // Update user's communities
    user.communities = user.communities.filter(id => id !== communityId);

    // Update community's members and totalMembers
    community.members = community.members.filter(id => id !== userId);
    community.totalMembers -= 1;

    // Update both user and community in the database
    const [updatedUserResponse, updatedCommunityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      }),
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(community),
      })
    ]);

    if (!updatedUserResponse.ok || !updatedCommunityResponse.ok) {
      throw new Error('Failed to update user or community data');
    }

    return {
      user: await updatedUserResponse.json(),
      community: await updatedCommunityResponse.json()
    };
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
}

// Add this function to db.ts
export async function requestToJoinCommunity(userId: string, communityId: string): Promise<{ user: User; community: Community }> {
  try {
    // Fetch the user and community
    const [userResponse, communityResponse] = await Promise.all([
      fetch(`http://localhost:5000/users/${userId}`),
      fetch(`http://localhost:5000/communities/${communityId}`)
    ]);

    if (!userResponse.ok || !communityResponse.ok) {
      throw new Error('Failed to fetch user or community data');
    }

    const user: User = await userResponse.json();
    const community: Community = await communityResponse.json();

    // Check if the user is already a member or has a pending request
    if (community.members.includes(userId) || community.pendingMembers?.includes(userId)) {
      throw new Error('User is already a member or has a pending request');
    }

    // Add user to pendingMembers
    community.pendingMembers = community.pendingMembers || [];
    community.pendingMembers.push(userId);

    // Update community in the database
    const updateCommunityResponse = await fetch(`http://localhost:5000/communities/${communityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(community),
    });

    if (!updateCommunityResponse.ok) {
      throw new Error('Failed to update community data');
    }

    return { user, community: await updateCommunityResponse.json() };
  } catch (error) {
    console.error('Error requesting to join community:', error);
    throw error;
  }
}

export async function acceptJoinRequest(communityId: string, requesterId: string, adminId: string): Promise<void> {
  try {
    const [communityResponse, requesterResponse] = await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`),
      fetch(`http://localhost:5000/users/${requesterId}`)
    ]);

    if (!communityResponse.ok || !requesterResponse.ok) {
      throw new Error('Failed to fetch community or requester data');
    }

    const community: Community = await communityResponse.json();
    const requester: User = await requesterResponse.json();

    // Remove requester from pendingMembers and add to members
    community.pendingMembers = community.pendingMembers?.filter(id => id !== requesterId) || [];
    community.members.push(requesterId);
    community.totalMembers += 1;

    // Add community to requester's communities
    requester.communities.push(communityId);

    // Create a notification for the requester
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'join_accepted',
      content: `Your request to join ${community.name} has been accepted.`,
      date: new Date().toISOString(),
      read: false,
      sender: adminId,
      link: `/community/${communityId}`
    };
    requester.notifications.push(notification);

    // Update both community and requester in the database
    await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(community),
      }),
      fetch(`http://localhost:5000/users/${requesterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requester),
      })
    ]);
  } catch (error) {
    console.error('Error accepting join request:', error);
    throw error;
  }
}

export async function rejectJoinRequest(communityId: string, requesterId: string, adminId: string): Promise<void> {
  try {
    const [communityResponse, requesterResponse] = await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`),
      fetch(`http://localhost:5000/users/${requesterId}`)
    ]);

    if (!communityResponse.ok || !requesterResponse.ok) {
      throw new Error('Failed to fetch community or requester data');
    }

    const community: Community = await communityResponse.json();
    const requester: User = await requesterResponse.json();

    // Remove requester from pendingMembers
    community.pendingMembers = community.pendingMembers?.filter(id => id !== requesterId) || [];

    // Create a notification for the requester
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'join_rejected',
      content: `Your request to join ${community.name} has been rejected.`,
      date: new Date().toISOString(),
      read: false,
      sender: adminId,
      link: `/community/${communityId}`
    };
    requester.notifications.push(notification);

    // Update both community and requester in the database
    await Promise.all([
      fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(community),
      }),
      fetch(`http://localhost:5000/users/${requesterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requester),
      })
    ]);
  } catch (error) {
    console.error('Error rejecting join request:', error);
    throw error;
  }
}

export async function updateCommunity(id: string, updatedData: Partial<Community>): Promise<Community> {
  try {
    const response = await fetch(`http://localhost:5000/communities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
}

export async function addCommunity(newCommunity: Omit<Community, 'id'>): Promise<Community> {
  try {
    // Create the new community
    const communityResponse = await fetch('http://localhost:5000/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newCommunity,
        id: Date.now().toString(),
      }),
    });

    if (!communityResponse.ok) {
      throw new Error('Failed to create new community');
    }

    const createdCommunity: Community = await communityResponse.json();

    // Fetch the user data
    const userResponse = await fetch(`http://localhost:5000/users/${newCommunity.admins[0]}`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData: User = await userResponse.json();

    // Update the user's communities array
    userData.communities = [...userData.communities, createdCommunity.id];

    // Save the updated user data
    const updateUserResponse = await fetch(`http://localhost:5000/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!updateUserResponse.ok) {
      throw new Error('Failed to update user data');
    }

    return createdCommunity;
  } catch (error) {
    console.error('Error creating new community:', error);
    throw error;
  }
}


export async function addRepository(newRepo: Omit<Repository, 'id' | 'collaborators' | 'pendingCollaborators'>, communityId?: string): Promise<Repository> {
  try {
    const response = await fetch('http://localhost:5000/repositories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newRepo,
        id: Date.now().toString(),
        collaborators: [],
        pendingCollaborators: [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create new repository');
    }

    const createdRepo: Repository = await response.json();

    // If a community is specified, update the community's repositories
    if (communityId) {
      const communityResponse = await fetch(`http://localhost:5000/communities/${communityId}`);
      if (!communityResponse.ok) {
        throw new Error('Failed to fetch community data');
      }
      const community: Community = await communityResponse.json();
      
      community.repositories.push(createdRepo.id);
      community.totalContent += 1;

      const updateCommunityResponse = await fetch(`http://localhost:5000/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(community),
      });

      if (!updateCommunityResponse.ok) {
        throw new Error('Failed to update community data');
      }
    }

    return createdRepo;
  } catch (error) {
    console.error('Error creating new repository:', error);
    throw error;
  }
}