import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProductData {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  source: string;
}

async function scrapeAmazon(url: string): Promise<ProductData | null> {
  try {
    // For Amazon, we'll extract basic info from the URL and use a simplified approach
    // In production, you'd use a proper scraping service or Amazon's Product Advertising API

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();

    // Extract product title
    const titleMatch = html.match(
      /<span id="productTitle"[^>]*>([^<]+)<\/span>/,
    );
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract price
    const priceMatch =
      html.match(/class="a-price-whole">([^<]+)</) ||
      html.match(/priceblock_ourprice[^>]*>R\$\s*([0-9.,]+)</);
    let price: number | undefined;
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/\./g, "").replace(",", ".");
      price = parseFloat(priceStr);
    }

    // Extract image
    const imageMatch =
      html.match(/id="landingImage"[^>]*src="([^"]+)"/) ||
      html.match(/class="a-dynamic-image"[^>]*src="([^"]+)"/);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;

    if (!title) {
      return null;
    }

    return {
      name: title,
      price,
      imageUrl,
      source: "Amazon",
    };
  } catch (error) {
    console.error("Error scraping Amazon:", error);
    return null;
  }
}

async function scrapeHavan(url: string): Promise<ProductData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();

    // Extract product title
    const titleMatch =
      html.match(/<h1[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]+)<\/h1>/) ||
      html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract price
    const priceMatch =
      html.match(/R\$\s*([0-9.,]+)/) ||
      html.match(/price[^>]*>R\$\s*([0-9.,]+)</);
    let price: number | undefined;
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/\./g, "").replace(",", ".");
      price = parseFloat(priceStr);
    }

    // Extract image
    const imageMatch =
      html.match(
        /<img[^>]*class="[^"]*product-image[^"]*"[^>]*src="([^"]+)"/,
      ) || html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*product/);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;

    if (!title) {
      return null;
    }

    return {
      name: title,
      price,
      imageUrl,
      source: "Havan",
    };
  } catch (error) {
    console.error("Error scraping Havan:", error);
    return null;
  }
}

function detectSource(url: string): "amazon" | "havan" | "unknown" {
  if (url.includes("amazon.com.br") || url.includes("amazon.com")) {
    return "amazon";
  }
  if (url.includes("havan.com.br")) {
    return "havan";
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { url, listId } = await request.json();

    if (!url || !listId) {
      return NextResponse.json(
        { error: "URL e listId sao obrigatorios" },
        { status: 400 },
      );
    }

    const source = detectSource(url);

    let productData: ProductData | null = null;

    switch (source) {
      case "amazon":
        productData = await scrapeAmazon(url);
        break;
      case "havan":
        productData = await scrapeHavan(url);
        break;
      default:
        return NextResponse.json(
          {
            error: "Link nao suportado. Use links da Amazon ou Havan.",
          },
          { status: 400 },
        );
    }

    if (!productData) {
      // If scraping fails, create a basic entry
      productData = {
        name: `Produto importado de ${source === "amazon" ? "Amazon" : "Havan"}`,
        source: source === "amazon" ? "Amazon" : "Havan",
      };
    }

    // Save to database
    const { data, error } = await supabase
      .from("gift_items")
      .insert({
        list_id: listId,
        user_id: user.id,
        name: productData.name,
        description: productData.description || null,
        price: productData.price || null,
        image_url: productData.imageUrl || null,
        product_url: url,
        source: productData.source,
        quantity: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving product:", error);
      return NextResponse.json(
        { error: "Erro ao salvar produto" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
