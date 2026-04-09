document.addEventListener("DOMContentLoaded", () => {
  const bellBtn = document.getElementById("bellBtn");
  const notifPopup = document.getElementById("notifPopup");
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const notifItems = document.querySelectorAll(".notif-item");
  const notifCount = document.getElementById("notifCount");

  const tabButtons = document.querySelectorAll(".tab-btn");
  const personalTab = document.getElementById("personalTab");
  const accountTab = document.getElementById("accountTab");

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

  if (markAllReadBtn && notifCount) {
    markAllReadBtn.addEventListener("click", () => {
      notifItems.forEach((item) => item.classList.remove("unread"));
      notifCount.textContent = "0";
      notifCount.style.display = "none";
    });
  }

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
});

