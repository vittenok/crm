import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function getValue(data: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (data[key]) return String(data[key]).trim();
  }

  return "";
}

function normalizeTelegram(value: string) {
  return value.replace("@", "").trim();
}

function cleanProductText(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/^"/, "")
    .replace(/".*$/, "")
    .trim();
}

function extractSize(value: string) {
  const match = value.match(/Размер:\s*([^)]+)/i);
  return match ? match[1].trim() : "";
}

function extractTildaVariantCode(value: string) {
    const match = value.match(/\(([^,\s)]+)/);
    return match ? match[1].trim() : "";
  }
  
  function splitTildaVariantCode(code: string) {
    const match = code.match(/^(\d+)([A-Za-zА-Яа-я0-9]+)$/);
  
    return {
      productUid: match ? match[1] : code,
      size: match ? match[2] : "",
    };
  }

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());

    console.log("Tilda webhook:", rawData);

    const paymentRaw = getValue(rawData, ["payment"]);
    const payment = paymentRaw ? JSON.parse(paymentRaw) : {};

    const productLine = payment?.products?.[0] || "";

    const productName = cleanProductText(productLine);

    const tildaVariantCode = extractTildaVariantCode(productLine);
    const parsedVariant = splitTildaVariantCode(tildaVariantCode);
    
    const productUid = parsedVariant.productUid;
    const size = parsedVariant.size || extractSize(productLine);

    const salePrice = Number(payment?.amount || 0);
    const tildaOrderId = payment?.orderid || `tilda-${Date.now()}`;

    const name = getValue(rawData, [
      "Name",
      "name",
      "Имя",
      "Ваше имя",
      "ФИО",
    ]);

    const phone = getValue(rawData, [
      "Phone",
      "phone",
      "Телефон",
    ]);

    const email = getValue(rawData, [
      "Email",
      "email",
      "Почта",
      "E-mail",
    ]);

    const telegram = getValue(rawData, [
      "Input",
      "Telegram",
      "telegram",
      "Телеграм",
      "Ник Telegram",
      "TG",
      "tg",
    ]);

    const delivery = getValue(rawData, [
      "Radio",
      "Delivery",
      "Доставка",
    ]);

    const address = getValue(rawData, [
      "Textarea",
      "Address",
      "Адрес",
      "Адрес доставки",
      "ПВЗ",
    ]);

    const { data: product } = await supabase
      .from("products")
      .select("*, product_sizes(*)")
      .eq("tilda_product_uid", productUid)
      .maybeSingle();

      const normalizedSize = size.trim().toLowerCase();

      const productSize = product?.product_sizes?.find(
        (item: any) =>
          String(item.size || "").trim().toLowerCase() === normalizedSize
      );

    const productCost = product?.product_cost || 0;
    const printCost = product?.print_cost || 0;
    const packagingCost = product?.packaging_cost || 0;

    const profit =
      salePrice -
      productCost -
      printCost -
      packagingCost;

    const { error } = await supabase.from("orders").insert({
      tilda_order_id: tildaOrderId,

      customer_name: name || "Клиент из Тильды",
      customer_phone: phone,
      customer_email: email,

      order_source: "Tilda",
      contact_value: telegram,
      telegram_username: normalizeTelegram(telegram),

      product_id: product?.id || null,
      product_size_id: productSize?.id || null,
      product_name: productName || "Заказ из Тильды",

      image_url: product?.image_url || "",

      status: "Новый",
      priority: "Обычный",

      delivery_service: delivery || "Не указана",
      address,

      sale_price: salePrice,
      product_cost: productCost,
      print_cost: printCost,
      packaging_cost: packagingCost,
      profit,

      comment: JSON.stringify(rawData, null, 2),
    });

    if (error) {
      console.error("Tilda insert error:", error);

      return NextResponse.json(
        {
          ok: false,
          error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Order created",
    });
  } catch (error) {
    console.error("Tilda webhook error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Webhook error",
      },
      { status: 500 }
    );
  }
}