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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());

    console.log("Tilda webhook:", rawData);

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
      "Номер телефона",
    ]);

    const email = getValue(rawData, [
      "Email",
      "email",
      "Почта",
      "E-mail",
    ]);

    const telegram = getValue(rawData, [
      "Telegram",
      "telegram",
      "Телеграм",
      "Ник в Telegram",
      "Ник Telegram",
      "TG",
      "tg",
    ]);

    const productName = getValue(rawData, [
      "Product",
      "product",
      "Товар",
      "Название товара",
      "payment.products",
    ]);

    const salePriceRaw = getValue(rawData, [
      "payment.amount",
      "amount",
      "Цена",
      "Стоимость",
      "Сумма",
    ]);

    const salePrice = Number(
      salePriceRaw.replace(/[^\d.]/g, "")
    );

    const tildaOrderId =
      getValue(rawData, ["requestid", "request_id", "tranid", "orderid"]) ||
      `tilda-${Date.now()}`;

    const { error } = await supabase.from("orders").insert({
      tilda_order_id: tildaOrderId,

      customer_name: name || "Клиент из Тильды",
      customer_phone: phone,
      customer_email: email,

      order_source: "Tilda",
      contact_value: telegram,
      telegram_username: normalizeTelegram(telegram),

      product_name: productName || "Заказ из Тильды",

      status: "Новый",
      priority: "Обычный",

      delivery_service: "Не указана",

      sale_price: Number.isNaN(salePrice) ? 0 : salePrice,
      product_cost: 0,
      print_cost: 0,
      packaging_cost: 0,
      profit: Number.isNaN(salePrice) ? 0 : salePrice,

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