/**
 * Utility to create an admin user
 * This should be called from the Supabase dashboard or via a one-time script
 */

import { supabase } from './supabase/client';

export async function createAdminUser(email: string, password: string) {
  try {
    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile to admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Try to insert if update failed
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          role: 'admin',
        });

      if (insertError) throw insertError;
    }

    return {
      success: true,
      userId: authData.user.id,
      email: authData.user.email,
    };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

