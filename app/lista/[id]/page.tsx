import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicListContent } from '@/components/public/public-list-content'

export default async function PublicListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the list (only if public)
  const { data: list, error: listError } = await supabase
    .from('gift_lists')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (listError || !list) {
    notFound()
  }

  // Fetch items for this list
  const { data: items } = await supabase
    .from('gift_items')
    .select('*')
    .eq('list_id', id)
    .order('created_at', { ascending: false })

  // Fetch owner profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', list.user_id)
    .single()

  return (
    <PublicListContent 
      list={list} 
      items={items || []} 
      ownerName={profile?.display_name || 'Casal'} 
    />
  )
}
