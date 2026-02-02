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

    // Try to extract product information from meta tags and structured data
    let name: string = "";
    let description = "";
    let imageUrl = "";

    // Method 1: Try og:title (most reliable for Shopee)
    name = $('meta[property="og:title"]').attr("content") || "";

    // Method 2: If og:title didn't work, try to extract from structured data
    if (!name || name.includes("undefined")) {
      try {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((_, elem) => {
          try {
            const jsonData = JSON.parse($(elem).html() || "");
            if (jsonData.name && !name) {
              name = jsonData.name;
            }
          } catch (e) {
            // Ignore parse errors
          }
        });
      } catch (e) {
        // Ignore errors
      }
    }

    // Method 3: Try to extract from page title as fallback
    if (!name) {
      const titleText = $("title").text();
      if (titleText) {
        name = titleText.split("|")[0].trim();
      }
    }

    // If still no name, use a fallback
    if (!name) {
      name = "Produto da Shopee";
    }

    // Clean up the name (remove Shopee suffix and extra spaces)
    name = name
      .replace(/\s*\|\s*Shopee.*$/i, "")
      .replace(/\s*-\s*Shopee.*$/i, "")
      .trim();

    // Extract description
    description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // Extract image
    imageUrl = $('meta[property="og:image"]').attr("content") || "";

    // Try multiple methods to extract price from Shopee
    let price: number | null = null;

    // Method 1: Try og:price meta tag
    let priceText =
      $('meta[property="product:price:amount"]').attr("content") || "";
    if (priceText) {
      price = parseFloat(priceText);
    }

    // Method 2: Try to find price in JSON-LD structured data
    if (!price) {
      try {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((_, elem) => {
          try {
            const jsonData = JSON.parse($(elem).html() || "");
            if (
              jsonData.offers &&
              jsonData.offers[0] &&
              jsonData.offers[0].price
            ) {
              price = parseFloat(jsonData.offers[0].price);
            }
          } catch (e) {
            // Ignore parse errors
          }
        });
      } catch (e) {
        // Ignore errors
      }
    }

    // Method 3: Try to find price in common Shopee patterns
    if (!price) {
      // Look for price patterns in the HTML - more comprehensive
      const pricePatterns = [
        /[\s"]price[\s":][\s]*[\D]*R\$\s*([\d.,]+)/gi,
        /preço[\s:]*R\$\s*([\d.,]+)/gi,
        /R\$\s*([\d,]+(?:\.\d{2})?)/gi,
        /\b\d+(?:\.\d{3})*(?:,\d{2})?\b/g,
      ];

      for (const pattern of pricePatterns) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          for (const match of matches) {
            const priceStr = match
              .replace(/\D/g, ",")
              .split(",")
              .filter((x) => x)
              .join("");
            if (priceStr.length <= 10) {
              const cleanPrice = priceStr.replace(/\./g, "").replace(",", ".");
              const parsedPrice = parseFloat(cleanPrice);
              if (
                !isNaN(parsedPrice) &&
                parsedPrice > 0 &&
                parsedPrice < 1000000
              ) {
                price = parsedPrice;
                break;
              }
            }
          }
          if (price) break;
        }
      }
    }

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
