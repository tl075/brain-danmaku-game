// このコードを Google Apps Script (GAS) に貼り付けてください

function doGet(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const params = e.parameter;
    const action = params.action;

    // 1. スコア送信 (action=post)
    if (action === 'post') {
        const name = params.name || "Unknown";
        const time = params.time || "99:99";
        const lives = params.lives || "0";
        const date = new Date().toISOString();

        // 文字列として保存 (シングルクォートを先頭につけることでExcel/Sheetの自動変換を防ぐ)
        const safeTime = "'" + time;
        sheet.appendRow([date, name, safeTime, lives]);

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
        rows.sort((a, b) => {
            let timeA = String(a[2]).replace(/^'/, ''); // 先頭の'を除去
            let timeB = String(b[2]).replace(/^'/, '');

            // 時間の比較 (文字列辞書順でOK: "01:00" < "02:00")
            // 空白データが末尾に来るように
            if (!timeA) return 1;
            if (!timeB) return -1;

            return timeA.localeCompare(timeB);
        });

        // 上位10件を取得
        const top10 = rows.slice(0, 10).map(row => {
            return {
                name: String(row[1]),
                time: String(row[2]).replace(/^'/, ''),
                lives: String(row[3])
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
