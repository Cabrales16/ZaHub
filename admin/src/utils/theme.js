export function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function getStoredTheme() {
  return localStorage.getItem("theme") || "light";
}

export function toggleTheme() {
  const current = getStoredTheme();
  const next = current === "light" ? "dark" : "light";

  localStorage.setItem("theme", next);
  applyTheme(next);

  return next;
}
