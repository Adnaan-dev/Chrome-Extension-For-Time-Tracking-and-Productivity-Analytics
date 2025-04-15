document.addEventListener("DOMContentLoaded", () => {
    const dataBox = document.getElementById("data");

    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        document.body.classList.add("dark");
    }

    document.getElementById("toggle-theme").addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // ✅ Fetch from MongoDB backend
    fetch("http://localhost:3000/get-data")
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            console.log("Fetched Data in Popup:", data);
            let display = "";

            if (Object.keys(data).length === 0) {
                display = "<p>No data available.</p>";
            } else {
                for (let site in data) {
                    const timeSpent = Math.round(data[site]);
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${site}&sz=32`;
                    display += `
                        <div class="site-entry">
                            <img src="${faviconUrl}" alt="favicon"/>
                            <span>${site}: ${timeSpent}s</span>
                        </div>
                    `;
                }
            }

            dataBox.innerHTML = display;
        })
        .catch((err) => {
            console.error("Error fetching data:", err);
            dataBox.innerHTML = `<p>Failed to load data.</p>`;
        });

    document.getElementById("dashboard-btn").addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("../dashboard/dashboard.html") });
    });

    document.getElementById("clear-data-btn").addEventListener("click", () => {
        fetch("http://localhost:3000/clear-data", { method: "DELETE" })
            .then(() => {
                dataBox.innerHTML = "<p>Data cleared!</p>";
            })
            .catch((err) => console.error("Error clearing data:", err));
    });
});
