document.addEventListener("DOMContentLoaded", () => {
  const projectButtons = document.querySelectorAll(".button");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  projectButtons.forEach((button) => {
    button.style.opacity = "0";
    button.style.transform = "translateY(20px)";
    button.style.transition = "all 0.6s ease-out";
    observer.observe(button);
  });

  const skillElements = document.querySelectorAll(".skill");

  skillElements.forEach((skill) => {
    observer.observe(skill);
  });

  // Theme switching functionality
  const themeToggle = document.getElementById("themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const updateThemeColor = (theme) => {
    const themeColorMetaTag = document.querySelector(
      'meta[name="theme-color"]'
    );
    themeColorMetaTag.setAttribute(
      "content",
      theme === "dark" ? "#1a1a1a" : "#f44336"
    );
  };

  // Load saved theme or use system preference
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  updateThemeColor(currentTheme);

  themeToggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
    updateThemeColor(newTheme);
  });

  // List of specific repositories to display
  const selectedRepos = [
    "pomodoro_webpage",
    "Arduino-DCF77",
    "Personal_webpage",
    // "Apollo-Blue",
    // "My-Event-Website",
    // "ModerneML_repo",
  ];

  // Add this language color mapping at the top with other constants
  const languageColors = {
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    HTML: "#e34c26",
    CSS: "#563d7c",
    C: "#555555",
    "C++": "#f34b7d",
    Go: "#00ADD8",
  };

  // Fetch GitHub repositories and display selected ones
  fetch("https://api.github.com/users/Jonas0300/repos")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((repos) => {
      const repoContainer = document.getElementById("github-repos");
      if (!repoContainer) {
        console.error("Repo container element not found");
        return;
      }

      const repoPromises = repos
        .filter((repo) => selectedRepos.includes(repo.name))
        .map((repo) =>
          fetch(repo.languages_url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((languages) => ({ ...repo, languages }))
            .catch(() => ({ ...repo, languages: {} })) // Fallback if languages fetch fails
        );

      Promise.all(repoPromises).then((reposWithLanguages) => {
        reposWithLanguages.forEach((repo) => {
          const totalBytes = Object.values(repo.languages).reduce(
            (acc, curr) => acc + curr,
            0
          );

          const languageBars = Object.entries(repo.languages)
            .map(([lang, bytes]) => {
              const percentage = ((bytes / totalBytes) * 100).toFixed(1);
              return {
                language: lang,
                percentage,
                color: languageColors[lang] || "#959da5",
              };
            })
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

          const repoCard = document.createElement("a");
          repoCard.classList.add("repo-card");
          repoCard.href = repo.html_url;
          repoCard.target = "_blank";

          repoCard.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description available."}</p>
            <div class="language-stats">
              ${languageBars
                .map(
                  (bar) =>
                    `<div class="language-bar" style="background-color: ${bar.color}; width: ${bar.percentage}%"></div>`
                )
                .join("")}
            </div>
            <div class="language-legend">
              ${languageBars
                .map(
                  (bar) => `
                <span class="language-item">
                  <span class="language-color" style="background-color: ${bar.color}"></span>
                  ${bar.language} ${bar.percentage}%
                </span>`
                )
                .join("")}
            </div>
          `;

          repoContainer.appendChild(repoCard);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error);
      // Add fallback UI for when API fails
      const repoContainer = document.getElementById("github-repos");
      if (repoContainer) {
        repoContainer.innerHTML = `
          <p style="text-align: center; color: var(--secondary-text);">
            Unable to load repositories. Please check my 
            <a href="https://github.com/Jonas0300" target="_blank" style="color: var(--text-color);">
              GitHub profile
            </a>
            directly.
          </p>
        `;
      }
    });
});
