const bellBtn = document.getElementById("bellBtn");
const notifPopup = document.getElementById("notifPopup");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const notifItems = document.querySelectorAll(".notif-item");
const notifCount = document.getElementById("notifCount");
const searchInput = document.getElementById("searchInput");
const bookCards = document.querySelectorAll(".book-card");

const bookModalOverlay = document.getElementById("bookModalOverlay");
const closeBookModal = document.getElementById("closeBookModal");
const modalCover = document.getElementById("modalCover");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalGenre = document.getElementById("modalGenre");
const modalDate = document.getElementById("modalDate");
const modalStatus = document.getElementById("modalStatus");
const modalSynopsis = document.getElementById("modalSynopsis");

const analyticsSection = document.getElementById("analyticsSection");
const analyticsTrigger = document.getElementById("analyticsTrigger");
const contentArea = document.querySelector(".content-area");

const profileBtn = document.getElementById("profileBtn");
const profileModalOverlay = document.getElementById("profileModalOverlay");
const closeProfileModal = document.getElementById("closeProfileModal");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");

const tabButtons = document.querySelectorAll(".tab-btn");
const personalTab = document.getElementById("personalTab");
const accountTab = document.getElementById("accountTab");

/* NOTIFICATIONS */
if (bellBtn && notifPopup) {
  bellBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    notifPopup.classList.toggle("hidden");

    if (profileModalOverlay && !profileModalOverlay.classList.contains("hidden")) {
      profileModalOverlay.classList.add("hidden");
    }
  });

  document.addEventListener("click", function (e) {
    if (!notifPopup.contains(e.target) && !bellBtn.contains(e.target)) {
      notifPopup.classList.add("hidden");
    }
  });
}

if (markAllReadBtn && notifCount) {
  markAllReadBtn.addEventListener("click", function () {
    notifItems.forEach((item) => item.classList.remove("unread"));
    notifCount.textContent = "0";
    notifCount.style.display = "none";
  });
}

/* SEARCH */
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = searchInput.value.toLowerCase().trim();

    bookCards.forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const author = (card.dataset.author || "").toLowerCase();
      const genre = (card.dataset.genre || "").toLowerCase();

      if (
        value === "" ||
        title.includes(value) ||
        author.includes(value) ||
        genre.includes(value)
      ) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
}

/* BOOK MODAL */
bookCards.forEach((card) => {
  card.addEventListener("click", function () {
    const title = card.dataset.title || "No Title";
    const author = card.dataset.author || "Unknown Author";
    const genre = card.dataset.genre || "Unknown Genre";
    const date = card.dataset.date || "Unknown Date";
    const status = card.dataset.status || "Available";
    const synopsis = card.dataset.synopsis || "No synopsis available.";

    modalTitle.textContent = title;
    modalAuthor.textContent = author;
    modalGenre.textContent = genre;
    modalDate.textContent = date;
    modalStatus.textContent = status;
    modalSynopsis.textContent = synopsis;

    modalStatus.classList.remove("checkedout");
    if (status.toLowerCase().includes("checked")) {
      modalStatus.classList.add("checkedout");
    }

    if (modalCover) {
      modalCover.style.background = window.getComputedStyle(
        card.querySelector(".book-cover")
      ).background;
    }

    if (notifPopup) notifPopup.classList.add("hidden");
    if (profileModalOverlay) profileModalOverlay.classList.add("hidden");

    bookModalOverlay.classList.remove("hidden");
  });
});

if (closeBookModal && bookModalOverlay) {
  closeBookModal.addEventListener("click", function () {
    bookModalOverlay.classList.add("hidden");
  });

  bookModalOverlay.addEventListener("click", function (e) {
    if (e.target === bookModalOverlay) {
      bookModalOverlay.classList.remove("hidden");
      requestAnimationFrame(() => {
      bookModalOverlay.classList.add("show");
});
    }
  });
}

function closeBookModalFn() {
  bookModalOverlay.classList.remove("show");

  setTimeout(() => {
    bookModalOverlay.classList.add("hidden");
  }, 200);
}

//* PROFILE MODAL */
function openProfileModal() {
  if (!profileModalOverlay) return;

  if (notifPopup) notifPopup.classList.add("hidden");
  if (bookModalOverlay) bookModalOverlay.classList.add("hidden");

  profileModalOverlay.classList.remove("hidden");

  requestAnimationFrame(() => {
    profileModalOverlay.classList.add("show");
  });
}

function closeProfileModalFn() {
  if (!profileModalOverlay) return;

  profileModalOverlay.classList.remove("show");

  setTimeout(() => {
    profileModalOverlay.classList.add("hidden");
  }, 240);
}

if (profileBtn && profileModalOverlay) {
  profileBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    openProfileModal();
  });
}

if (closeProfileModal && profileModalOverlay) {
  closeProfileModal.addEventListener("click", function () {
    closeProfileModalFn();
  });

  profileModalOverlay.addEventListener("click", function (e) {
    if (e.target === profileModalOverlay) {
      closeProfileModalFn();
    }
  });
}

if (cancelProfileBtn && profileModalOverlay) {
  cancelProfileBtn.addEventListener("click", function () {
    closeProfileModalFn();
  });
}
/* PROFILE TABS */
if (tabButtons.length && personalTab && accountTab) {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const selectedTab = button.dataset.tab;

      if (selectedTab === "personal") {
        personalTab.classList.add("active");
        accountTab.classList.remove("active");
      } else {
        accountTab.classList.add("active");
        personalTab.classList.remove("active");
      }
    });
  });
}

/* ESC KEY CLOSE */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (bookModalOverlay) bookModalOverlay.classList.add("hidden");
    if (profileModalOverlay) profileModalOverlay.classList.add("hidden");
    if (notifPopup) notifPopup.classList.add("hidden");
  }
});

/* ANALYTICS REVEAL */
if (analyticsSection && analyticsTrigger && contentArea) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          analyticsSection.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: contentArea,
      threshold: 0.2
    }
  );

  observer.observe(analyticsTrigger);
}

const visible = [...bookCards].some(card => card.style.display !== "none");

if (!visible) {
  // you can show empty state
  console.log("No results found");
}