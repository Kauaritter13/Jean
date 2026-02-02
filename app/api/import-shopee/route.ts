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

    console.log("===== SHOPEE IMPORT DEBUG =====");
    console.log("URL:", url);

    // Try to extract product information from meta tags and structured data
    let name: string = "";
    let description = "";
    let imageUrl = "";
    let price: number | null = null;

    // Debug: Log all meta tags
    const allMetas = $("meta");
    console.log("Total meta tags found:", allMetas.length);

    // Try og:title first
    name = $('meta[property="og:title"]').attr("content") || "";
    console.log("og:title found:", name);

    // Try og:image
    imageUrl = $('meta[property="og:image"]').attr("content") || "";
    console.log("og:image found:", imageUrl);

    // Try description
    description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";
    console.log("og:description found:", description.substring(0, 50));

    // Try to extract price from meta tags
    let priceText =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[name="product:price:amount"]').attr("content") ||
      "";
    console.log("product:price:amount meta found:", priceText);

    if (priceText) {
      price = parseFloat(priceText);
      console.log("Parsed price from meta:", price);
    }

    // Method 2: Try to find price in JSON-LD structured data
    if (!price) {
      try {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        console.log("JSON-LD scripts found:", jsonLdScripts.length);

        jsonLdScripts.each((index: number, elem: any) => {
          try {
            const jsonContent = $(elem).html() || "";
            if (jsonContent) {
              const jsonData = JSON.parse(jsonContent);
              console.log(
                `JSON-LD ${index}:`,
                JSON.stringify(jsonData).substring(0, 100),
              );

              if (jsonData.name && !name) {
                name = jsonData.name;
              }

              if (
                jsonData.offers &&
                jsonData.offers[0] &&
                jsonData.offers[0].price &&
                !price
              ) {
                price = parseFloat(jsonData.offers[0].price);
                console.log("Price found in JSON-LD:", price);
              }

              if (jsonData.image && !imageUrl) {
                imageUrl = Array.isArray(jsonData.image)
                  ? jsonData.image[0]
                  : jsonData.image;
              }
            }
          } catch (e) {
            console.log("Error parsing JSON-LD:", e);
          }
        });
      } catch (e) {
        console.log("Error processing JSON-LD:", e);
      }
    }

    // Method 3: Look for price in HTML with regex (more aggressive)
    if (!price) {
      console.log("Trying regex patterns for price...");

      // Extract first 10000 characters for price search
      const htmlForPrice = html.substring(0, Math.min(50000, html.length));

      // Simpler, more reliable patterns
      const pricePatterns = [
        /R\$\s*(\d+(?:[.,]\d{2})?)/i,
        /preço[\s:]*R\$\s*(\d+(?:[.,]\d{2})?)/i,
        /"price"[\s:]*[\s"]*(\d+(?:[.,]\d{2})?)/i,
        /\"price\"\s*:\s*(\d+(?:\.\d{2})?)/,
      ];

      for (const pattern of pricePatterns) {
        const match = htmlForPrice.match(pattern);
        if (match) {
          console.log("Price pattern matched:", match[0]);
          const priceStr = match[1].replace(".", "").replace(",", ".");
          const parsedPrice = parseFloat(priceStr);
          if (!isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice < 1000000) {
            price = parsedPrice;
            console.log("Price extracted via regex:", price);
            break;
          }
        }
      }
    }

    // Fallback: If still no name, extract from page title
    if (!name) {
      const titleText = $("title").text();
      if (titleText) {
        name = titleText.split("|")[0].trim();
        console.log("Name extracted from page title:", name);
      }
    }

    // Final cleanup
    if (name) {
      name = name
        .replace(/\s*\|\s*Shopee.*$/i, "")
        .replace(/\s*-\s*Shopee.*$/i, "")
        .trim();
    }

    // If still no name, use fallback
    if (!name) {
      name = "Produto da Shopee";
      console.log("Using fallback name");
    }

    // Limit description length
    if (description && description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    console.log("===== FINAL EXTRACTED DATA =====");
    console.log("Name:", name);
    console.log("Price:", price);
    console.log("Image URL:", imageUrl);
    console.log("Description:", description.substring(0, 50));

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
