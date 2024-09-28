'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus, Trash2, Folder, File, X } from "lucide-react"
import Header from '@/components/Theme/Header'
import Footer from "@/components/Theme/Footer"
import { fetchRepositoryById, updateRepository } from '@/lib/db'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, className = '', ...props }: InputProps) {
  const inputId = React.useId()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface RepositoryItem {
  id: string;
  title: string;
  description: string;
  author: string;
  owner: string;
  lastUpdated: string;
  views: number;
  likes: number;
  comments: number;
  path: string[];
}

interface RepositoryFolder {
  id: string;
  name: string;
  items: (RepositoryItem | RepositoryFolder)[];
}

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
  stars: number;
  likes: number;
  views: number;
  tags: string[];
  rootFolder: RepositoryFolder;
}

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function EditRepositoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string | undefined
  const userId = searchParams?.get('userId')
  const [repo, setRepo] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<RepositoryItem | RepositoryFolder | null>(null)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState<string>('')
  const [addingFolderTo, setAddingFolderTo] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      try {
        const repoData = await fetchRepositoryById(id);
        if (!repoData) {
          throw new Error('Repository not found');
        }
        if (repoData.owner !== userId) {
          throw new Error('Unauthorized to edit this repository');
        }
        setRepo(repoData);
        setOpenFolders(new Set([repoData.rootFolder.id]));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRepo(prevRepo => prevRepo ? { ...prevRepo, [name]: value } : null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setRepo(prevRepo => prevRepo ? { ...prevRepo, tags } : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repo) return;
    
    setLoading(true);
    try {
      await updateRepository(repo.id, repo);
      setNotification('Repository updated successfully');
    } catch (err) {
      console.error("Error updating repository:", err);
      setError('Failed to update repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search functionality if needed
  }

  const handleSelectItem = (item: RepositoryItem | RepositoryFolder) => {
    setSelectedItem(item);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!repo) return;
    const deleteItem = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] => {
      return items.filter(item => item.id !== itemId).map(item => {
        if ('items' in item) {
          return { ...item, items: deleteItem(item.items) };
        }
        return item;
      });
    };
    setRepo(prevRepo => {
      if (!prevRepo) return null;
      return {
        ...prevRepo,
        rootFolder: {
          ...prevRepo.rootFolder,
          items: deleteItem(prevRepo.rootFolder.items)
        }
      };
    });
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(null);
    }
  };

  const toggleFolder = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = new Set(prevOpenFolders);
      if (newOpenFolders.has(folderId)) {
        newOpenFolders.delete(folderId);
      } else {
        newOpenFolders.add(folderId);
      }
      return newOpenFolders;
    });
  }, []);

  const handleSelectFolder = useCallback((folder: RepositoryFolder) => {
    setSelectedItem(folder);
  }, []);

  const handleAddFolder = (folderId: string) => {
    setAddingFolderTo(folderId);
    setNewFolderName('');
  };

  const handleConfirmAddFolder = () => {
    if (!repo || !newFolderName.trim() || !addingFolderTo) return;

    const newFolder: RepositoryFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      items: []
    };

    setRepo(prevRepo => {
      if (!prevRepo) return null;
      const updateItems = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] => {
        return items.map(item => {
          if (item.id === addingFolderTo && 'items' in item) {
            return { ...item, items: [...item.items, newFolder] };
          } else if ('items' in item) {
            return { ...item, items: updateItems(item.items) };
          }
          return item;
        });
      };
      return {
        ...prevRepo,
        rootFolder: addingFolderTo === prevRepo.rootFolder.id
          ? { ...prevRepo.rootFolder, items: [...prevRepo.rootFolder.items, newFolder] }
          : { ...prevRepo.rootFolder, items: updateItems(prevRepo.rootFolder.items) }
      };
    });

    setOpenFolders(prev => new Set(prev).add(addingFolderTo));
    setAddingFolderTo(null);
    setNewFolderName('');
  };

  const handleCancelAddFolder = () => {
    setAddingFolderTo(null);
    setNewFolderName('');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    setRepo(prevRepo => {
      if (!prevRepo) return null;

      const newRepo = { ...prevRepo };
      let sourceItems: (RepositoryItem | RepositoryFolder)[];
      let destItems: (RepositoryItem | RepositoryFolder)[];

      const findItems = (folderId: string): (RepositoryItem | RepositoryFolder)[] | null => {
        if (folderId === 'root') return newRepo.rootFolder.items;
        const findInFolder = (items: (RepositoryItem | RepositoryFolder)[]): (RepositoryItem | RepositoryFolder)[] | null => {
          for (const item of items) {
            if ('items' in item) {
              if (item.id === folderId) return item.items;
              const found = findInFolder(item.items);
              if (found) return found;
            }
          }
          return null;
        };
        return findInFolder(newRepo.rootFolder.items);
      };

      sourceItems = findItems(source.droppableId) || [];
      destItems = findItems(destination.droppableId) || [];

      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      return newRepo;
    });
  };

  const renderFolderStructure = useCallback((folder: RepositoryFolder, level = 0) => {
    const isOpen = openFolders.has(folder.id);
    const isAddingToThisFolder = addingFolderTo === folder.id;

    return (
      <Droppable droppableId={folder.id} type="FOLDER_ITEM">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <div key={folder.id} style={{ marginLeft: `${level * 20}px` }}>
              <div className="flex items-center justify-between py-2">
                <button 
                  className="flex items-center text-left flex-grow"
                  onClick={(e) => {
                    toggleFolder(e, folder.id);
                    handleSelectFolder(folder);
                  }}
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <Folder className="w-4 h-4 mr-2 text-orange-500" />
                  ) : (
                    <Folder className="w-4 h-4 mr-2 text-orange-300" />
                  )}
                  <span className="font-medium text-orange-700">{folder.name}</span>
                </button>
                {!isAddingToThisFolder && (
                  <Button
                    onClick={() => handleAddFolder(folder.id)}
                    className="ml-2 p-1 bg-white-500 hover:bg-white-100 text-orange-500 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isAddingToThisFolder && (
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name"
                    className="flex-grow"
                  />
                  <Button onClick={handleConfirmAddFolder} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Add
                  </Button>
                  <Button onClick={handleCancelAddFolder} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
                    Cancel
                  </Button>
                </div>
              )}
              {isOpen && (
                <div>
                  {folder.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {'items' in item ? (
                            renderFolderStructure(item as RepositoryFolder, level + 1)
                          ) : (
                            <button 
                              className="flex items-center py-2 w-full text-left hover:bg-orange-100" 
                              style={{ marginLeft: `${(level + 1) * 20}px` }} 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelectItem(item as RepositoryItem);
                              }}
                            >
                              <File className="w-4 h-4 mr-2 text-orange-400" />
                              <span className="text-orange-600">{(item as RepositoryItem).title}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }, [openFolders, handleSelectFolder, handleSelectItem, toggleFolder, addingFolderTo, newFolderName, handleConfirmAddFolder, handleCancelAddFolder]);

  if (loading) {
    return <div className="container mx-auto p-4 bg-orange-50">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-orange-50">Error: {error}</div>
  }

  if (!repo) {
    return <div className="container mx-auto p-4 bg-orange-50">Repository not found</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      <Header onSearch={handleSearch} userId={repo.owner} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link
          href={`/repository/${repo.id}?userId=${repo.owner}`}
          className="inline-flex items-center mb-4 text-orange-600 hover:text-orange-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Repository
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-600">Edit Repository: {repo.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Repository Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={repo.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={repo.description}
                  onChange={handleInputChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={repo.tags.join(', ')}
                  onChange={handleTagsChange}
                />
              </div>

              <div>
                <Label>Folder Structure</Label>
                <div className="border border-orange-200 rounded-md p-4">
                  <DragDropContext onDragEnd={onDragEnd}>
                    {renderFolderStructure(repo.rootFolder)}
                  </DragDropContext>
                </div>
              </div>

              {selectedItem && (
                <div>
                  <Label>Selected Item</Label>
                  <div className="flex items-center justify-between p-2 bg-orange-100 rounded-md">
                    <span>{('title' in selectedItem ? selectedItem.title : selectedItem.name)}</span>
                    <div>
                      <Button
                        onClick={() => handleDeleteItem(selectedItem.id)}
                        className="bg-orange-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 ease-in-out flex items-center px-4 py-2"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}