import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { itemId, purchasedByName } = await request.json();

    if (!itemId || !purchasedByName) {
      return NextResponse.json(
        { error: "Item ID e nome são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Update item to mark as purchased
    const { data, error } = await supabase
      .from("gift_items")
      .update({
        is_purchased: true,
        purchased_by_name: purchasedByName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error marking item as purchased:", error);
      return NextResponse.json(
        { error: "Erro ao marcar item como comprado" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in mark-purchased API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID é obrigatório" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Update item to mark as not purchased
    const { data, error } = await supabase
      .from("gift_items")
      .update({
        is_purchased: false,
        purchased_by_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error unmarking item:", error);
      return NextResponse.json(
        { error: "Erro ao desmarcar item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in unmark API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
