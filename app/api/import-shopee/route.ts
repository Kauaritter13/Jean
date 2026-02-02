import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    console.log("===== SHOPEE IMPORT =====");
    console.log("URL:", url);

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível acessar a página da Shopee" },
        { status: 500 },
      );
    }

    const html = await response.text();
    console.log("HTML received, size:", html.length);

    let name = "";
    let description = "";
    let imageUrl = "";
    let price: number | null = null;

    // Method 1: Extract from og: meta tags (works before JS renders)
    const ogTitleMatch = html.match(
      /<meta\s+property="og:title"\s+content="([^"]*)"/i,
    );
    if (ogTitleMatch && ogTitleMatch[1]) {
      name = ogTitleMatch[1];
      console.log("Found og:title:", name);
    }

    const ogDescMatch = html.match(
      /<meta\s+property="og:description"\s+content="([^"]*)"/i,
    );
    if (ogDescMatch && ogDescMatch[1]) {
      description = ogDescMatch[1];
      console.log("Found og:description");
    }

    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]*)"/i,
    );
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1];
      console.log("Found og:image");
    }

    // Method 2: Try to extract from page title as backup
    if (!name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        name = titleMatch[1].split("|")[0].trim();
        console.log("Found title:", name);
      }
    }

    // Method 3: Try to find price in multiple formats
    if (!price) {
      // Look for common Shopee price patterns in HTML
      const pricePatterns = [
        /"price"\s*:\s*(\d+\.?\d*)/i,
        /preço[\s"]*:[\s"]*R\$\s*([\d.,]+)/i,
        /R\$\s+([\d.,]+)/i,
      ];

      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const priceStr = match[1].replace(/\./g, "").replace(",", ".");
          const parsed = parseFloat(priceStr);
          if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
            price = parsed;
            console.log("Found price:", price);
            break;
          }
        }
      }
    }

    // Clean up name - remove Shopee markers
    if (name) {
      name = name
        .replace(/\s*\|\s*Shopee.*$/i, "")
        .replace(/\s*-\s*Shopee.*$/i, "")
        .replace(/Shopee\s*/i, "")
        .trim();
    }

    // If still no name, try to extract from URL
    if (!name) {
      const urlParts = url.split("/");
      if (urlParts.length > 0) {
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && !lastPart.match(/^\d+$/)) {
          name = decodeURIComponent(lastPart).replace(/-/g, " ").trim();
          console.log("Extracted name from URL:", name);
        }
      }
    }

    // Final fallback
    if (!name) {
      name = "Produto importado da Shopee";
      console.log("Using fallback name");
    }

    // Limit description
    if (description && description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    console.log(
      "Final data - Name:",
      name,
      "Price:",
      price,
      "Image:",
      !!imageUrl,
    );

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
