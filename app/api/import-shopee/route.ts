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

    // Debug tracking
    const debug = {
      htmlSize: html.length,
      htmlSnippet: html.substring(0, 2000), // First 2000 chars to see structure
      extractedData: {} as any,
    };

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
      debug.extractedData.ogTitle = name;
    }

    const ogDescMatch = html.match(
      /<meta\s+property="og:description"\s+content="([^"]*)"/i,
    );
    if (ogDescMatch && ogDescMatch[1]) {
      description = ogDescMatch[1];
      debug.extractedData.ogDescription = true;
    }

    // Try multiple image meta tags
    let ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]*)"/i,
    );
    let imageSource = "og:image";
    if (!ogImageMatch) {
      // Try twitter:image
      ogImageMatch = html.match(
        /<meta\s+name="twitter:image"\s+content="([^"]*)"/i,
      );
      imageSource = "twitter:image";
    }
    if (!ogImageMatch) {
      // Try image meta tag
      ogImageMatch = html.match(
        /<meta\s+property="image"\s+content="([^"]*)"/i,
      );
      imageSource = "image";
    }
    if (!ogImageMatch) {
      // Try to find img src in common patterns
      const imgMatch = html.match(/<img[^>]+src="([^"]*shopee[^"]*)"/i);
      if (imgMatch && imgMatch[1]) {
        ogImageMatch = imgMatch;
        imageSource = "img src";
      }
    }
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1];
      debug.extractedData.image = {
        source: imageSource,
        url: imageUrl.substring(0, 100),
      };
    } else {
      debug.extractedData.image = { found: false };
    }

    // Method 2: Try to extract from page title as backup
    if (!name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        name = titleMatch[1].split("|")[0].trim();
        debug.extractedData.fallbackTitle = name;
      }
    }

    // Method 3: Try to find price in multiple formats
    if (!price) {
      // Look for common Shopee price patterns in HTML
      const pricePatterns = [
        // JSON format: "price":12990
        { regex: /"price"\s*:\s*(\d+(?:\.\d{2})?)/i, name: '"price": number' },
        // JSON format: "price":"12.99"
        { regex: /"price"\s*:\s*"?([\d.,]+)"?/i, name: '"price": string' },
        // Price in HTML: preço: R$ 12.99
        { regex: /preço[\s"']*:[\s"']*R\$\s*([\d.,]+)/i, name: "preço: R$" },
        // Direct: R$ 12.99 or R$ 1.299,99
        { regex: /R\$\s+([\d.,]+)/i, name: "R$ (with space)" },
        // Alternate: R$ 12,99
        { regex: /R\$\s*([\d,]+)/i, name: "R$ (no space)" },
        // No symbol: just numbers that look like price
        {
          regex: /"price"[\s"']*[:\s=]+[\s"']*(\d{2,})/i,
          name: '"price" = number',
        },
        // shopee price format in JSON
        {
          regex: /"current_price"\s*:\s*"?([\d.,]+)"?/i,
          name: '"current_price"',
        },
        // shopee tier list price
        {
          regex: /"normalPrice"\s*:\s*"?([\d.,]+)"?/i,
          name: '"normalPrice"',
        },
      ];

      debug.extractedData.priceAttempts = [];
      for (const { regex: pattern, name: patternName } of pricePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const priceStr = String(match[1])
            .replace(/\./g, "") // Remove thousand separators (dots)
            .replace(",", "."); // Convert comma decimal to period
          const parsed = parseFloat(priceStr);

          // Validate price is reasonable (between 0.01 and 999,999)
          if (!isNaN(parsed) && parsed > 0.01 && parsed < 1000000) {
            price = parsed;
            debug.extractedData.priceFound = {
              pattern: patternName,
              raw: match[1],
              parsed: price,
            };
            debug.extractedData.priceAttempts.push({
              pattern: patternName,
              found: true,
            });
            break;
          } else {
            debug.extractedData.priceAttempts.push({
              pattern: patternName,
              found: false,
              reason: "validation failed",
              raw: match[1],
              parsed: parsed,
              validationDetails: {
                isNaN: isNaN(parsed),
                greaterThan001: parsed > 0.01,
                lessThan1000000: parsed < 1000000,
              },
            });
          }
        } else {
          debug.extractedData.priceAttempts.push({
            pattern: patternName,
            found: false,
            reason: "no match",
          });
        }
      }
    }

    // Clean up name - remove Shopee markers and product IDs
    const originalName = name;
    if (name) {
      name = name
        .replace(/\s*\|\s*Shopee.*$/i, "") // Remove | Shopee
        .replace(/\s*-\s*Shopee.*$/i, "") // Remove - Shopee
        .replace(/Shopee\s*/i, "") // Remove Shopee word
        .replace(/\s+i\.\d+\.\d+/i, "") // Remove product ID like "i.616222685.23399292930"
        .replace(/\s*[\[\(].*[\]\)].*$/i, "") // Remove brackets/parentheses at end
        .trim();
      if (originalName !== name) {
        debug.extractedData.nameCleaned = {
          before: originalName,
          after: name,
        };
      }
    }

    // If still no name, try to extract from URL
    if (!name) {
      const urlParts = url.split("/");
      if (urlParts.length > 0) {
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && !lastPart.match(/^\d+$/)) {
          name = decodeURIComponent(lastPart)
            .replace(/-/g, " ")
            .replace(/\s+i\.\d+\.\d+/i, "") // Remove product ID
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

    // Limit description
    if (description && description.length > 500) {
      description = description.substring(0, 497) + "...";
    }

    console.log("===== SHOPEE IMPORT DEBUG =====");
    console.log(JSON.stringify(debug, null, 2));

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
