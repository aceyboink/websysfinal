document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("historyTableBody");

  function render() {
    const db = getDB();
    container.innerHTML = "";

    db.history.forEach(item => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.borrowedDate}</td>
        <td>${item.returnedDate || "-"}</td>
        <td>${item.status}</td>
      `;

      container.appendChild(row);
    });
  }

  render();
});