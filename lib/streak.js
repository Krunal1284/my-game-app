import { supabase } from './supabase';

export async function updateStreak(email) {
  const { data: user } = await supabase
    .from('users')
    .select('streak, last_login')
    .eq('email', email)
    .single();

  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const lastLogin = user.last_login;

  // Already logged in today
  if (lastLogin === today) return;

  // Calculate yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak;

  if (lastLogin === yesterdayStr) {
    // Logged in yesterday → increment streak
    newStreak = (user.streak || 0) + 1;
  } else {
    // Missed a day → reset streak
    newStreak = 1;
  }

  await supabase
    .from('users')
    .update({
      streak: newStreak,
      last_login: today,
    })
    .eq('email', email);

  return newStreak;
}