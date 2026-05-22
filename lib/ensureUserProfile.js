import { supabase } from './supabase'

export async function ensureUserProfile(authUser) {
  if (!authUser?.email) return null

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', authUser.email)
    .maybeSingle()

  if (existing) return existing

  const username =
    authUser.user_metadata?.username ||
    authUser.email.split('@')[0]

  const { data: created, error } = await supabase
    .from('users')
    .insert({
      email: authUser.email,
      username,
      xp: 0,
      level: 1,
      streak: 0,
      solved: 0,
      rank: 'BRONZE',
    })
    .select()
    .single()

  if (error) {
    console.error('ensureUserProfile:', error.message)
    return null
  }

  return created
}
