let pendingSignup = false;
let pendingSignupTarget = "";

const USERS = {
  "student@gmail.com": {
    password: "123456",
    dashboard: "student-dashboard.html"
  },
  "admin@gmail.com": {
    password: "123456",
    dashboard: "admin-dashboard.html"
  },
  "faculty@gmail.com": {
    password: "123456",
    dashboard: "faculty-dashboard.html"
  },
  "librarian@gmail.com": {
    password: "123456",
    dashboard: "librarian-dashboard.html"
  }
};

const TAKEN_EMAILS = ["admin@gmail.com", "test@gmail.com"];

function getElement(id) {
  return document.getElementById(id);
}

function showElement(id, message = "") {
  const element = getElement(id);
  if (!element) return;

  if (message) {
    element.textContent = message;
  }

  element.style.display = "block";
}

function hideElement(id) {
  const element = getElement(id);
  if (element) {
    element.style.display = "none";
  }
}

function clearErrors() {
  hideElement("emailError");
  hideElement("passwordError");
  hideElement("loginError");
}

function resetPendingSignup() {
  pendingSignup = false;
  pendingSignupTarget = "";
}

function goToPage(url) {
  window.location.href = url;
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const target = getElement(id);
  if (target) {
    target.classList.add("active");
  }

  clearErrors();
}

function openModal(id) {
  const modal = getElement(id);
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(id) {
  const modal = getElement(id);
  if (modal) {
    modal.style.display = "none";
  }

  resetPendingSignup();
}

function getDashboardByUserType(userType) {
  const dashboardMap = {
    student: "student-dashboard.html",
    admin: "admin-dashboard.html",
    faculty: "faculty-dashboard.html",
    librarian: "librarian-dashboard.html"
  };

  return dashboardMap[userType] || "student-dashboard.html";
}

function checkSignup(event) {
  event.preventDefault();
  clearErrors();

  const email = getElement("signupEmail")?.value.trim().toLowerCase() || "";
  const password = getElement("signupPassword")?.value || "";
  const rePassword = getElement("signupRePassword")?.value || "";
  const termsChecked = getElement("termsCheck")?.checked || false;
  const userType = getElement("signupUserType")?.value || "";

  if (TAKEN_EMAILS.includes(email)) {
    showElement("emailError", "Email is already taken.");
    return;
  }

  if (password !== rePassword) {
    showElement("passwordError", "Passwords do not match.");
    return;
  }

  if (!userType) return;

  const targetPage = getDashboardByUserType(userType);

  if (termsChecked) {
    pendingSignup = true;
    pendingSignupTarget = targetPage;
    openModal("termsModal");
    return;
  }

  goToPage(targetPage);
}

function agreeTerms() {
  const modal = getElement("termsModal");
  if (modal) {
    modal.style.display = "none";
  }

  if (pendingSignup) {
    const target = pendingSignupTarget || "student-dashboard.html";
    resetPendingSignup();
    goToPage(target);
  }
}

function checkLogin(event) {
  event.preventDefault();
  clearErrors();

  const email = getElement("loginEmail")?.value.trim().toLowerCase() || "";
  const password = getElement("loginPassword")?.value || "";
  const matchedUser = USERS[email];

  if (matchedUser && matchedUser.password === password) {
    goToPage(matchedUser.dashboard);
    return;
  }

  showElement("loginError", "Invalid email or password.");
}

function logout() {
  goToPage("index.html");
}

document.addEventListener("DOMContentLoaded", () => {
  clearErrors();

  const termsModal = getElement("termsModal");

  if (termsModal) {
    termsModal.addEventListener("click", (event) => {
      if (event.target === termsModal) {
        closeModal("termsModal");
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && termsModal && termsModal.style.display === "flex") {
      closeModal("termsModal");
    }
  });
});