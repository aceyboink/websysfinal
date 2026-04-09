document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const selectedList = document.getElementById("selectedList");
  const selectedEmpty = document.getElementById("selectedEmpty");
  const selectedCountBadge = document.getElementById("selectedCountBadge");
  const requestCount = document.getElementById("requestCount");
  const processBtn = document.getElementById("processBtn");
  const requestNote = document.getElementById("requestNote");

  const bellBtn = document.getElementById("bellBtn");
  const notifPopup = document.getElementById("notifPopup");
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const notifItems = document.querySelectorAll(".notif-item");
  const notifCount = document.getElementById("notifCount");

  const profileBtn = document.getElementById("profileBtn");
  const profilePopup = document.getElementById("profilePopup");

  const categoryFilter = document.getElementById("categoryFilter");
  const genreFilter = document.getElementById("genreFilter");
  const availableOnlyToggle = document.getElementById("availableOnlyToggle");

  const detailsOverlay = document.getElementById("detailsOverlay");
  const detailsTitle = document.getElementById("detailsTitle");
  const detailsAuthor = document.getElementById("detailsAuthor");
  const detailsId = document.getElementById("detailsId");
  const detailsStatus = document.getElementById("detailsStatus");
  const detailsCategory = document.getElementById("detailsCategory");
  const detailsGenre = document.getElementById("detailsGenre");
  const detailsAddBtn = document.getElementById("detailsAddBtn");

  const requestSentOverlay = document.getElementById("requestSentOverlay");
  const approvedOverlay = document.getElementById("approvedOverlay");
  const qrOverlay = document.getElementById("qrOverlay");
  const openQrBtn = document.getElementById("openQrBtn");
  const approvalToast = document.getElementById("approvalToast");
  const closeToastBtn = document.getElementById("closeToastBtn");

  let currentDetailsCard = null;
  let selectedMaterials = [];
  let catalogQueue = JSON.parse(localStorage.getItem("catalogBorrowQueue")) || [];

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

  function getBookCards() {
    return document.querySelectorAll(".book-card");
  }

  function normalizeText(value) {
    return (value || "").toLowerCase().trim();
  }

  function toTitleCase(value) {
    return (value || "")
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit"
    });
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function updateSelectedUI() {
    if (selectedCountBadge) {
      selectedCountBadge.textContent = `${selectedMaterials.length} selected`;
    }

    if (requestCount) {
      requestCount.textContent = selectedMaterials.length;
    }

    if (processBtn) {
      processBtn.disabled = selectedMaterials.length === 0;
    }

    if (selectedEmpty) {
      selectedEmpty.style.display = selectedMaterials.length === 0 ? "flex" : "none";
    }
  }

  function renderSelectedList() {
    if (!selectedList) return;

    selectedList.innerHTML = "";

    if (selectedMaterials.length === 0) {
      if (selectedEmpty) {
        selectedList.appendChild(selectedEmpty);
        selectedEmpty.style.display = "flex";
      }
      updateSelectedUI();
      return;
    }

    selectedMaterials.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "selected-item";
      row.innerHTML = `
        <div class="selected-item-copy">
          <h4>${item.title}</h4>
          <p>${item.author}</p>
          <div class="selected-item-meta">
            <span>${item.category}</span>
            <span>${item.genre}</span>
          </div>
        </div>
        <button class="selected-remove-btn" type="button" data-index="${index}">&times;</button>
      `;
      selectedList.appendChild(row);
    });

    selectedList.querySelectorAll(".selected-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        selectedMaterials.splice(index, 1);
        renderSelectedList();
      });
    });

    updateSelectedUI();
  }

  function addToSelected(material) {
    const exists = selectedMaterials.some(
      (item) =>
        item.title === material.title &&
        item.author === material.author &&
        item.category === material.category &&
        item.genre === material.genre
    );

    if (!exists) {
      selectedMaterials.push(material);
      renderSelectedList();
    }
  }

  function transferCatalogQueue() {
    if (!catalogQueue.length) return;

    catalogQueue.forEach((item) => addToSelected(item));
    localStorage.removeItem("catalogBorrowQueue");
    catalogQueue = [];
  }

  function updateEmptyState() {
    const visibleCards = [...getBookCards()].filter(
      (card) => card.style.display !== "none"
    );

    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCards.length !== 0);
      emptyState.style.display = visibleCards.length === 0 ? "flex" : "none";
    }
  }

  function filterCards() {
    const query = normalizeText(searchInput?.value);
    const category = normalizeText(categoryFilter?.value || "all");
    const genre = normalizeText(genreFilter?.value || "all");
    const availableOnly = availableOnlyToggle?.checked || false;

    getBookCards().forEach((card) => {
      const title = normalizeText(card.dataset.title);
      const author = normalizeText(card.dataset.author);
      const itemCategory = normalizeText(card.dataset.category);
      const itemGenre = normalizeText(card.dataset.genre);
      const status = normalizeText(card.dataset.status);

      let visible = true;

      if (query && !`${title} ${author} ${itemCategory} ${itemGenre}`.includes(query)) {
        visible = false;
      }

      if (category !== "all" && itemCategory !== category) {
        visible = false;
      }

      if (genre !== "all" && itemGenre !== genre) {
        visible = false;
      }

      if (availableOnly && status !== "available") {
        visible = false;
      }

      card.style.display = visible ? "flex" : "none";
    });

    updateEmptyState();
  }

  function openDetails(card) {
    currentDetailsCard = card;

    if (detailsTitle) detailsTitle.textContent = card.dataset.title || "Book Title";
    if (detailsAuthor) detailsAuthor.textContent = card.dataset.author || "Author Name";
    if (detailsId) detailsId.textContent = card.dataset.id || "N/A";
    if (detailsStatus) detailsStatus.textContent = toTitleCase(card.dataset.status || "available");
    if (detailsCategory) detailsCategory.textContent = toTitleCase(card.dataset.category || "N/A");
    if (detailsGenre) detailsGenre.textContent = toTitleCase(card.dataset.genre || "N/A");

    const isAvailable = normalizeText(card.dataset.status) === "available";

    if (detailsAddBtn) {
      detailsAddBtn.disabled = !isAvailable;
    }

    if (detailsOverlay) {
      detailsOverlay.classList.remove("hidden");
    }
  }

  function closeOverlay(overlay) {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }

  function saveBorrowRequestToDB() {
    const db = safeGetDB();
    const today = new Date();
    const dueDate = addDays(today, 7);

    selectedMaterials.forEach((item, index) => {
      const alreadyExists = db.borrowed.some(
        (book) =>
          normalizeText(book.title) === normalizeText(item.title) &&
          normalizeText(book.author) === normalizeText(item.author) &&
          ["pending", "borrowed", "approved", "ready for pickup"].includes(
            normalizeText(book.status)
          )
      );

      if (alreadyExists) return;

      db.borrowed.unshift({
        id: `borrow-${Date.now()}-${index}`,
        title: item.title,
        author: item.author,
        category: item.category,
        genre: item.genre,
        status: "pending",
        borrowedDate: formatDate(today),
        dueDate: formatDate(dueDate),
        days: "Pending Approval",
        penalty: "PHP 0.00",
        totalPenalty: "PHP 0.00"
      });
    });

    safeSaveDB(db);
    window.dispatchEvent(new Event("storage"));
  }

  getBookCards().forEach((card) => {
    const viewBtn = card.querySelector(".view-details-btn");
    const addBtn = card.querySelector(".add-borrow-btn");

    if (viewBtn) {
      viewBtn.addEventListener("click", () => openDetails(card));
    }

    if (addBtn && !addBtn.disabled) {
      addBtn.addEventListener("click", () => {
        addToSelected({
          title: card.dataset.title || "",
          author: card.dataset.author || "",
          category: card.dataset.category || "",
          genre: card.dataset.genre || ""
        });
      });
    }
  });

  if (detailsAddBtn) {
    detailsAddBtn.addEventListener("click", () => {
      if (!currentDetailsCard) return;

      addToSelected({
        title: currentDetailsCard.dataset.title || "",
        author: currentDetailsCard.dataset.author || "",
        category: currentDetailsCard.dataset.category || "",
        genre: currentDetailsCard.dataset.genre || ""
      });

      closeOverlay(detailsOverlay);
    });
  }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const overlayId = btn.getAttribute("data-close");
      closeOverlay(document.getElementById(overlayId));
    });
  });

  [detailsOverlay, requestSentOverlay, approvedOverlay, qrOverlay].forEach((overlay) => {
    if (!overlay) return;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeOverlay(overlay);
      }
    });
  });

  if (openQrBtn && qrOverlay) {
    openQrBtn.addEventListener("click", () => {
      qrOverlay.classList.remove("hidden");
    });
  }

  if (processBtn) {
    processBtn.addEventListener("click", () => {
      if (selectedMaterials.length === 0) return;

      saveBorrowRequestToDB();

      if (requestNote) {
        requestNote.classList.remove("hidden");
      }

      if (requestSentOverlay) {
        requestSentOverlay.classList.remove("hidden");
      }

      selectedMaterials = [];
      renderSelectedList();
    });
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

  if (profileBtn && profilePopup) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profilePopup.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!profilePopup.contains(e.target) && !profileBtn.contains(e.target)) {
        profilePopup.classList.add("hidden");
      }
    });
  }

  if (closeToastBtn && approvalToast) {
    closeToastBtn.addEventListener("click", () => {
      approvalToast.classList.add("hidden");
    });
  }

  if (searchInput) searchInput.addEventListener("input", filterCards);
  if (categoryFilter) categoryFilter.addEventListener("change", filterCards);
  if (genreFilter) genreFilter.addEventListener("change", filterCards);
  if (availableOnlyToggle) availableOnlyToggle.addEventListener("change", filterCards);

  transferCatalogQueue();
  renderSelectedList();
  filterCards();
});