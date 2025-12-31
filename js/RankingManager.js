class RankingManager {
    constructor() {
        // [USER ACTION REQUIRED] Paste your Web App URL here!
        // ★★★ここにあなたのGASデプロイURLを貼り付けてください！★★★
        // 例: https://script.google.com/macros/s/xxxxxxxxxxxxxxxxx/exec
        this.gasUrl = "https://script.google.com/macros/s/AKfycbweyZjVa6WcnXEdwbyb6u_WrnX8cvgCmSCYxSEcMh0JITb3grp5FSiJFRi8ap9411N1cA/exec";
        this.playerName = this.generateRandomName();

        // Check if URL is still the placeholder
        if (this.gasUrl.includes("AKfycbymt9oI-uV9vJ6uWb0CQAMNl5LHZghzanpDFaZTdZfF4UejgPXm8GDCL798lFfuPRz-Xg")) {
            console.error("RankingManager: GAS URL is still the placeholder!");
        }
    }

    generateRandomName() {
        // 8-digit random hex
        return "Player" + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase();
    }

    async fetchRanking() {
        try {
            console.log("Fetching ranking...");
            // mode=no-cors is not suitable for GET if we want response
            // GAS usually requires redirect handling or simple fetch.

            // GAS usually requires redirect handling or simple fetch.
            // Our GAS code will return JSONP or JSON with CORS headers.

            const response = await fetch(this.gasUrl + "?action=get");

            // Check content type just in case
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") === -1) {
                const text = await response.text();
                console.error("GAS returned non-JSON:", text);
                throw new Error("Invalid Response from GAS");
            }

            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            return data;
            return data;
        } catch (e) {
            console.warn("Fetch failed (expected if local file):", e);

            // If we are on a local file, show Mock Data instead of scary errors
            if (window.location.protocol === 'file:' || window.location.origin === "null") {
                return [
                    { name: "LOCAL_MODE", time: "00:00", lives: "INF" },
                    { name: "You are", time: "running", lives: "local" },
                    { name: "Data saves", time: "online", lives: "only" }
                ];
            }

            // Real online error
            if (this.gasUrl.includes("AKfycbymt9oI")) {
                return [
                    { name: "SETUP", time: "NEEDED", lives: "" },
                    { name: "Update", time: "GAS_URL", lives: "!!" },
                    { name: "in", time: "JS File", lives: "!!" }
                ];
            }

            let msg = e.toString();
            if (msg.includes("Failed to fetch")) msg = "Network/CORS Error";

            return [
                { name: "SYSTEM", time: "⚠️", lives: "" },
                { name: "Error:", time: "Check", lives: "Logs" },
                { name: "See Console", time: "for", lives: "Info" }
            ];
        }
    }
    async submitScore(timeStr, lives) {
        try {
            console.log("Submitting score...", this.playerName, timeStr, lives);
            const url = `${this.gasUrl}?action=post&name=${encodeURIComponent(this.playerName)}&time=${encodeURIComponent(timeStr)}&lives=${lives}`;
            await fetch(url, {
                method: 'GET',
                mode: 'no-cors'
            });
        } catch (e) {
            console.error("Submit Score Error:", e);
        }
    }
}
