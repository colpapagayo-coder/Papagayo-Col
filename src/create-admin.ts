import { supabase } from './supabase.js';

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'colpapagayo@gmail.com',
    password: 'Papagayo2026',
    options: {
      data: {
        full_name: 'Admin Papagayo',
      }
    }
  });
  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin created!', data.user?.email);
  }
}

createAdmin();
