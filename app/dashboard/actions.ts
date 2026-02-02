"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GiftList = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type GiftItem = {
  id: string;
  list_id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  product_url: string | null;
  source: string | null;
  quantity: number;
  purchased_quantity: number;
  is_purchased: boolean;
  purchased_by: string | null;
  purchased_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export async function getGiftLists(): Promise<GiftList[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("gift_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gift lists:", error);
    return [];
  }

  return data || [];
}

export async function createGiftList(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "true";

  const { error } = await supabase.from("gift_lists").insert({
    name,
    description: description || null,
    is_public: isPublic,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGiftList(listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("gift_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getGiftItems(listId: string): Promise<GiftItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gift_items")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gift items:", error);
    return [];
  }

  return data || [];
}

export async function addGiftItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const listId = formData.get("listId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const productUrl = formData.get("productUrl") as string;
  const source = formData.get("source") as string;
  const quantity = formData.get("quantity") as string;

  const { error } = await supabase.from("gift_items").insert({
    list_id: listId,
    user_id: user.id,
    name,
    description: description || null,
    price: price ? parseFloat(price) : null,
    image_url: imageUrl || null,
    product_url: productUrl || null,
    source: source || null,
    quantity: quantity ? parseInt(quantity) : 1,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/list/${listId}`);
  return { success: true };
}

export async function updateGiftItem(itemId: string, data: Partial<GiftItem>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("gift_items")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGiftItem(itemId: string, listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("gift_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/list/${listId}`);
  return { success: true };
}

export async function toggleItemPurchased(
  itemId: string,
  isPurchased: boolean,
  listId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("gift_items")
    .update({
      is_purchased: isPurchased,
      purchased_by: isPurchased ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/list/${listId}`);
  return { success: true };
}
