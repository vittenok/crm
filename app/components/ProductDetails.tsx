"use client";

import { useState } from "react";

type ProductDetailsProps = {
    product: any;
    onClose: () => void;
    onSave: (product: any) => void;
    onDelete: () => void;
  };
  
  export default function ProductDetails({
    product,
    onClose,
    onSave,
    onDelete,
  }: ProductDetailsProps) {
  const [name, setName] = useState(product.name || "");
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [productCost, setProductCost] = useState(product.product_cost || 0);
  const [printCost, setPrintCost] = useState(product.print_cost || 0);
  const [packagingCost, setPackagingCost] = useState(
    product.packaging_cost || 0
  );

  const [sizes, setSizes] = useState(product.product_sizes || []);

  function addSize() {
    setSizes((currentSizes: any[]) => [
      ...currentSizes,
      {
        id: `new-size-${Date.now()}`,
        product_id: product.id,
        size: "",
        product_print_files: [],
      },
    ]);
  }

  function updateSize(index: number, value: string) {
    setSizes((currentSizes: any[]) =>
      currentSizes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, size: value } : item
      )
    );
  }

  function addPrintFile(sizeIndex: number) {
    setSizes((currentSizes: any[]) =>
      currentSizes.map((item, itemIndex) =>
        itemIndex === sizeIndex
          ? {
              ...item,
              product_print_files: [
                ...(item.product_print_files || []),
                {
                  id: `new-file-${Date.now()}`,
                  product_size_id: item.id,
                  layout_name: "",
                  folder_name: "",
                  layout_folder_url: "",
                  layout_size: "",
                },
              ],
            }
          : item
      )
    );
  }

  function updatePrintFile(
    sizeIndex: number,
    fileIndex: number,
    field: string,
    value: string
  ) {
    setSizes((currentSizes: any[]) =>
      currentSizes.map((sizeItem, currentSizeIndex) => {
        if (currentSizeIndex !== sizeIndex) return sizeItem;

        return {
          ...sizeItem,
          product_print_files: (sizeItem.product_print_files || []).map(
            (file: any, currentFileIndex: number) =>
              currentFileIndex === fileIndex
                ? {
                    ...file,
                    [field]: value,
                  }
                : file
          ),
        };
      })
    );
  }

  function handleSave() {
    onSave({
      ...product,
      name,
      image_url: imageUrl,
      product_cost: Number(productCost),
      print_cost: Number(printCost),
      packaging_cost: Number(packagingCost),
      product_sizes: sizes,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Карточка товара</p>
            <h2 className="mt-1 text-3xl font-bold text-black">{name}</h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
            >
              Закрыть
            </button>

            <button
  onClick={onDelete}
  className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
>
  Удалить
</button>

            <button
              onClick={handleSave}
              className="rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Сохранить
            </button>
          </div>
        </div>

        <img
          src={imageUrl}
          alt={name}
          className="mb-6 h-72 w-full rounded-3xl bg-zinc-100 object-contain p-4"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Название товара
            </p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Название товара"
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
              placeholder="Ссылка на фото"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость изделия
            </p>
            <input
              value={productCost}
              onChange={(event) => setProductCost(Number(event.target.value))}
              placeholder="Стоимость изделия"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость печати
            </p>
            <input
              value={printCost}
              onChange={(event) => setPrintCost(Number(event.target.value))}
              placeholder="Стоимость печати"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Стоимость упаковки
            </p>
            <input
              value={packagingCost}
              onChange={(event) =>
                setPackagingCost(Number(event.target.value))
              }
              placeholder="Стоимость упаковки"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Размеры и макеты</h3>
              <p className="mt-1 text-sm text-zinc-400">
                У каждого размера может быть несколько макетов печати
              </p>
            </div>

            <button
              onClick={addSize}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
            >
              + Добавить размер
            </button>
          </div>

          <div className="space-y-5">
            {sizes.map((sizeItem: any, sizeIndex: number) => (
              <div
                key={sizeItem.id}
                className="rounded-3xl border border-zinc-200 p-5"
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-zinc-500">
                      Размер изделия
                    </p>
                    <input
                      value={sizeItem.size || ""}
                      onChange={(event) =>
                        updateSize(sizeIndex, event.target.value)
                      }
                      placeholder="Например S, M, L, XL"
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <button
                    onClick={() => addPrintFile(sizeIndex)}
                    className="rounded-full bg-black px-4 py-3 text-sm text-white hover:bg-zinc-800"
                  >
                    + Макет
                  </button>
                </div>

                <div className="space-y-3">
                  {(sizeItem.product_print_files || []).length === 0 && (
                    <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-500">
                      Макеты для этого размера пока не добавлены
                    </div>
                  )}

                  {(sizeItem.product_print_files || []).map(
                    (file: any, fileIndex: number) => (
                      <div
                        key={file.id}
                        className="grid gap-3 rounded-2xl bg-zinc-100 p-4 md:grid-cols-2"
                      >
                        <div>
                          <p className="mb-2 text-sm font-medium text-zinc-500">
                            Название файла
                          </p>
                          <input
                            value={file.layout_name || ""}
                            onChange={(event) =>
                              updatePrintFile(
                                sizeIndex,
                                fileIndex,
                                "layout_name",
                                event.target.value
                              )
                            }
                            placeholder="Например hamilton_l_front.pdf"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium text-zinc-500">
                            Размер макета
                          </p>
                          <input
                            value={file.layout_size || ""}
                            onChange={(event) =>
                              updatePrintFile(
                                sizeIndex,
                                fileIndex,
                                "layout_size",
                                event.target.value
                              )
                            }
                            placeholder="Например 32×45 см"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium text-zinc-500">
                            Название папки
                          </p>
                          <input
                            value={file.folder_name || ""}
                            onChange={(event) =>
                              updatePrintFile(
                                sizeIndex,
                                fileIndex,
                                "folder_name",
                                event.target.value
                              )
                            }
                            placeholder="Например Hamilton / L"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium text-zinc-500">
                            Ссылка на папку
                          </p>
                          <input
                            value={file.layout_folder_url || ""}
                            onChange={(event) =>
                              updatePrintFile(
                                sizeIndex,
                                fileIndex,
                                "layout_folder_url",
                                event.target.value
                              )
                            }
                            placeholder="Google Drive / Dropbox"
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}

            {sizes.length === 0 && (
              <div className="rounded-3xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                Размеры пока не добавлены
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}