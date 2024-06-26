// reset_column.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cqgxebrrruqnqqiozkdh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ3hlYnJycnVxbnFxaW96a2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1MDg3MTksImV4cCI6MjAzNDA4NDcxOX0.eV_VC1PFko-uM6jcjWrxMUaMIyCw4IOWDsAcXW8QkDM";
const supabase = createClient(supabaseUrl, supabaseKey);

const resetColumn = async () => {
  const { error } = await supabase.from("codding battle").update({ time: 0 });

  if (error) {
    console.error("Error resetting column:", error);
  } else {
    console.log("Column reset successfully");
  }
};

resetColumn();
