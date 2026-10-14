import { FormEvent, ReactNode, useEffect, useState } from "react";

type IconName =
  | "arrow"
  | "check"
  | "code"
  | "globe"
  | "menu"
  | "moon"
  | "palette"
  | "phone"
  | "rocket"
  | "send"
  | "sun"
  | "x";

type Package = {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
};

const ADMIN_WHATSAPP = (import.meta.env.VITE_ADMIN_WHATSAPP as string | undefined) || "6281234567890";

const packages: Package[] = [
  {
    name: "Starter",
    price: "Rp25.000",
    description: "Untuk profil sederhana dan langkah pertama di dunia digital.",
    features: ["1 halaman website", "Desain responsif", "1x revisi", "Estimasi 2–3 hari"],
  },
  {
    name: "Growth",
    price: "Rp75.000",
    description: "Pilihan tepat untuk UMKM yang ingin terlihat lebih profesional.",
    features: ["Hingga 3 halaman", "Desain sesuai brand", "Tombol WhatsApp", "2x revisi"],
    popular: true,
  },
  {
    name: "Custom",
    price: "Diskusikan",
    description: "Untuk ide unik dengan fitur dan kebutuhan yang lebih spesifik.",
    features: ["Halaman fleksibel", "Fitur custom", "Konsultasi desain", "Revisi sesuai scope"],
  },
];

const services = [
  {
    icon: "globe" as IconName,
    title: "Profil & Personal",
    text: "Tunjukkan karya, pengalaman, dan identitas profesionalmu dalam satu tempat.",
  },
  {
    icon: "rocket" as IconName,
    title: "Bisnis & UMKM",
    text: "Buat bisnismu lebih mudah ditemukan dan dipercaya oleh pelanggan.",
  },
  {
    icon: "palette" as IconName,
    title: "Landing Page",
    text: "Halaman promosi fokus konversi dengan tampilan modern dan terarah.",
  },
  {
    icon: "code" as IconName,
    title: "Website Custom",
    text: "Punya ide berbeda? Kami siap menerjemahkannya menjadi produk digital.",
  },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    code: (
      <>
        <path d="m8 9-3 3 3 3" />
        <path d="m16 9 3 3-3 3" />
        <path d="m14 5-4 14" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
    palette: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="8" cy="9" r=".5" fill="currentColor" />
        <circle cx="12" cy="7" r=".5" fill="currentColor" />
        <circle cx="16" cy="9" r=".5" fill="currentColor" />
        <path d="M15 17c-1.1 0-2-.9-2-2s.9-2 2-2h1.5a2.5 2.5 0 0 1 0 5H15Z" />
      </>
    ),
    phone: (
      <path d="M8.5 3.5 10 7 8 9c1.3 2.7 3.3 4.7 6 6l2-2 3.5 1.5v4c0 1-1 2-2 2A14 14 0 0 1 3.5 6c0-1 1-2 2-2h3Z" />
    ),
    rocket: (
      <>
        <path d="M14 5c2.5-2.5 5-2 5-2s.5 2.5-2 5l-5 5-4-4 6-4Z" />
        <path d="m8 9-3 1-2 3 5 1 2 5 3-2 1-4M6 18l-2 2" />
        <circle cx="15" cy="7" r="1" />
      </>
    ),
    send: (
      <>
        <path d="m3 4 18 8-18 8 3-8-3-8Z" />
        <path d="M6 12h15" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </>
    ),
    x: <path d="M6 6l12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("atlas-theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("Growth");
  const [contact, setContact] = useState(() => {
    const saved = localStorage.getItem("atlas-contact");
    return saved ? JSON.parse(saved) : { name: "", phone: "", email: "" };
  });
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("QRIS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("atlas-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("atlas-contact", JSON.stringify(contact));
  }, [contact]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll<HTMLElement>(
      "#services article, #work article, .package-card, #order form, #order > div > div:first-child"
    );
    targets.forEach((target) => target.classList.add("reveal-on-scroll"));
    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  const choosePackage = (name: string) => {
    setSelectedPackage(name);
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setOrderError("");

    // Reserve a tab synchronously to avoid mobile popup blockers.
    const whatsappTab = window.open("about:blank", "_blank");
    let orderId = "Belum tersimpan otomatis";
    let orderDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date());
    let saved = false;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          packageName: selectedPackage,
          notes: notes.trim(),
          payment,
          website: "",
        }),
      });

      const result = await response.json().catch(() => ({})) as {
        ok?: boolean;
        error?: unknown;
        message?: unknown;
        order?: { id?: string; createdAt?: string };
      };
      const getErrorText = (value: unknown): string => {
        if (typeof value === "string" && value.trim()) return value.trim();
        if (value && typeof value === "object") {
          const data = value as Record<string, unknown>;
          for (const key of ["message", "error", "detail", "hint", "code"]) {
            const candidate = data[key];
            if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
          }
          try {
            return JSON.stringify(value);
          } catch {
            return "Respons error tidak dapat dibaca.";
          }
        }
        return "";
      };
      if (!response.ok || !result.ok || !result.order?.id) {
        const detail = getErrorText(result.error) || getErrorText(result.message)
          || `Server gagal menyimpan pesanan (HTTP ${response.status}).`;
        throw new Error(detail);
      }
      orderId = result.order.id;
      orderDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" })
        .format(result.order.createdAt ? new Date(result.order.createdAt) : new Date());
      saved = true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Server tidak dapat dijangkau.";
      setOrderError(`Pesanan belum tersimpan otomatis (${detail}), tetapi kamu tetap bisa melanjutkan melalui WhatsApp.`);
    } finally {
      setIsSubmitting(false);
    }

    const message = [
      "Halo Admin Atlas! Saya ingin memesan *Jasa Pembuatan Website* Nih!",
      "",
      "Detail Pesanan :",
      "",
      `Nama Lengkap : ${contact.name}`,
      `Email : ${contact.email}`,
      `Paket Website : ${selectedPackage}`,
      `Metode Pembayaran : ${payment}`,
      `Tanggal Memesan : ${orderDate}`,
      "",
      `Deskripsi Website : ${notes.trim() || "Belum diisi"}`,
    ].join("\n");
    const number = ADMIN_WHATSAPP.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    if (whatsappTab && !whatsappTab.closed) {
      whatsappTab.location.href = whatsappUrl;
    } else {
      // If the browser blocks a new tab, continue in the current tab.
      window.location.assign(whatsappUrl);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-50 border-b-2 border-[var(--line-strong)] bg-[var(--bg)]">
        <div className="page flex h-18 items-center justify-between">
          <a className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight" href="#top">
            <span className="grid size-9 -rotate-3 place-items-center border-2 border-[var(--line-strong)] bg-[var(--accent)] text-slate-950">
              A
            </span>
            ATLAS<span className="text-[var(--accent)]">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a className="nav-link" href="#services">Layanan</a>
            <a className="nav-link" href="#work">Cara Kerja</a>
            <a className="nav-link" href="#packages">Paket</a>
            <a className="nav-link" href="#order">Kontak</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              aria-label={dark ? "Gunakan mode terang" : "Gunakan mode gelap"}
              className="icon-button"
              onClick={() => setDark(!dark)}
              type="button"
            >
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            <button
              aria-label="Buka menu"
              className="icon-button md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              <Icon name={menuOpen ? "x" : "menu"} />
            </button>
            <a className="button-primary hidden sm:flex" href="#packages">
              Lihat Paket <Icon name="arrow" size={18} />
            </a>
          </div>
        </div>
        {menuOpen && (
          <nav className="page flex flex-col gap-4 border-t border-[var(--line)] py-5 text-sm font-semibold md:hidden">
            {[
              ["Layanan", "services"],
              ["Cara Kerja", "work"],
              ["Paket", "packages"],
              ["Kontak", "order"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
        )}
      </header>

      <section className="hero-section page grid min-h-[calc(100svh-4.5rem)] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr]" id="top">
        <div>
          <div className="eyebrow"><span className="size-2 bg-[var(--accent)]" /> Jasa pembuatan website</div>
          <h1 className="mt-7 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Ide hebatmu layak <span className="text-[var(--accent)]">tampil digital.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            ATLAS membantu personal, bisnis, dan UMKM membangun website modern yang rapi, responsif, dan sesuai kebutuhan.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="button-primary" href="#packages">Mulai dari Rp25.000 <Icon name="arrow" size={18} /></a>
            <a className="button-secondary" href="#services">Jelajahi layanan</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[var(--muted)]">
            {["Responsif di HP", "Bisa request desain", "Harga bersahabat"].map((item) => (
              <span className="flex items-center gap-2" key={item}>
                <span className="text-[var(--accent)]"><Icon name="check" size={17} /></span>{item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-art relative mx-auto w-full max-w-xl">
          <div className="absolute -left-5 -top-5 h-28 w-28 border-l-4 border-t-4 border-[var(--accent)]" />
          <div className="relative border-2 border-[var(--line-strong)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b-2 border-[var(--line-strong)] px-5 py-4">
              <span className="size-2.5 rounded-full bg-[var(--accent)]" />
              <span className="size-2.5 rounded-full border border-[var(--line-strong)]" />
              <span className="size-2.5 rounded-full border border-[var(--line-strong)]" />
              <span className="ml-3 text-xs text-[var(--muted)]">atlas-studio.id</span>
            </div>
            <div className="p-7 sm:p-10">
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-sm font-extrabold">YOUR BRAND.</span>
                <div className="flex gap-4"><span className="h-1 w-8 bg-[var(--line-strong)]" /><span className="h-1 w-8 bg-[var(--line-strong)]" /></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Stand out online</span>
              <div className="mt-4 h-8 w-10/12 bg-[var(--text)]" />
              <div className="mt-3 h-8 w-7/12 bg-[var(--text)]" />
              <div className="mt-6 h-2 w-9/12 bg-[var(--line-strong)]" />
              <div className="mt-2 h-2 w-6/12 bg-[var(--line-strong)]" />
              <div className="mt-8 h-11 w-36 bg-[var(--accent)]" />
              <div className="mt-12 grid grid-cols-3 gap-3">
                <div className="h-20 bg-[var(--accent-soft)]" />
                <div className="h-20 border border-[var(--line)]" />
                <div className="h-20 border border-[var(--line)]" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-3 rotate-2 border-2 border-[var(--line-strong)] bg-[var(--accent)] px-5 py-4 text-slate-950 sm:right-[-1.5rem]">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Mulai dari</span>
            <strong className="font-display text-xl">Rp25.000</strong>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-[var(--line-strong)] bg-[var(--surface)] py-24" id="services">
        <div className="page">
          <SectionHeading eyebrow="Layanan kami" title="Semua yang kamu butuhkan untuk mulai." text="Dari ide pertama sampai website siap dilihat dunia, kami bantu setiap langkahnya." />
          <div className="mt-12 grid border-l-2 border-t-2 border-[var(--line-strong)] sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <article className="group border-b-2 border-r-2 border-[var(--line-strong)] p-7 transition-colors hover:bg-[var(--accent-soft)]" key={service.title}>
                <div className="mb-12 flex items-start justify-between">
                  <span className="grid size-12 -rotate-2 place-items-center border-2 border-[var(--line-strong)] bg-[var(--accent)] text-slate-950"><Icon name={service.icon} /></span>
                  <span className="font-mono text-xs text-[var(--muted)]">0{index + 1}</span>
                </div>
                <h3 className="font-display text-lg font-bold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page py-24" id="work">
        <SectionHeading eyebrow="Cara kerja" title="Sederhana, jelas, tanpa ribet." text="Kamu fokus pada idenya. Kami yang urus proses pembuatannya." />
        <div className="mt-14 grid gap-0 lg:grid-cols-3">
          {[
            ["01", "Pilih paket", "Tentukan paket yang paling sesuai dengan kebutuhan dan anggaranmu."],
            ["02", "Ceritakan idemu", "Isi data diri dan tulis gambaran website yang ingin kamu buat."],
            ["03", "Kami kerjakan", "Lanjut konsultasi di WhatsApp, lalu kami mulai wujudkan idemu."],
          ].map(([number, title, text], index) => (
            <article className="relative border-l-2 border-[var(--line-strong)] px-7 py-5 last:border-r-2 lg:px-10" key={number}>
              <span className="font-display text-5xl font-extrabold text-[var(--accent-soft-strong)]">{number}</span>
              <h3 className="mt-8 font-display text-xl font-bold">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{text}</p>
              {index < 2 && <span className="absolute right-7 top-8 hidden text-[var(--accent)] lg:block"><Icon name="arrow" /></span>}
            </article>
          ))}
        </div>
      </section>

      <section className="border-y-2 border-[var(--line-strong)] bg-[var(--surface)] py-24" id="packages">
        <div className="page">
          <SectionHeading centered eyebrow="Paket website" title="Mulai kecil, tumbuh lebih besar." text="Pilih paket terbaik untuk kebutuhanmu. Semua paket dibuat dengan perhatian yang sama." />
          <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
            {packages.map((item) => (
              <article className={`package-card relative flex flex-col border-2 p-6 sm:p-9 ${item.popular ? "border-[var(--line-strong)] bg-[var(--accent-soft)]" : "border-[var(--line-strong)] bg-[var(--bg)]"}`} key={item.name}>
                {item.popular && <span className="absolute right-5 top-0 -translate-y-1/2 rotate-2 border-2 border-[var(--line-strong)] bg-[var(--accent)] px-3 py-1.5 text-xs font-extrabold uppercase text-slate-950">Paling diminati</span>}
                <p className="text-sm font-bold uppercase tracking-[.16em] text-[var(--accent)]">{item.name}</p>
                <h3 className="mt-5 font-display text-4xl font-extrabold tracking-tight">{item.price}</h3>
                <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                <div className="my-7 h-px bg-[var(--line)]" />
                <ul className="flex-1 space-y-4">
                  {item.features.map((feature) => (
                    <li className="flex items-center gap-3 text-sm" key={feature}>
                      <span className="text-[var(--accent)]"><Icon name="check" size={18} /></span>{feature}
                    </li>
                  ))}
                </ul>
                <button className={item.popular ? "button-primary mt-9 w-full" : "button-secondary mt-9 w-full"} onClick={() => choosePackage(item.name)} type="button">
                  Pilih {item.name} <Icon name="arrow" size={18} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page py-24" id="order">
        <div className="grid overflow-hidden border-2 border-[var(--line-strong)] lg:grid-cols-[.75fr_1.25fr]">
          <div className="bg-[var(--accent)] p-8 text-slate-950 sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.18em]">Mulai proyekmu</p>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight">Siap mewujudkan idemu?</h2>
            <p className="mt-5 leading-7 text-slate-800">Isi detail singkat di samping. Pesanan disimpan di server setelah kamu mengirim formulir.</p>
            <div className="mt-12 border-t border-slate-800/25 pt-7">
              <p className="text-xs font-bold uppercase tracking-wider">Paket dipilih</p>
              <p className="mt-2 font-display text-2xl font-extrabold">{selectedPackage}</p>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm font-semibold">
              <Icon name="phone" /> Dilanjutkan melalui WhatsApp
            </div>
          </div>

          <form className="bg-[var(--surface)] p-8 sm:p-12" onSubmit={handleOrder}>
            <input
              aria-hidden="true"
              autoComplete="off"
              className="absolute -left-[10000px] h-px w-px opacity-0"
              name="website"
              tabIndex={-1}
              type="text"
              value=""
              readOnly
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nama lengkap">
                <input autoComplete="name" onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Nama kamu" required value={contact.name} />
              </Field>
              <Field label="No. HP / WhatsApp">
                <input autoComplete="tel" onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="08xxxxxxxxxx" required type="tel" value={contact.phone} />
              </Field>
              <Field label="Email">
                <input autoComplete="email" onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="nama@email.com" required type="email" value={contact.email} />
              </Field>
              <Field label="Paket website">
                <select onChange={(e) => setSelectedPackage(e.target.value)} value={selectedPackage}>
                  {packages.map((item) => <option key={item.name}>{item.name}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Catatan untuk developer">
                  <textarea onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: Buatkan landing page untuk kedai kopi dengan nuansa hangat..." required rows={4} value={notes} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-3 text-sm font-semibold">Metode pembayaran</p>
                <div className="grid grid-cols-3 gap-2">
                  {["QRIS", "DANA", "Transfer Bank"].map((method) => (
                    <label className={`cursor-pointer border px-3 py-3 text-center text-sm font-semibold transition-colors ${payment === method ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)]"}`} key={method}>
                      <input className="sr-only" name="payment" onChange={() => setPayment(method)} type="radio" value={method} />
                      {method}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button className="button-primary mt-8 w-full sm:w-auto" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Menyimpan pesanan..." : "Order via WhatsApp"} <Icon name="send" size={18} />
            </button>
            {orderError && <p className="mt-4 text-sm font-semibold text-red-600" role="alert">{orderError}</p>}
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Pesanan akan disimpan di server terlebih dahulu, lalu WhatsApp terbuka untuk melanjutkan konsultasi dengan Admin ATLAS.</p>
          </form>
        </div>
      </section>

      <footer className="border-t-2 border-[var(--line-strong)] py-9">
        <div className="page flex flex-col items-center justify-between gap-5 sm:flex-row">
          <a className="font-display text-xl font-extrabold" href="#top">ATLAS<span className="text-[var(--accent)]">.</span></a>
          <p className="text-sm text-[var(--muted)]">Your Ideas. Our Code.</p>
          <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} ATLAS Studio</p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, text, centered = false }: { eyebrow: string; title: string; text: string; centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-bold uppercase tracking-[.18em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 leading-7 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
