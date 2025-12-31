// このコードを Google Apps Script (GAS) に貼り付けてください

function doGet(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const params = e.parameter;
    const action = params.action;

    // 1. スコア送信 (action=post)
    if (action === 'post') {
        // v1.1 Update: Accept typeCount and score
        const name = params.name || "Unknown";
        const time = params.time || "99:99";
        const lives = params.lives || "0";
        const typeCount = params.typeCount || "0";
        const score = params.score || "9999"; // Calculated Score (Lower is better)
        const date = new Date().toISOString();

        // 文字列として保存 (シングルクォートを先頭につけることでExcel/Sheetの自動変換を防ぐ)
        const safeTime = "'" + time;
        sheet.appendRow([date, name, safeTime, lives, typeCount, score]);

        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    }

    // 2. ランキング取得 (action=get)
    else if (action === 'get') {
        const data = sheet.getDataRange().getValues();
        // ヘッダー(1行目)を除く。データがない場合は空配列
        if (data.length <= 1) {
            return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
        }

        const rows = data.slice(1);

        // ソート処理の修正: Time(列2)が数値やDate型になっている可能性があるため String() で変換してから比較
        // ソート処理の修正 v1.1: Score (列5/index 5) で昇順ソート (低い方が良い)
        // データ構造: [Date, Name, Time, Lives, TypeCount, Score]
        rows.sort((a, b) => {
            const scoreA = parseFloat(a[5]);
            const scoreB = parseFloat(b[5]);

            // 数値でない場合は後ろへ
            if (isNaN(scoreA)) return 1;
            if (isNaN(scoreB)) return -1;

            return scoreA - scoreB; // 昇順 (小さい方が1位)
        });

        // 上位10件を取得
        // 上位10件を取得
        const top10 = rows.slice(0, 10).map(row => {
            return {
                name: String(row[1]),
                time: String(row[2]).replace(/^'/, ''),
                lives: String(row[3]),
                score: String(row[5]) // v1.1: Return score
            };
        });

        const output = JSON.stringify(top10);
        return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Invalid Action").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
    return doGet(e);
}
