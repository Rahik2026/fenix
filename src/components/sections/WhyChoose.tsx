export default function WhyChoose() {
  const items = [
    ["1", "Premium presentation", "Each product page includes gallery images, live pricing, sizes, stock, and related items."],
    ["2", "Manual bKash payment", "Place an order, pay via bKash, then submit your transaction details for admin verification."],
    ["3", "Integrated admin tools", "Products, orders, categories, banners, coupons, and CMS text are managed from one dashboard."],
    ["4", "Designed for every screen", "Compact, responsive layout polished across mobile, tablet, and desktop sizes."],
  ];
  return (
    <section className="py-10 md:py-12 bg-white/55">
      <div className="container-x">
        <div className="grid gap-2 mb-6">
          <span className="kicker">Why choose us</span>
          <h2 className="serif-title text-[28px] md:text-[44px] text-[#122033]">
            A smoother custom jersey shopping experience
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map(([n, title, body]) => (
            <article key={n} className="card p-5">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-2/12 text-primary-2 font-bold mb-3">
                {n}
              </span>
              <h3 className="serif-title text-lg mb-1.5 text-[#122033]">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
