"use client";

import { useEffect, useState } from "react";

import OrderCard from "./components/OrderCard";
import OrderDetails from "./components/OrderDetails";
import CreateOrderModal from "./components/CreateOrderModal";
import CreateProductModal from "./components/CreateProductModal";
import ProductDetails from "./components/ProductDetails";

import { supabase } from "./lib/supabase";

const statuses = [
  "Все",
  "Новый",
  "Ожидание материала",
  "Ожидание печати",
  "Печать",
  "Ожидание упаковки",
  "На отправку",
  "Отправлен",
];

export default function Home() {
  const [section, setSection] = useState("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeStatus, setActiveStatus] = useState("Все");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_sizes(*, product_print_files(*))")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки товаров:", error);
        return;
      }

      setProducts(data || []);
    }

    async function loadOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки заказов:", error);
        return;
      }

      const formattedOrders = (data || []).map((order) => ({
        id: order.tilda_order_id || `#${order.id}`,
        customer: order.customer_name || "",
        phone: order.customer_phone || "",
        email: order.customer_email || "",
        address: order.address || "",
        product: order.product_name || "",
        productId: order.product_id,
        productSizeId: order.product_size_id,
        size: order.size || "",
        image: order.image_url || "",
        status: order.status || "Новый",
        priority: order.priority || "Обычный",
        deadline: order.deadline || "",
        deliveryService: order.delivery_service || "",
        trackNumber: order.track_number || "",
        salePrice: order.sale_price || 0,
        productCost: order.product_cost || 0,
        printCost: order.print_cost || 0,
        packagingCost: order.packaging_cost || 0,
        profit: order.profit || 0,
        comment: order.comment || "",

        orderSource: order.order_source || "",
        contactValue: order.contact_value || "",
        telegramUsername: order.telegram_username || "",
        instagramUsername: order.instagram_username || "",
        whatsappPhone: order.whatsapp_phone || "",
      }));

      setOrders(formattedOrders);
    }

    loadProducts();
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeStatus === "Все" || order.status === activeStatus;

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.product.toLowerCase().includes(query) ||
      order.phone.toLowerCase().includes(query) ||
      (order.contactValue || "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  function generatePrintExport() {
    const printOrders = orders.filter(
      (order) =>
        order.status === "Ожидание печати" ||
        order.status === "Ожидание материала"
    );

    const grouped: Record<string, Record<string, number>> = {};

    printOrders.forEach((order) => {
      const product = products.find((item) => item.id === order.productId);

      const sizeItem = product?.product_sizes?.find(
        (item: any) =>
          item.id === order.productSizeId || item.size === order.size
      );

      const printFiles = sizeItem?.product_print_files || [];

      printFiles.forEach((file: any) => {
        const folderName = file.folder_name || "Без папки";
        const layoutName = file.layout_name || "Без названия";
        const layoutSize = file.layout_size || "Без размера";
        const key = `${layoutName}, ${layoutSize}`;

        if (!grouped[folderName]) grouped[folderName] = {};
        grouped[folderName][key] = (grouped[folderName][key] || 0) + 1;
      });
    });

    return Object.entries(grouped)
      .map(([folderName, items]) => {
        const lines = Object.entries(items)
          .map(([item, count]) => `– ${item}, ${count}шт`)
          .join("\n");

        return `Из папки "${folderName}"\n${lines}`;
      })
      .join("\n\n");
  }

  const printExportText = generatePrintExport();

  async function updateOrder(updatedOrder: any, keepOpen = false) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );

    const { error } = await supabase
      .from("orders")
      .update({
        status: updatedOrder.status,
        priority: updatedOrder.priority,
        track_number: updatedOrder.trackNumber,
        comment: updatedOrder.comment,
        order_source: updatedOrder.orderSource,
        contact_value: updatedOrder.contactValue,
        telegram_username: updatedOrder.telegramUsername,
        instagram_username: updatedOrder.instagramUsername,
        whatsapp_phone: updatedOrder.whatsappPhone,
      })
      .eq("tilda_order_id", updatedOrder.id);

    if (error) {
      console.error("Ошибка обновления заказа:", error);
    }

    if (keepOpen) {
      setSelectedOrder(updatedOrder);
    }
  }

  async function deleteOrder(orderToDelete: any) {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("tilda_order_id", orderToDelete.id);

    if (error) {
      console.error("Ошибка удаления заказа:", error);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderToDelete.id)
    );

    setSelectedOrder(null);
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-black">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setSection("orders")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                section === "orders"
                  ? "bg-black text-white"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              Заказы
            </button>

            <button
              onClick={() => setSection("products")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                section === "products"
                  ? "bg-black text-white"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              Товары
            </button>

            <button
              onClick={() => setSection("print")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                section === "print"
                  ? "bg-black text-white"
                  : "border border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              Печать
            </button>
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            {section === "orders"
              ? "Production CRM"
              : section === "products"
              ? "Товары"
              : "Экспорт на печать"}
          </h1>

          <p className="mt-2 text-zinc-500">
            {section === "orders"
              ? "Управление производством и заказами"
              : section === "products"
              ? "База изделий, себестоимости и макетов печати"
              : "Готовый список макетов для передачи в печать"}
          </p>

          {section === "products" && (
  <button
    onClick={() => setIsCreateProductOpen(true)}
    className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
  >
    + Новый товар
  </button>
)}

          {section === "orders" && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              + Новый заказ
            </button>
          )}
        </div>

        {section === "orders" && (
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск: имя, заказ, товар, телефон, контакт"
            className="w-full rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-black lg:max-w-sm"
          />
        )}
      </div>

      {section === "orders" && (
        <>
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
            {statuses.map((status) => {
              const count =
                status === "Все"
                  ? orders.length
                  : orders.filter((order) => order.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    status === activeStatus
                      ? "bg-black text-white"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:border-black hover:text-black"
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer"
              >
                <OrderCard
                  order={order}
                  onStatusChange={(newStatus) =>
                    updateOrder({
                      ...order,
                      status: newStatus,
                    })
                  }
                />
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
              Ничего не найдено
            </div>
          )}
        </>
      )}

      {section === "products" && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="cursor-pointer rounded-3xl border border-zinc-200 bg-white p-5 transition hover:border-black"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="mb-5 h-48 w-full rounded-2xl bg-zinc-100 object-contain p-3"
              />

              <h2 className="text-xl font-semibold">{product.name}</h2>

              <div className="mt-4 space-y-2 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Изделие</span>
                  <span>{product.product_cost || 0} ₽</span>
                </div>

                <div className="flex justify-between">
                  <span>Печать</span>
                  <span>{product.print_cost || 0} ₽</span>
                </div>

                <div className="flex justify-between">
                  <span>Упаковка</span>
                  <span>{product.packaging_cost || 0} ₽</span>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-100 pt-4">
                <p className="mb-3 text-sm font-medium text-black">Размеры</p>

                <div className="space-y-3">
                  {(product.product_sizes || []).length === 0 && (
                    <p className="text-sm text-zinc-400">
                      Размеры пока не добавлены
                    </p>
                  )}

                  {(product.product_sizes || []).map((sizeItem: any) => (
                    <div
                      key={sizeItem.id}
                      className="rounded-2xl bg-zinc-100 p-4 text-sm"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="font-medium">
                          Размер {sizeItem.size}
                        </span>

                        <span className="text-zinc-500">
                          {(sizeItem.product_print_files || []).length} мак.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "print" && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Список на печать</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Берутся заказы со статусом “Ожидание материала” и “Ожидание
                печати”
              </p>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(printExportText)}
              className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Скопировать
            </button>
          </div>

          <pre className="min-h-96 whitespace-pre-wrap rounded-2xl bg-zinc-100 p-5 text-sm leading-7 text-zinc-900">
            {printExportText || "Нет заказов для печати"}
          </pre>
        </div>
      )}

      {isCreateOpen && (
        <CreateOrderModal
          products={products}
          onClose={() => setIsCreateOpen(false)}
          onCreate={async (newOrder) => {
            const { error } = await supabase.from("orders").insert({
              tilda_order_id: newOrder.id,
              customer_name: newOrder.customer,
              customer_phone: newOrder.phone,
              customer_email: newOrder.email,

              order_source: newOrder.orderSource,
              contact_value: newOrder.contactValue,
              telegram_username: newOrder.telegramUsername,
              instagram_username: newOrder.instagramUsername,
              whatsapp_phone: newOrder.whatsappPhone,

              product_id: newOrder.productId,
              product_size_id: newOrder.productSizeId,
              product_name: newOrder.product,
              size: newOrder.size,
              image_url: newOrder.image,
              status: newOrder.status,
              priority: newOrder.priority,
              deadline: newOrder.deadline,
              delivery_service: newOrder.deliveryService,
              address: newOrder.address,
              track_number: newOrder.trackNumber,
              sale_price: newOrder.salePrice,
              product_cost: newOrder.productCost,
              print_cost: newOrder.printCost,
              packaging_cost: newOrder.packagingCost,
              profit: newOrder.profit,
              comment: newOrder.comment,
            });

            if (error) {
              console.error("Ошибка создания заказа:", error);
              return;
            }

            setOrders((currentOrders) => [newOrder, ...currentOrders]);
            setIsCreateOpen(false);
          }}
        />
      )}
{isCreateProductOpen && (
  <CreateProductModal
    onClose={() => setIsCreateProductOpen(false)}
    onCreate={async (newProduct) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          image_url: newProduct.image_url,
          product_cost: newProduct.product_cost,
          print_cost: newProduct.print_cost,
          packaging_cost: newProduct.packaging_cost,
        })
        .select("*, product_sizes(*, product_print_files(*))")
        .single();

      if (error) {
        console.error("Ошибка создания товара:", error);
        return;
      }

      setProducts((currentProducts) => [data, ...currentProducts]);
      setIsCreateProductOpen(false);
    }}
  />
)}
      {selectedProduct && (
       <ProductDetails
       product={selectedProduct}
       onClose={() => setSelectedProduct(null)}
     
       onDelete={async () => {
         const confirmed = confirm(
           "Удалить товар и все его размеры/макеты?"
         );
     
         if (!confirmed) return;
     
         const { error } = await supabase
           .from("products")
           .delete()
           .eq("id", selectedProduct.id);
     
         if (error) {
           console.error("Ошибка удаления товара:", error);
           return;
         }
     
         setProducts((currentProducts) =>
           currentProducts.filter(
             (product) => product.id !== selectedProduct.id
           )
         );
     
         setSelectedProduct(null);
       }}
     
       onSave={async (updatedProduct) => {
        const { error: productError } = await supabase
        .from("products")
        .update({
          name: updatedProduct.name,
          image_url: updatedProduct.image_url,
          tilda_product_uid: updatedProduct.tilda_product_uid,
          product_cost: updatedProduct.product_cost,
          print_cost: updatedProduct.print_cost,
          packaging_cost: updatedProduct.packaging_cost,
        })
        .eq("id", updatedProduct.id);

            if (productError) {
              console.error("Ошибка обновления товара:", productError);
              return;
            }

            const sizesToSave = updatedProduct.product_sizes || [];

            for (const sizeItem of sizesToSave) {
              let sizeId = sizeItem.id;

              if (String(sizeItem.id).startsWith("new-size-")) {
                const { data: createdSize, error } = await supabase
                  .from("product_sizes")
                  .insert({
                    product_id: updatedProduct.id,
                    size: sizeItem.size,
                  })
                  .select()
                  .single();

                if (error) {
                  console.error("Ошибка создания размера:", error);
                  continue;
                }

                sizeId = createdSize.id;
              } else {
                const { error } = await supabase
                  .from("product_sizes")
                  .update({
                    size: sizeItem.size,
                  })
                  .eq("id", sizeItem.id);

                if (error) {
                  console.error("Ошибка обновления размера:", error);
                }
              }

              const printFiles = sizeItem.product_print_files || [];

              for (const file of printFiles) {
                const payload = {
                  product_size_id: sizeId,
                  layout_name: file.layout_name,
                  folder_name: file.folder_name,
                  layout_folder_url: file.layout_folder_url,
                  layout_size: file.layout_size,
                };

                if (String(file.id).startsWith("new-file-")) {
                  const { error } = await supabase
                    .from("product_print_files")
                    .insert(payload);

                  if (error) {
                    console.error("Ошибка создания макета:", error);
                  }
                } else {
                  const { error } = await supabase
                    .from("product_print_files")
                    .update(payload)
                    .eq("id", file.id);

                  if (error) {
                    console.error("Ошибка обновления макета:", error);
                  }
                }
              }
            }

            const { data: refreshedProduct } = await supabase
              .from("products")
              .select("*, product_sizes(*, product_print_files(*))")
              .eq("id", updatedProduct.id)
              .single();

            setProducts((currentProducts) =>
              currentProducts.map((product) =>
                product.id === updatedProduct.id ? refreshedProduct : product
              )
            );

            setSelectedProduct(null);
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={(updatedOrder) => updateOrder(updatedOrder, true)}
          onDelete={deleteOrder}
        />
      )}
    </main>
  );
}