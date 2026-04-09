document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const materialFilter = document.getElementById("materialFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const bookCards = document.querySelectorAll(".book-card");

  const modalOverlay = document.getElementById("bookModalOverlay");
  const closeModal = document.getElementById("closeBookModal");

  const modalTitle = document.getElementById("modalTitle");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalCategory = document.getElementById("modalCategory");
  const modalMaterial = document.getElementById("modalMaterial");
  const modalDate = document.getElementById("modalDate");
  const modalDescription = document.getElementById("modalDescription");
  const modalStatus = document.getElementById("modalStatus");
  const borrowBtn = document.getElementById("borrowBtn");

  const profileBtn = document.getElementById("profileBtn");
  const profileModalOverlay = document.getElementById("profileModalOverlay");
  const closeProfileModal = document.getElementById("closeProfileModal");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");
  const bellBtn = document.getElementById("bellBtn");
  const notifPopup = document.getElementById("notifPopup");
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const notifItems = document.querySelectorAll(".notif-item");
  const notifCount = document.getElementById("notifCount");

  let selectedBook = null;

  function cleanText(text) {
    return (text || "").toLowerCase().replace(/[^a-z0-9\s]/gi, "");
  }

  function filterBooks() {
    const searchValue = cleanText(searchInput?.value || "");
    const materialValue = materialFilter?.value || "all";
    const categoryValue = categoryFilter?.value || "all";
    const availableOnly = availabilityFilter?.checked || false;

    bookCards.forEach((card) => {
      const title = cleanText(card.dataset.title);
      const author = cleanText(card.dataset.author);
      const material = card.dataset.material || "";
      const category = card.dataset.category || "";
      const status = (card.dataset.status || "").toLowerCase();

      let show = true;

      if (!title.includes(searchValue) && !author.includes(searchValue)) {
        show = false;
      }

      if (materialValue !== "all" && material !== materialValue) {
        show = false;
      }

      if (categoryValue !== "all" && category !== categoryValue) {
        show = false;
      }

      if (availableOnly && status !== "available") {
        show = false;
      }

      card.style.display = show ? "flex" : "none";
    });
  }

  function openBookModal(card) {
    selectedBook = {
      title: card.dataset.title || "",
      author: card.dataset.author || "",
      category: card.dataset.category || "",
      material: card.dataset.material || "",
      date: card.dataset.date || "",
      description: card.dataset.description || "",
      status: (card.dataset.status || "").toLowerCase()
    };

    modalTitle.textContent = selectedBook.title;
    modalAuthor.textContent = selectedBook.author;
    modalCategory.textContent = selectedBook.category;
    modalMaterial.textContent = selectedBook.material;
    modalDate.textContent = selectedBook.date;
    modalDescription.textContent = selectedBook.description;

    if (selectedBook.status === "available") {
      modalStatus.textContent = "AVAILABLE";
      modalStatus.className = "book-modal-status";
      borrowBtn.disabled = false;
    } else {
      modalStatus.textContent = "CHECKED OUT";
      modalStatus.className = "book-modal-status checkedout";
      borrowBtn.disabled = true;
    }

    modalOverlay.classList.remove("hidden");
  }

  function closeBookModal() {
    modalOverlay.classList.add("hidden");
  }

  function saveBorrowedFromCatalog(book) {
    if (!book) return;

    const existing = JSON.parse(localStorage.getItem("catalogBorrowQueue")) || [];

    const alreadyExists = existing.some(
      (item) =>
        item.title === book.title &&
        item.author === book.author &&
        item.material === book.material
    );

    if (!alreadyExists) {
      existing.push({
        title: book.title,
        author: book.author,
        category: book.category,
        genre: book.material,
        status: "available",
        due: "April 6, 2026"
      });
      localStorage.setItem("catalogBorrowQueue", JSON.stringify(existing));
    }
  }

  if (searchInput) searchInput.addEventListener("input", filterBooks);
  if (materialFilter) materialFilter.addEventListener("change", filterBooks);
  if (categoryFilter) categoryFilter.addEventListener("change", filterBooks);
  if (availabilityFilter) availabilityFilter.addEventListener("change", filterBooks);

  bookCards.forEach((card) => {
    const btn = card.querySelector(".details-btn");
    if (btn) {
      btn.addEventListener("click", () => openBookModal(card));
    }
  });

  if (closeModal) {
    closeModal.addEventListener("click", closeBookModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeBookModal();
      }
    });
  }

  if (borrowBtn) {
    borrowBtn.addEventListener("click", () => {
      if (!selectedBook || selectedBook.status !== "available") return;

      saveBorrowedFromCatalog(selectedBook);

      // gamitin mo ito dahil ito ang actual file na inupload mo
      window.location.href = "student-borrow-materials.html";

      // kung ang tunay mong filename ay student-borrowed-materials.html,
      // ito ang ipalit:
      // window.location.href = "student-borrowed-materials.html";
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

  filterBooks();
});