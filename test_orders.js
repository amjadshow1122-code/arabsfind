import { supabase } from '../src/lib/supabase.js';

async function check() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Order keys:", data[0] ? Object.keys(data[0]) : "No orders");
  }
}
check();
