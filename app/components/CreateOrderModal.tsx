"use client";

import { useState } from "react";

type CreateOrderModalProps = {
  products: any[];
  onClose: () => void;
  onCreate: (order: any) => void;
};

export default function CreateOrderModal({
  products,
  onClose,
  onCreate,
}: CreateOrderModalProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [priority, setPriority] = useState("Обычный");

  const [orderSource, setOrderSource] = useState("Telegram");
  const [contactValue, setContactValue] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  const productSizes = selectedProduct?.product_sizes || [];

  const selectedSize = productSizes.find(
    (size: any) => size.id === selectedSizeId
  );

  function handleProductChange(productId: string) {
    setSelectedProductId(productId);
    setSelectedSizeId("");

    const product = products.find((item) => item.id === productId);

    if (product) {
      setSalePrice(String(product.base_price || 0));
    }
  }

  function handleCreate() {
    if (!selectedProduct || !selectedSize) return;

    const finalSalePrice = Number(salePrice);
    const productCost = selectedProduct.product_cost || 0;
    const printCost = selectedProduct.print_cost || 0;
    const packagingCost = selectedProduct.packaging_cost || 0;

    const normalizedContact = contactValue.trim();

    onCreate({
      id: `#${Date.now()}`,

      customer,
      phone,

      email: "",
      address: "",

      orderSource,
      contactValue: normalizedContact,

      telegramUsername:
        orderSource === "Telegram" || orderSource === "Tilda"
          ? normalizedContact
          : "",

      instagramUsername:
        orderSource === "Instagram" ? normalizedContact : "",

      whatsappPhone:
        orderSource === "WhatsApp" ? normalizedContact : "",

      product: selectedProduct.name,
      productId: selectedProduct.id,

      size: selectedSize.size,
      productSizeId: selectedSize.id,

      salePrice: finalSalePrice,
      productCost,
      printCost,
      packagingCost,
      profit: finalSalePrice - productCost - printCost - packagingCost,

      status: "Новый",
      priority,

      deadline: "",

      deliveryService: "Яндекс",
      trackNumber: "",

      comment: "",

      image: selectedProduct.image_url,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Новый заказ</h2>

          <button
            onClick={onClose}
            className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
          >
            Закрыть
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={selectedProductId}
            onChange={(event) => handleProductChange(event.target.value)}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black md:col-span-2"
          >
            <option value="">Выберите товар</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSizeId}
            onChange={(event) => setSelectedSizeId(event.target.value)}
            disabled={!selectedProduct}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black disabled:bg-zinc-100 disabled:text-zinc-400 md:col-span-2"
          >
            <option value="">Выберите размер</option>

            {productSizes.map((size: any) => (
              <option key={size.id} value={size.id}>
                {size.size}
              </option>
            ))}
          </select>

          <input
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            placeholder="Имя клиента"
            className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
          />

          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Телефон"
            className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
          />

          <select
            value={orderSource}
            onChange={(event) => setOrderSource(event.target.value)}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option>Telegram</option>
            <option>Instagram</option>
            <option>WhatsApp</option>
            <option>Tilda</option>
            <option>Другое</option>
          </select>

          <input
            value={contactValue}
            onChange={(event) => setContactValue(event.target.value)}
            placeholder={
              orderSource === "WhatsApp"
                ? "Номер WhatsApp"
                : orderSource === "Instagram"
                ? "Ник Instagram"
                : orderSource === "Telegram" || orderSource === "Tilda"
                ? "Ник Telegram"
                : "Контакт или ссылка"
            }
            className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
          />

          <input
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            placeholder="Стоимость продажи"
            className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option>Обычный</option>
            <option>Срочный</option>
          </select>

          {selectedProduct && (
            <div className="rounded-2xl bg-zinc-100 p-4 text-sm md:col-span-2">
              <p className="font-medium">{selectedProduct.name}</p>

              <p className="mt-1 text-zinc-500">
                Себестоимость: изделие {selectedProduct.product_cost || 0} ₽,
                печать {selectedProduct.print_cost || 0} ₽, упаковка{" "}
                {selectedProduct.packaging_cost || 0} ₽
              </p>

              {selectedSize && (
                <p className="mt-2 text-zinc-500">
                  Размер: {selectedSize.size}
                </p>
              )}

              {contactValue && (
                <p className="mt-2 text-zinc-500">
                  Контакт: {orderSource} — {contactValue}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={!selectedProduct || !selectedSize}
          className="mt-6 w-full rounded-2xl bg-black py-4 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Создать заказ
        </button>
      </div>
    </div>
  );
}