import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url, listId } = await request.json();

    if (!url || !listId) {
      return NextResponse.json(
        { error: "URL e ID da lista são obrigatórios" },
        { status: 400 },
      );
    }

    // Validate URL is from Shopee
    if (!url.includes("shopee.com.br")) {
      return NextResponse.json(
        { error: "URL precisa ser da Shopee Brasil" },
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

    // Verify the list belongs to the user
    const { data: list, error: listError } = await supabase
      .from("gift_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Lista não encontrada" },
        { status: 404 },
      );
    }

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível acessar a página da Shopee" },
        { status: 500 },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to extract product information from meta tags
    let name =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "Produto da Shopee";

    let description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    let imageUrl = $('meta[property="og:image"]').attr("content") || "";

    let priceText =
      $('meta[property="product:price:amount"]').attr("content") || "";
    let price = priceText ? parseFloat(priceText) : null;

    // Clean up the name (remove Shopee suffix)
    name = name.replace(/\s*\|\s*Shopee.*$/i, "").trim();

    // Limit description length
    if (description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    // Create the gift item
    const { data: item, error: insertError } = await supabase
      .from("gift_items")
      .insert({
        list_id: listId,
        user_id: user.id,
        name: name,
        description: description || null,
        price: price,
        image_url: imageUrl || null,
        product_url: url,
        source: "Shopee",
        quantity: 1,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating item:", insertError);
      return NextResponse.json(
        { error: "Erro ao criar item na lista" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error importing from Shopee:", error);
    return NextResponse.json(
      { error: "Erro ao importar produto da Shopee" },
      { status: 500 },
    );
  }
}
