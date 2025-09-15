"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ILogin } from "@/types/auth.type";

export const AuthLogin = async (payload: ILogin) => {
  const supabase = await createClient();
  const { identifier, password } = payload;
  let loginValue = "";

  const { data } = await supabase.from("users").select("id,nrp").eq("nrp", identifier).single()

  if(data?.nrp) {
    const userId = data.id
    const {data: userData, error: errorGetDataUser} = await supabaseAdmin.getUserById(userId)
    if(errorGetDataUser) {
      return {
        status: false,
        message: errorGetDataUser?.message || "Terjadi Error",
      };
    }
    loginValue = userData.user.email!;
  } else {
    loginValue = identifier;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: loginValue,
    password,
  });

  if (error) {
    return {
      status: false,
      message: error?.message || "Terjadi Error",
    };
  }

  return {
    status: true,
    message: "Berhasil Login",
  };
};


export const Logout = async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
     return {
      status: false,
      message: error?.message || "Terjadi Error",
    };
  }

  return {
    status: true,
    message: "Berhasil Keluar",
  };

}