"use client";

import { useState } from "react";

type CreateProductModalProps = {
  onClose: () => void;
  onCreate: (product: any) => void;
};

export default function CreateProductModal({
  onClose,
  onCreate,
}: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productCost, setProductCost] = useState("");
  const [printCost, setPrintCost] = useState("");
  const [packagingCost, setPackagingCost] = useState("");

  function handleCreate() {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      image_url: imageUrl.trim(),
      product_cost: Number(productCost || 0),
      print_cost: Number(printCost || 0),
      packaging_cost: Number(packagingCost || 0),
      product_sizes: [],
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Новый товар</p>
            <h2 className="text-3xl font-bold text-black">
              Добавить товар
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
          >
            Закрыть
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Название товара
            </p>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Например Grid Legends: Lewis Hamilton"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Ссылка на фото
            </p>

            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость изделия
            </p>

            <input
              value={productCost}
              onChange={(event) => setProductCost(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость печати
            </p>

            <input
              value={printCost}
              onChange={(event) => setPrintCost(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость упаковки
            </p>

            <input
              value={packagingCost}
              onChange={(event) => setPackagingCost(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="mt-6 w-full rounded-2xl bg-black py-4 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Создать товар
        </button>
      </div>
    </div>
  );
}