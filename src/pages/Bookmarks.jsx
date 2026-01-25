import { useState, useEffect } from 'react'
import { Bookmark, FolderPlus, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/common'
import { useToast } from '@/hooks/use-toast'
import { bookmarkService } from '@/services'
import PostCard from '@/components/feed/PostCard'

const Bookmarks = () => {
  const { toast } = useToast()
  
  const [bookmarks, setBookmarks] = useState([])
  const [collections, setCollections] = useState([])
  const [activeCollection, setActiveCollection] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookmarksRes, collectionsRes] = await Promise.all([
        bookmarkService.getBookmarks(),
        bookmarkService.getCollections()
      ])
      setBookmarks(bookmarksRes.data || [])
      setCollections(collectionsRes.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return

    try {
      setCreating(true)
      const response = await bookmarkService.createCollection({
        name: newCollectionName.trim()
      })
      setCollections(prev => [...prev, response.data])
      setNewCollectionName('')
      setShowCreateDialog(false)
      toast({
        title: "Success",
        description: "Collection created"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCollection = async (id) => {
    try {
      await bookmarkService.deleteCollection(id)
      setCollections(prev => prev.filter(c => c.id !== id))
      if (activeCollection === String(id)) {
        setActiveCollection('all')
      }
      toast({
        title: "Success",
        description: "Collection deleted"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive"
      })
    }
  }

  const handleRemoveBookmark = async (postId) => {
    try {
      await bookmarkService.removeBookmark(postId)
      setBookmarks(prev => prev.filter(b => b.post_id !== postId))
      toast({
        title: "Success",
        description: "Bookmark removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive"
      })
    }
  }

  const filteredBookmarks = activeCollection === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.collection_id === parseInt(activeCollection))

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Bookmarks</h1>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>

        <Tabs value={activeCollection} onValueChange={setActiveCollection}>
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 flex-nowrap">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 shrink-0"
              >
                All Bookmarks
              </TabsTrigger>
              {collections.map(collection => (
                <TabsTrigger
                  key={collection.id}
                  value={String(collection.id)}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 shrink-0 group"
                >
                  <span>{collection.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Bookmarks List */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description={
              activeCollection === 'all'
                ? "Save posts to view them later"
                : "This collection is empty"
            }
          />
        ) : (
          <div className="divide-y">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="relative group">
                <PostCard post={bookmark.post} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveBookmark(bookmark.post_id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Organize your bookmarks into collections
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={creating || !newCollectionName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Bookmarks
