import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Extract shop_id and product_id from Shopee URL
function extractShopAndProductIds(url: string): {
  shopId: string | null;
  productId: string | null;
} {
  // Format: https://shopee.com.br/product-name-i.SHOP_ID.PRODUCT_ID
  const match = url.match(/\/i\.(\d+)\.(\d+)/);
  if (match) {
    return {
      shopId: match[1],
      productId: match[2],
    };
  }

  // Try without the i. prefix
  const altMatch = url.match(/\.(\d+)\.(\d+)(?:\?|$)/);
  if (altMatch) {
    return {
      shopId: altMatch[1],
      productId: altMatch[2],
    };
  }

  return { shopId: null, productId: null };
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

    // Debug tracking
    const debug = {
      method: "unknown" as string,
      url: url,
      extractedIds: {} as any,
      extractedData: {} as any,
    };

    let name = "";
    let description = "";
    let imageUrl = "";
    let price: number | null = null;

    // Step 1: Try to extract IDs from URL
    const { shopId, productId } = extractShopAndProductIds(url);
    debug.extractedIds = { shopId, productId };

    if (shopId && productId) {
      debug.method = "Shopee API";
      try {
        console.log(
          `Fetching from Shopee API: shop=${shopId}, product=${productId}`,
        );

        // Try Shopee's API endpoint
        const apiUrl = `https://shopee.com.br/api/v4/product/get_product_detail?shop_id=${shopId}&product_id=${productId}`;

        const apiResponse = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
            Referer: url,
          },
        });

        if (apiResponse.ok) {
          try {
            const data = await apiResponse.json();
            debug.extractedData.apiResponse = {
              hasData: !!data.data,
              hasProduct: !!data.data?.product,
            };

            if (data.data?.product) {
              const product = data.data.product;

              // Extract name
              if (product.name) {
                name = product.name;
                debug.extractedData.name = name;
              }

              // Extract price
              if (product.price) {
                price = product.price / 100000; // Shopee returns price in small units
                debug.extractedData.price = {
                  raw: product.price,
                  converted: price,
                };
              }

              // Extract image
              if (product.image) {
                imageUrl = `https://down-br.img.susercontent.com/file/${product.image}`;
                debug.extractedData.image = imageUrl.substring(0, 100);
              } else if (product.images && product.images.length > 0) {
                imageUrl = `https://down-br.img.susercontent.com/file/${product.images[0]}`;
                debug.extractedData.image = imageUrl.substring(0, 100);
              }

              console.log("✓ Data extracted from API:", {
                name,
                price,
                hasImage: !!imageUrl,
              });
            }
          } catch (parseError) {
            console.log("Could not parse API response as JSON");
            debug.extractedData.apiParseError = true;
          }
        } else {
          console.log("API request failed:", apiResponse.status);
          debug.extractedData.apiError = apiResponse.status;
        }
      } catch (apiError) {
        console.log("API fetch error:", apiError);
        debug.extractedData.apiFetchError = true;
      }
    }

    // Step 2: If API method didn't work, try HTML parsing as fallback
    if (!name) {
      debug.method =
        debug.method === "unknown"
          ? "HTML Fallback"
          : debug.method + " + HTML Fallback";
      console.log("Attempting HTML fallback...");

      const htmlSnippet = html.substring(0, 2000);
      debug.extractedData.htmlSize = html.length;
      debug.extractedData.htmlSnippet = htmlSnippet;

      // Extract from og: meta tags
      const ogTitleMatch = html.match(
        /<meta\s+property="og:title"\s+content="([^"]*)"/i,
      );
      if (ogTitleMatch && ogTitleMatch[1]) {
        name = ogTitleMatch[1];
        debug.extractedData.ogTitle = name;
      }

      // Try image meta tags
      let ogImageMatch = html.match(
        /<meta\s+property="og:image"\s+content="([^"]*)"/i,
      );
      if (!ogImageMatch) {
        ogImageMatch = html.match(
          /<meta\s+name="twitter:image"\s+content="([^"]*)"/i,
        );
      }
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1];
        debug.extractedData.image = imageUrl.substring(0, 100);
      }

      // Try to find price in HTML
      const pricePatterns = [
        /"price"\s*:\s*(\d+(?:\.\d{2})?)/i,
        /"price"\s*:\s*"?([\d.,]+)"?/i,
        /R\$\s+([\d.,]+)/i,
        /R\$\s*([\d,]+)/i,
      ];

      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const priceStr = String(match[1])
            .replace(/\./g, "")
            .replace(",", ".");
          const parsed = parseFloat(priceStr);

          if (!isNaN(parsed) && parsed > 0.01 && parsed < 1000000) {
            price = parsed;
            debug.extractedData.htmlPrice = { raw: match[1], parsed: price };
            break;
          }
        }
      }
    }

    // Step 3: Clean up name
    if (name) {
      const originalName = name;
      name = name
        .replace(/\s*\|\s*Shopee.*$/i, "")
        .replace(/\s*-\s*Shopee.*$/i, "")
        .replace(/Shopee\s*/i, "")
        .replace(/\s+i\.\d+\.\d+/i, "")
        .replace(/\s*[\[\(].*[\]\)].*$/i, "")
        .trim();

      if (originalName !== name) {
        debug.extractedData.nameCleaned = {
          before: originalName,
          after: name,
        };
      }
    }

    // Step 4: Fallback - extract from URL
    if (!name) {
      const urlParts = url.split("/");
      if (urlParts.length > 0) {
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && !lastPart.match(/^\d+$/)) {
          name = decodeURIComponent(lastPart)
            .replace(/-/g, " ")
            .replace(/\s+i\.\d+\.\d+/i, "")
            .replace(/\?.*$/i, "")
            .trim();
          debug.extractedData.nameFromUrl = name;
        }
      }
    }

    // Final fallback
    if (!name) {
      name = "Produto importado da Shopee";
      debug.extractedData.nameFallback = true;
    }

    console.log("Final extracted data:", { name, price, hasImage: !!imageUrl });
    console.log("Debug info:", JSON.stringify(debug, null, 2));
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
        { error: "Erro ao criar item na lista", debug },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item, debug });
  } catch (error) {
    console.error("Error importing from Shopee:", error);
    return NextResponse.json(
      { error: "Erro ao importar produto da Shopee" },
      { status: 500 },
    );
  }
}
