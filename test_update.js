import { createClient } from '@supabase/supabase-js';

// Env vars will be passed directly in bash

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function testUpdate() {
   const { data, error } = await supabase.from('group_members').update({ cabin_id: 1 }).eq('id', 'a41dfefa-1f7a-4c17-9daf-0f30593513a4').select();
   console.log("Error:", JSON.stringify(error, null, 2));
   console.log("Data:", data);
}

testUpdate();
