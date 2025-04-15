document.addEventListener("DOMContentLoaded", () => {
  const UNPRODUCTIVE_SITES = ["youtube.com", "facebook.com", "instagram.com", "twitter.com"];
  const productiveTable = document.querySelector("#productive-table tbody");
  const unproductiveTable = document.querySelector("#unproductive-table tbody");
  const totalProductive = document.getElementById("total-productive");
  const totalUnproductive = document.getElementById("total-unproductive");

  // ✅ Fetch from MongoDB backend
  fetch("http://localhost:3000/get-data")
      .then((res) => res.json())
      .then((data) => {
          let productiveTotal = 0;
          let unproductiveTotal = 0;

          for (let site in data) {
              let domain = site.replace("www.", "").split("/")[0];
              let time = Math.round(data[site]);
              let row = `<tr><td>${domain}</td><td>${time}s</td></tr>`;

              if (UNPRODUCTIVE_SITES.includes(domain)) {
                  unproductiveTable.innerHTML += row;
                  unproductiveTotal += time;
              } else {
                  productiveTable.innerHTML += row;
                  productiveTotal += time;
              }
          }

          totalProductive.textContent = `✅ Productive Time: ${productiveTotal}s`;
          totalUnproductive.textContent = `❌ Unproductive Time: ${unproductiveTotal}s`;
      })
      .catch((err) => console.error("Error loading dashboard data:", err));

  document.getElementById("download-report").addEventListener("click", () => {
      fetch("http://localhost:3000/get-data")
          .then((res) => res.json())
          .then((data) => {
              let content = "Productivity Report\n\nWebsite - Time Spent (s)\n\n";
              for (let site in data) {
                  let domain = site.replace("www.", "").split("/")[0];
                  content += `${domain} - ${Math.round(data[site])}s\n`;
              }
              const blob = new Blob([content], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "ProductivityReport.txt";
              a.click();
          })
          .catch((err) => console.error("Error downloading report:", err));
  });

  document.getElementById("darkModeToggle").addEventListener("change", (e) => {
      document.body.classList.toggle("dark", e.target.checked);
  });

  document.getElementById("productive-search").addEventListener("input", (e) => {
      filterTable("productive-table", e.target.value);
  });

  document.getElementById("unproductive-search").addEventListener("input", (e) => {
      filterTable("unproductive-table", e.target.value);
  });

  function filterTable(tableId, keyword) {
      const rows = document.querySelectorAll(`#${tableId} tbody tr`);
      rows.forEach((row) => {
          const site = row.children[0].textContent.toLowerCase();
          row.style.display = site.includes(keyword.toLowerCase()) ? "" : "none";
      });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
});
