import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidCPF } from "@/lib/cpf-validator";

export async function POST(request: Request) {
  try {
    const { itemId, purchasedByName, purchasedByCPF } = await request.json();

    if (!itemId || !purchasedByName || !purchasedByCPF) {
      return NextResponse.json(
        { error: "Item ID, nome e CPF são obrigatórios" },
        { status: 400 },
      );
    }

    // Validate CPF
    if (!isValidCPF(purchasedByCPF)) {
      return NextResponse.json(
        { error: "CPF inválido. Por favor, verifique o número informado." },
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
        purchased_by_cpf: purchasedByCPF.replace(/\D/g, ""), // Store only digits
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
    const { itemId, cpf } = await request.json();

    if (!itemId || !cpf) {
      return NextResponse.json(
        { error: "Item ID e CPF são obrigatórios para desmarcar" },
        { status: 400 },
      );
    }

    // Validate CPF format
    if (!isValidCPF(cpf)) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    const supabase = await createClient();

    // First, get the item to check who marked it
    const { data: item, error: fetchError } = await supabase
      .from("gift_items")
      .select("purchased_by_cpf, id")
      .eq("id", itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 },
      );
    }

    // Check if the CPF matches the one who purchased it
    const cleanCPF = cpf.replace(/\D/g, "");
    if (item.purchased_by_cpf !== cleanCPF) {
      return NextResponse.json(
        {
          error:
            "CPF não corresponde ao do comprador. Você só pode desmarcar itens que você marcou como comprado.",
        },
        { status: 403 },
      );
    }

    // Update item to mark as not purchased
    const { data, error } = await supabase
      .from("gift_items")
      .update({
        is_purchased: false,
        purchased_by_name: null,
        purchased_by_cpf: null,
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
