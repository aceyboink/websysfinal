document.addEventListener("DOMContentLoaded", () => {
  const returnList = document.getElementById("returnList");
  const returnBtn = document.getElementById("returnSelectedBtn");
  const modal = document.getElementById("successModal");
  const modalMessage = document.getElementById("modalMessage");

  const DB_KEY = "shelfsnapDB";

  function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || { borrowed: [] };
  }

  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function render() {
    const db = getDB();
    returnList.innerHTML = "";

    // ✅ FILTER: ONLY SHOW BORROWED (NOT pending, NOT returned)
    const validBooks = db.borrowed.filter(book => book.status === "borrowed");

    if (validBooks.length === 0) {
      returnList.innerHTML = `<p class="empty-state">No books to return.</p>`;
      return;
    }

    validBooks.forEach(book => {
      const card = document.createElement("div");
      card.className = "book-card";

      card.innerHTML = `
        <label class="select-box">
          <input type="checkbox" class="book-check" data-id="${book.id}" />
          <span></span>
        </label>

        <div class="book-cover"></div>

        <div class="book-info">
          <h3>${book.title}</h3>
          <p>${book.author}</p>
          <div class="book-meta">
            <span class="meta-item">Due Date: ${book.dueDate || "—"}</span>
            <span class="status on-time">Borrowed</span>
          </div>
        </div>
      `;

      returnList.appendChild(card);
    });
  }

  // ✅ RETURN FUNCTION
  returnBtn?.addEventListener("click", () => {
    const checked = document.querySelectorAll(".book-check:checked");
    const db = getDB();

    if (checked.length === 0) return;

    const idsToReturn = Array.from(checked).map(cb => cb.dataset.id);

    // ✅ remove returned items from DB
    db.borrowed = db.borrowed.filter(book => !idsToReturn.includes(String(book.id)));

    saveDB(db);
    render();

    modalMessage.textContent = "Selected materials have been successfully returned.";
    modal.classList.remove("hidden");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 2000);
  });

  render();
});