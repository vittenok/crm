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
  
    if (value.startsWith("http")) return value;
  
    return "";
  }
  
  type OrderCardProps = {
    order: any;
    onStatusChange: (status: string) => void;
  };
  
  export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
    const contactLink = getContactLink(order);
    const contactLabel = formatContact(order);
  
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-wide text-zinc-400">
            {order.id}
          </p>
  
          <div className="flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                order.priority === "Срочный"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {order.priority}
            </span>
  
            <select
              value={order.status}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        <div className="flex gap-4">
          <img
            src={order.image}
            alt={order.product}
            className="h-28 w-28 shrink-0 rounded-2xl bg-zinc-100 object-contain p-2"
          />
  
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-black">
              {order.product}
            </h3>
  
            <p className="mt-1 text-sm text-zinc-500">Размер: {order.size}</p>
  
            <p className="mt-3 text-sm font-medium text-zinc-800">
              {order.customer}
            </p>
  
            {contactLabel && contactLink && (
              <a
                href={contactLink}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="mt-1 block text-sm font-medium text-red-500 hover:underline"
              >
                {contactLabel}
              </a>
            )}
  {(order.phone || order.address) && (
  <div className="mt-3 rounded-2xl bg-zinc-100 p-3 text-xs text-zinc-600">
    <p className="mb-2 font-semibold text-black">Доставка</p>

    {order.phone && (
      <button
        onClick={(event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(order.phone);
        }}
        className="mb-2 block w-full rounded-xl bg-white px-3 py-2 text-left hover:bg-zinc-50"
      >
        Телефон: {order.phone}
      </button>
    )}

    {order.address && (
      <button
        onClick={(event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(order.address);
        }}
        className="block w-full rounded-xl bg-white px-3 py-2 text-left hover:bg-zinc-50"
      >
        Адрес: {order.address}
      </button>
    )}
  </div>
)}
            <p className="mt-1 text-xs text-zinc-400">
              Дедлайн: {order.deadline}
            </p>
          </div>
        </div>
  
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Продажа</span>
            <span className="font-semibold text-black">{order.salePrice} ₽</span>
          </div>
  
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Прибыль</span>
            <span className="font-semibold text-red-500">{order.profit} ₽</span>
          </div>
        </div>
      </div>
    );
  }