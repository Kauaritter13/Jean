import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGiftItems } from '@/app/dashboard/actions'
import { ListDetailContent } from '@/components/dashboard/list-detail-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get list details
  const { data: list, error } = await supabase
    .from('gift_lists')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !list) {
    redirect('/dashboard')
  }
  
  // Check if user owns the list or it's public
  if (list.user_id !== user.id && !list.is_public) {
    redirect('/dashboard')
  }
  
  const items = await getGiftItems(id)
  
  return <ListDetailContent list={list} items={items} isOwner={list.user_id === user.id} />
}
