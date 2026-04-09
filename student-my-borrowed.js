document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("borrowedList");
  const searchInput = document.getElementById("searchInput");
  const totalBorrowedCount = document.getElementById("totalBorrowedCount");
  const overdueCount = document.getElementById("overdueCount");

  const bellBtn = document.getElementById("bellBtn");
  const notifPopup = document.getElementById("notifPopup");
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const notifItems = document.querySelectorAll(".notif-item");
  const notifCount = document.getElementById("notifCount");

  const profileBtn = document.getElementById("profileBtn");
  const profileModalOverlay = document.getElementById("profileModalOverlay");
  const closeProfileModal = document.getElementById("closeProfileModal");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  const DB_KEY = "shelfsnapDB";

  function safeGetDB() {
    try {
      if (typeof getDB === "function") {
        const db = getDB();
        if (db && typeof db === "object") {
          db.borrowed = Array.isArray(db.borrowed) ? db.borrowed : [];
          return db;
        }
      }
    } catch (error) {
      console.warn("getDB() fallback used:", error);
    }

    const fallback = JSON.parse(localStorage.getItem(DB_KEY)) || {};
    fallback.borrowed = Array.isArray(fallback.borrowed) ? fallback.borrowed : [];
    return fallback;
  }

  function safeSaveDB(db) {
    try {
      if (typeof saveDB === "function") {
        saveDB(db);
        return;
      }
    } catch (error) {
      console.warn("saveDB() fallback used:", error);
    }

    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function normalizeText(value) {
    return (value || "").toLowerCase().trim();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function seedInitialRowsIfNeeded() {
    const db = safeGetDB();

    if (db.borrowed.length > 0) return;

    const initialRows = [...document.querySelectorAll(".borrow-row")].map((row, index) => ({
      id: `seed-${index + 1}`,
      title: row.dataset.title || row.querySelector("h3")?.textContent?.trim() || "Untitled",
      author: row.dataset.author || row.querySelector(".author")?.textContent?.trim() || "Unknown Author",
      status: row.dataset.status || "borrowed",
      borrowedDate: row.dataset.dateBorrowed || "",
      dueDate: row.dataset.dueDate || "",
      days: row.dataset.days || ""
    }));

    db.borrowed = initialRows;
    safeSaveDB(db);
  }

  function getStatusMarkup(book) {
    const status = normalizeText(book.status);

    if (status === "overdue") {
      return `
        <span class="status overdue">Overdue</span>
        <small>Penalty: ${escapeHtml(book.penalty || "PHP 10.00")}</small>
        <small>Total: ${escapeHtml(book.totalPenalty || "PHP 10.00")}</small>
      `;
    }

    if (status === "returned") {
      return `
        <span class="status returned">Returned</span>
        <small>Completed return</small>
      `;
    }

    if (status === "pending") {
      return `
        <span class="status pending">Pending Approval</span>
        <small>Waiting for librarian approval</small>
      `;
    }

    if (status === "approved" || status === "ready for pickup") {
      return `
        <span class="status borrowed">Approved</span>
        <small>Ready for pickup</small>
      `;
    }

    return `
      <span class="status borrowed">Borrowed</span>
      <small>Days Remaining: ${escapeHtml(book.days || "—")}</small>
    `;
  }

  function getRowClass(book) {
    return normalizeText(book.status) === "overdue"
      ? "borrow-row overdue-highlight"
      : "borrow-row";
  }

  function render() {
    const db = safeGetDB();
    const query = normalizeText(searchInput?.value);

    const books = db.borrowed.filter((book) => {
      const searchable = [
        book.title,
        book.author,
        book.status,
        book.borrowedDate,
        book.dueDate,
        book.days
      ]
        .join(" ")
        .toLowerCase();

      return !query || searchable.includes(query);
    });

    container.innerHTML = "";

    books.forEach((book) => {
      const row = document.createElement("div");
      row.className = getRowClass(book);

      row.innerHTML = `
        <div class="cover"></div>

        <div class="book-details">
          <h3>${escapeHtml(book.title)}</h3>
          <p class="author">${escapeHtml(book.author)}</p>

          <div class="meta-pills">
            <span>Date Borrowed: ${escapeHtml(book.borrowedDate || "—")}</span>
            <span>Due: ${escapeHtml(book.dueDate || "—")}</span>
          </div>
        </div>

        <div class="status-side">
          ${getStatusMarkup(book)}
        </div>
      `;

      container.appendChild(row);
    });

    if (totalBorrowedCount) {
      totalBorrowedCount.textContent = db.borrowed.filter(
        (book) => normalizeText(book.status) !== "returned"
      ).length;
    }

    if (overdueCount) {
      overdueCount.textContent = db.borrowed.filter(
        (book) => normalizeText(book.status) === "overdue"
      ).length;
    }

    if (books.length === 0) {
      container.innerHTML = `
        <div class="borrow-row">
          <div class="book-details">
            <h3>No borrowed materials found</h3>
            <p>Try another search or submit a new borrow request.</p>
          </div>
        </div>
      `;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  if (bellBtn && notifPopup) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifPopup.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!notifPopup.contains(e.target) && !bellBtn.contains(e.target)) {
        notifPopup.classList.add("hidden");
      }
    });
  }

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", () => {
      notifItems.forEach((item) => item.classList.remove("unread"));
      if (notifCount) {
        notifCount.textContent = "0";
        notifCount.style.display = "none";
      }
    });
  }

  if (profileBtn && profileModalOverlay) {
    profileBtn.addEventListener("click", () => {
      profileModalOverlay.classList.remove("hidden");
    });
  }

  if (closeProfileModal && profileModalOverlay) {
    closeProfileModal.addEventListener("click", () => {
      profileModalOverlay.classList.add("hidden");
    });
  }

  if (cancelProfileBtn && profileModalOverlay) {
    cancelProfileBtn.addEventListener("click", () => {
      profileModalOverlay.classList.add("hidden");
    });
  }

  if (profileModalOverlay) {
    profileModalOverlay.addEventListener("click", (e) => {
      if (e.target === profileModalOverlay) {
        profileModalOverlay.classList.add("hidden");
      }
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      button.classList.add("active");

      if (targetTab === "personal") {
        document.getElementById("personalTab")?.classList.add("active");
      } else if (targetTab === "account") {
        document.getElementById("accountTab")?.classList.add("active");
      }
    });
  });

  window.addEventListener("storage", render);

  seedInitialRowsIfNeeded();
  render();
});