import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGiftLists } from './actions'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  const lists = await getGiftLists()
  
  return <DashboardContent user={user} initialLists={lists} />
}
