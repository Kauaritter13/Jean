import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper function to extract product ID from Shopee URL
function extractShopeeProductId(url: string): string | null {
  // URL format: https://shopee.com.br/product/shop_id/product_id
  const match = url.match(/\/(\d+)\/(\d+)/);
  return match ? match[2] : null;
}

// Helper to fetch product data from Shopee API
async function fetchShopeeProduct(url: string) {
  try {
    // Try using Shopee's API endpoint
    const productId = extractShopeeProductId(url);
    if (!productId) {
      throw new Error("Could not extract product ID from URL");
    }

    // Shopee API endpoint
    const apiUrl = `https://shopee.com.br/api/v4/product/get?product_id=${productId}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching from Shopee API:", error);
  }
  return null;
}

// Fallback: Extract from HTML using improved regex patterns
async function extractFromHTML(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();
    console.log("HTML size:", html.length);

    // Look for JSON data embedded in the page
    // Shopee embeds product data in JSON format in the HTML
    const jsonMatch = html.match(
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?"product"[\s\S]*?});/,
    );

    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        console.log("Found embedded JSON data");
        return jsonData;
      } catch (e) {
        console.log("Could not parse embedded JSON");
      }
    }

    // Alternative: Look for product title in meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
    const descMatch = html.match(
      /<meta\s+(?:property|name)="og:description"\s+content="([^"]*)"/i,
    );
    const imageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]*)"/i,
    );
    const priceMatch = html.match(/R\$\s*([0-9.,]+)/);

    return {
      title: titleMatch ? titleMatch[1] : null,
      description: descMatch ? descMatch[1] : null,
      image: imageMatch ? imageMatch[1] : null,
      price: priceMatch ? priceMatch[1] : null,
    };
  } catch (error) {
    console.error("Error extracting from HTML:", error);
  }
  return null;
}

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

    console.log("===== SHOPEE IMPORT DEBUG =====");
    console.log("URL:", url);

    let name = "";
    let description = "";
    let imageUrl = "";
    let price: number | null = null;

    // Try Shopee API first
    console.log("Attempting to fetch from Shopee API...");
    const apiData = await fetchShopeeProduct(url);

    if (apiData && apiData.data) {
      const product = apiData.data;
      console.log("API data found!");

      name = product.name || product.title || "";
      description = product.description || "";

      // Extract price
      if (product.price_min) {
        price = product.price_min / 100000; // Shopee returns price in smallest unit
      } else if (product.price) {
        price =
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price;
      }

      // Extract image
      if (product.image) {
        imageUrl = product.image;
      } else if (product.images && product.images[0]) {
        imageUrl = product.images[0];
      }
    }

    // Fallback to HTML extraction if API didn't work
    if (!name) {
      console.log("API failed, trying HTML extraction...");
      const htmlData = await extractFromHTML(url);

      if (htmlData) {
        name = htmlData.title || htmlData.name || "";
        description = htmlData.description || "";
        imageUrl = imageUrl || htmlData.image || "";

        // Parse price if it's a string
        if (htmlData.price && typeof htmlData.price === "string") {
          const priceStr = htmlData.price.replace(/\./g, "").replace(",", ".");
          price = parseFloat(priceStr);
        } else if (htmlData.price) {
          price = htmlData.price;
        }
      }
    }

    // Clean up name
    if (name) {
      name = name
        .replace(/\s*\|\s*Shopee.*$/i, "")
        .replace(/\s*-\s*Shopee.*$/i, "")
        .trim();
    }

    // If still no name, use fallback
    if (!name) {
      name = "Produto importado da Shopee";
    }

    // Limit description
    if (description && description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    console.log("===== FINAL EXTRACTED DATA =====");
    console.log("Name:", name);
    console.log("Price:", price);
    console.log("Image URL:", imageUrl ? "Yes" : "No");
    console.log("Description:", description ? "Yes" : "No");

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
      console.error("Error creating item in database:", insertError);
      console.error("Item data that failed:", {
        name,
        price,
        imageUrl,
        description,
      });
      return NextResponse.json(
        { error: "Erro ao criar item na lista" },
        { status: 500 },
      );
    }

    console.log("Item created successfully:", item);
    console.log("===== END SHOPEE IMPORT =====\n");
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error importing from Shopee:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "");
    return NextResponse.json(
      {
        error:
          "Erro ao importar produto da Shopee: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
      },
      { status: 500 },
    );
  }
}
