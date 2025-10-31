// === SCRIPT.JS ===
// Fungsi utama untuk mengatur navigasi dinamis sidebar (SPA Style)
// dan memuat halaman seperti daftar-aktivitas & lihat-insight tanpa reload.

document.addEventListener("DOMContentLoaded", () => {
  const sidebarItems = document.querySelectorAll(".sidebar ul li");
  const pageContent = document.querySelector("#page-content"); // area dinamis di dashboard.html

  // 🧩 Validasi area konten
  if (!pageContent) {
    console.error("❌ Tidak menemukan elemen #page-content — pastikan ada di dashboard.html!");
    return;
  }

  // 🔹 Helper: ambil <section> utama dari file HTML target
  async function fetchSectionFrom(page) {
    const resp = await fetch(`./${page}.html`);
    if (!resp.ok) throw new Error("Halaman tidak ditemukan: " + page);
    const text = await resp.text();

    const tmp = document.createElement("div");
    tmp.innerHTML = text.trim();

    // Ambil elemen <section> pertama, misalnya .daftar-aktivitas atau .insight-section
    const sec = tmp.querySelector("section");
    return sec ? sec : tmp;
  }

  // 🔹 Load halaman penuh (ganti seluruh konten di #page-content)
  async function loadFull(page) {
    try {
      const sec = await fetchSectionFrom(page);

      // Kosongkan isi lama
      pageContent.innerHTML = "";

      // Masukkan konten baru
      pageContent.appendChild(sec.cloneNode(true));

      // Render ulang Ionicons
      reloadIonicons();
    } catch (err) {
      console.error(err);
      pageContent.innerHTML = `<p style="color:red;text-align:center;margin-top:2rem;">${err.message}</p>`;
    }
  }

  // 🔹 Load partial khusus (misalnya untuk lihat-insight)
  async function loadPartial(page) {
    try {
      const sec = await fetchSectionFrom(page);

      // Kosongkan area konten lama dulu
      pageContent.innerHTML = "";
      pageContent.appendChild(sec.cloneNode(true));

      reloadIonicons();
      console.log("✅ Partial page dimuat:", page);
    } catch (err) {
      console.error("Gagal memuat partial:", err);
    }
  }

  // 🔹 Fungsi untuk reload ikon Ionicons jika konten dimuat dinamis
  function reloadIonicons() {
    const moduleScript = document.querySelector(
      'script[type="module"][src*="ionicons"]'
    );
    const nomoduleScript = document.querySelector(
      'script[nomodule][src*="ionicons"]'
    );

    if (moduleScript) {
      const newScript = document.createElement("script");
      newScript.type = "module";
      newScript.src = moduleScript.src;
      document.body.appendChild(newScript);
    }

    if (nomoduleScript) {
      const newScript = document.createElement("script");
      newScript.noModule = true;
      newScript.src = nomoduleScript.src;
      document.body.appendChild(newScript);
    }
  }

  // 🔹 Event handler klik sidebar
  sidebarItems.forEach((li) => {
    li.addEventListener("click", (e) => {
      // Hilangkan aktif dari semua menu, lalu tambahkan ke yang diklik
      sidebarItems.forEach((x) => x.classList.remove("active"));
      li.classList.add("active");

      const page = li.getAttribute("data-page");
      const anchor = li.querySelector("a.no-dynamic");

      // Jika ada <a class="no-dynamic">, biarkan browser melakukan navigasi normal
      if (anchor) return;

      // Jika klik dashboard → reload penuh
      if (!page || page === "dashboard") {
        location.reload();
        return;
      }

      // Jika klik lihat-insight → gunakan partial load (tidak ubah header/sidebar)
      if (page === "lihat-insight") {
        loadPartial("lihat-insight");
      } else {
        // Default: ganti seluruh isi #page-content
        loadFull(page);
      }
    });
  });

  // Optional: load awal default (jika kamu mau langsung tampilkan halaman tertentu)
  // loadFull('daftar-aktivitas');
});
