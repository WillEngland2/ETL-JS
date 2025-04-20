const fs = require('fs');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const _ = require('lodash');

async function parseTimecardPdf(pdfPath, outputExcelPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const allFinalRows = [];

    const pageTexts = text.split('\f'); // crude page split

    for (const pageText of pageTexts) {
        if (!pageText.trim()) continue;

        const nameMatch = pageText.match(/EE:\s+Flex Force\s*,\s*(.*?)\s+Supervisor:/);
        const rawNameLine = nameMatch ? nameMatch[1].trim() : "";
        const words = rawNameLine.split(/\s+/);
        const employeeName = words.slice(0, -5).join(" ");
        const customerName = words.slice(-5).join(" ");

        const dailyMatches = [...pageText.matchAll(
            /(Thursday|Friday|Saturday)\s+(\d{1,2}\/\d{1,2}\/\d{4})(.*?)\n\s*(\d+\.\d+)\s+0\.00\s+(\d+\.\d+)/gs
        )];

        const dailyEntries = [];

        for (const match of dailyMatches) {
            const [, , , block] = match;
            const timeBlockMatches = [...block.matchAll(
                /(\d{2}:\d{2}\s[AP]M|\(\d{2}:\d{2}\s[AP]M\))\s*(\d{2}:\d{2}\s[AP]M|\(\d{2}:\d{2}\s[AP]M\))\s+100\s+(.*?)\s+(\d+\.\d+)\s+(\d+\.\d+)/g
            )];

            for (const [, , , type, hours] of timeBlockMatches) {
                dailyEntries.push({
                    "Earning Type": type.trim(),
                    "Hours": parseFloat(hours)
                });
            }
        }

        const totalHoursMatch = pageText.match(/Total Hours\s+(\d+\.\d+)/);
        if (totalHoursMatch) {
            dailyEntries.push({
                "Earning Type": "Total Hours",
                "Hours": parseFloat(totalHoursMatch[1])
            });
        }

        const totalEntry = dailyEntries.find(e => e["Earning Type"].toLowerCase() === "total hours");

        if (totalEntry) {
            const total = totalEntry.Hours;
            const reg = total > 40 ? 40 : total;
            const ot = total > 40 ? total - 40 : 0;
            allFinalRows.push({
                Customer: customerName,
                Employee: employeeName,
                "REG HRS": reg,
                "OT HRS": ot,
                "TOTAL HRS": reg + ot
            });
        } else {
            for (const entry of dailyEntries) {
                const type = entry["Earning Type"].toLowerCase();
                if (!type.includes("hours")) continue;
                allFinalRows.push({
                    Customer: customerName,
                    Employee: employeeName,
                    "REG HRS": entry.Hours,
                    "OT HRS": 0.0,
                    "TOTAL HRS": entry.Hours
                });
            }
        }
    }

    // Group & sum
    const grouped = _.chain(allFinalRows)
        .groupBy(row => `${row.Customer}||${row.Employee}`)
        .map((rows, key) => {
            const [Customer, Employee] = key.split("||");
            const totals = rows.reduce(
                (acc, row) => {
                    acc["REG HRS"] += row["REG HRS"];
                    acc["OT HRS"] += row["OT HRS"];
                    acc["TOTAL HRS"] += row["TOTAL HRS"];
                    return acc;
                },
                { "REG HRS": 0, "OT HRS": 0, "TOTAL HRS": 0 }
            );
            return { Customer, Employee, ...totals };
        })
        .orderBy("Employee")
        .value();

    const payPeriodTotal = grouped.reduce((sum, r) => sum + r["TOTAL HRS"], 0);

    // ✅ Write to Excel using exceljs
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payroll Ready");

    // Write header
    sheet.columns = [
        { header: "Customer", key: "Customer", width: 30 },
        { header: "Employee", key: "Employee", width: 30 },
        { header: "REG HRS", key: "REG HRS", width: 10 },
        { header: "OT HRS", key: "OT HRS", width: 10 },
        { header: "TOTAL HRS", key: "TOTAL HRS", width: 12 }
    ];

    // Write rows
    grouped.forEach(row => sheet.addRow(row));

    // Add total summary
    sheet.addRow([]);
    sheet.addRow(["TOTAL PAY PERIOD HOURS", payPeriodTotal]);

    await workbook.xlsx.writeFile(outputExcelPath);
    console.log(`Excel file created: ${outputExcelPath}`);
}

module.exports = { parseTimecardPdf };
