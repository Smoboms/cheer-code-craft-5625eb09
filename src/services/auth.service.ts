import { supabase } from '@/integrations/supabase/client';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  name?: string;
  company?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  segment?: string;
  what_i_offer?: string;
  what_i_seek?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  // Cache-bust the filename so the browser reloads a new avatar immediately.
  const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;

  // Use the public partner-images bucket — the workspace blocks public buckets,
  // so we reuse the existing public bucket to serve avatars.
  const { error: uploadError } = await supabase.storage
    .from('partner-images')
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('partner-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  return !!data;
}
