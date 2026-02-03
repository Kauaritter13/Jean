import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const { itemId, name, price, imageUrl, description } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "ID do item é obrigatório" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    // First, get the item to check if user is owner
    const { data: item, error: fetchError } = await supabase
      .from("gift_items")
      .select("list_id")
      .eq("id", itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 },
      );
    }

    // Check if user is owner of the list
    const { data: list, error: listError } = await supabase
      .from("gift_lists")
      .select("user_id")
      .eq("id", item.list_id)
      .single();

    if (listError || !list || list.user_id !== user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este item" },
        { status: 403 },
      );
    }

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from("gift_items")
      .update({
        name: name || undefined,
        price: price ? parseFloat(price) : undefined,
        image_url: imageUrl || undefined,
        description: description || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating item:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar item" },
      { status: 500 },
    );
  }
}
