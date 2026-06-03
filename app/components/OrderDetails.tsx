"use client";

import { useState } from "react";

const statuses = [
  "Новый",
  "Ожидание материала",
  "Ожидание печати",
  "Печать",
  "Ожидание упаковки",
  "На отправку",
  "Отправлен",
];

function normalizeUsername(value: string) {
  return value.replace("@", "").trim();
}

function formatContact(order: any) {
    if (!order.contactValue) return "";
  
    if (
      order.orderSource === "Telegram" ||
      order.orderSource === "Tilda" ||
      order.orderSource === "Instagram"
    ) {
      return `@${normalizeUsername(order.contactValue)}`;
    }
  
    return order.contactValue;
  }

function getContactLink(order: any) {
  const value = order.contactValue || "";

  if (!value) return "";

  if (order.orderSource === "Telegram" || order.orderSource === "Tilda") {
    return `https://t.me/${normalizeUsername(value)}`;
  }

  if (order.orderSource === "Instagram") {
    return `https://instagram.com/${normalizeUsername(value)}`;
  }

  if (order.orderSource === "WhatsApp") {
    const phone = value.replace(/\D/g, "");
    return `https://wa.me/${phone}`;
  }

  if (value.startsWith("http")) {
    return value;
  }

  return "";
}

type OrderDetailsProps = {
  order: any;
  onClose: () => void;
  onSave: (updatedOrder: any) => void;
  onDelete: (order: any) => void;
};

export default function OrderDetails({
  order,
  onClose,
  onSave,
  onDelete,
}: OrderDetailsProps) {
  const [status, setStatus] = useState(order.status);
  const [priority, setPriority] = useState(order.priority);
  const [trackNumber, setTrackNumber] = useState(order.trackNumber || "");
  const [comment, setComment] = useState(order.comment || "");

  const [orderSource, setOrderSource] = useState(order.orderSource || "");
  const [contactValue, setContactValue] = useState(order.contactValue || "");

  const contactLink = getContactLink({
    ...order,
    orderSource,
    contactValue,
  });

  function handleSave() {
    const normalizedContact = contactValue.trim();

    onSave({
      ...order,
      status,
      priority,
      trackNumber,
      comment,

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
    });

    onClose();
  }

  function handleDelete() {
    const isConfirmed = confirm("Удалить этот заказ?");
    if (!isConfirmed) return;
    onDelete(order);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400">{order.id}</p>

            <h2 className="mt-1 text-3xl font-bold text-black">
              {order.product}
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              Удалить
            </button>

            <button
              onClick={onClose}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
            >
              Закрыть
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
          src={order.image}
          alt={order.product}
          className="mb-6 h-72 w-full rounded-3xl bg-zinc-100 object-contain p-4"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block text-zinc-500">Статус</span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
            >
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-2 block text-zinc-500">Срочность</span>

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
            >
              <option>Обычный</option>
              <option>Срочный</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-5">
            <h3 className="mb-4 text-lg font-semibold">Клиент</h3>

            <div className="space-y-3 text-sm">
              <p>{order.customer}</p>

              {order.phone && (
                <a
                  href={`tel:${order.phone}`}
                  className="block text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-black"
                >
                  {order.phone}
                </a>
              )}

              {order.email && (
                <a
                  href={`mailto:${order.email}`}
                  className="block text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-black"
                >
                  {order.email}
                </a>
              )}

              <p>{order.address}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-5">
            <h3 className="mb-4 text-lg font-semibold">Контакты</h3>

            <div className="space-y-4 text-sm">
              <label>
                <span className="mb-2 block text-zinc-500">
                  Источник заказа
                </span>

                <select
                  value={orderSource}
                  onChange={(event) => setOrderSource(event.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option>Telegram</option>
                  <option>Instagram</option>
                  <option>WhatsApp</option>
                  <option>Tilda</option>
                  <option>Другое</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-zinc-500">
                  Контакт / ник / ссылка
                </span>

                <input
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  placeholder="@username или ссылка"
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
                />
              </label>

              {contactValue && contactLink && (
  <a
    href={contactLink}
    target="_blank"
    rel="noreferrer"
    className="block rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
  >
    {formatContact({
      ...order,
      orderSource,
      contactValue,
    })}
  </a>
)}

              {contactValue && !contactLink && (
                <p className="rounded-2xl bg-zinc-100 p-4 text-zinc-600">
                  {contactValue}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-5">
            <h3 className="mb-4 text-lg font-semibold">Производство</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Изделие</span>
                <span>{order.productCost} ₽</span>
              </div>

              <div className="flex justify-between">
                <span>Печать</span>
                <span>{order.printCost} ₽</span>
              </div>

              <div className="flex justify-between">
                <span>Упаковка</span>
                <span>{order.packagingCost} ₽</span>
              </div>

              <div className="flex justify-between">
                <span>Продажа</span>
                <span>{order.salePrice} ₽</span>
              </div>

              <div className="flex justify-between font-semibold text-red-500">
                <span>Прибыль</span>
                <span>{order.profit} ₽</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-5">
            <h3 className="mb-4 text-lg font-semibold">Логистика</h3>

            <div className="space-y-4 text-sm">
              <p>Служба доставки: {order.deliveryService || "Не указана"}</p>
              <p>Адрес: {order.address || "Не указан"}</p>
              <label>
                <span className="mb-2 block text-zinc-500">Трек-номер</span>

                <input
                  value={trackNumber}
                  onChange={(event) => setTrackNumber(event.target.value)}
                  placeholder="Введите трек-номер"
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-black"
                />
              </label>

              <p>Дедлайн: {order.deadline}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-5 md:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Комментарий</h3>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Добавьте комментарий"
              className="min-h-32 w-full rounded-2xl border border-zinc-200 p-4 text-sm outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}