import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash, Plus } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { axiosInstance } from '@/lib/axios'
import toast from 'react-hot-toast'
import { createFileRoute, Link } from '@tanstack/react-router'

async function fetchNotes(token: string) {
  const res = await axiosInstance.get('/api/notes', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

async function createNoteApi(
  token: string,
  note: { title: string; content: string },
) {
  const res = await axiosInstance.post('/api/notes', note, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

async function deleteNoteApi(token: string, id: string) {
  const res = await axiosInstance.delete(`/api/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status >= 400) throw new Error('Failed to delete note')
  return { id }
}

export default function Notes() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => fetchNotes(user?.token ?? ''),
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: (note: { title: string; content: string }) =>
      createNoteApi(user?.token ?? '', note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setTitle('')
      setContent('')
      setDialogOpen(false)
      toast.success('Note created successfully ✅')
    },
    onError: () => toast.error('Failed to create note ❌'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNoteApi(user?.token ?? '', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note deleted 🗑️')
    },
    onError: () => toast.error('Failed to delete note ❌'),
  })

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please{' '}
              <Link className="text-blue-500 hover:underline" to="/sign-in">
                login
              </Link>{' '}
              to access your notes.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Notes</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </CardContent>
        </Card>

        <div className="flex justify-end mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
                <Textarea
                  placeholder="Write your note content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate({ title, content })}
                  disabled={
                    createMutation.isPending || !title.trim() || !content.trim()
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>
              <p className="text-gray-500 mt-3">Loading your notes...</p>
            </CardContent>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No notes yet
              </h3>
              <p className="text-gray-500">
                Create your first note to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {notes.map(
                (note: { id: string; title: string; content: string }) => (
                  <AccordionItem
                    key={note.id}
                    value={note.id}
                    className="border-none"
                  >
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between p-4">
                          <AccordionTrigger className="flex-1 text-left font-medium text-gray-800 text-xl hover:no-underline hover:text-blue-600 transition-colors">
                            {note.title}
                          </AccordionTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteMutation.mutate(note.id)
                            }}
                            disabled={deleteMutation.isPending}
                            className="ml-2 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t pt-3">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        </AccordionContent>
                      </CardContent>
                    </Card>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/' as any)({
  component: Notes,
})
