import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { listId, name } = body;

    if (!listId || !name || !name.trim()) {
      return NextResponse.json(
        { error: "ID da lista e nome são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se a lista pertence ao usuário
    const { data: list, error: listError } = await supabase
      .from("gift_lists")
      .select("id, user_id")
      .eq("id", listId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Lista não encontrada" },
        { status: 404 },
      );
    }

    if (list.user_id !== user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar esta lista" },
        { status: 403 },
      );
    }

    // Atualizar o nome da lista
    const { data: updatedList, error: updateError } = await supabase
      .from("gift_lists")
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", listId)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar lista:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar lista" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      list: updatedList,
    });
  } catch (error) {
    console.error("Erro na API update-list:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
