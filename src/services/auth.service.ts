import { supabase } from '@/integrations/supabase/client';
import { optimizeImage } from '@/lib/imageOptimizer';

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
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  // Upload to the PRIVATE `avatars` bucket (same as ProfilePage / MinhaEmpresaPage)
  // and return a long-lived signed URL — avoids public exposure of personal photos.
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data, error: signedError } = await supabase.storage
    .from('avatars')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);
  if (signedError) throw signedError;

  return data.signedUrl;
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
