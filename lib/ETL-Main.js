const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { parse, format, addDays } = require('date-fns');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function processExcel(inputFile, outputFile, invoiceDateStr) {
    let invoiceDate;
    try {
        invoiceDate = parse(invoiceDateStr, 'yyyy-MM-dd', new Date());
    } catch {
        try {
            invoiceDate = parse(invoiceDateStr, 'd M yyyy', new Date());
        } catch {
            console.error("Error: Invoice date must be in either yyyy-MM-dd or d M yyyy format.");
            return;
        }
    }

    const dueDate = addDays(invoiceDate, 30);
    const invoiceDateFormatted = format(invoiceDate, 'M/d/yyyy');
    const dueDateFormatted = format(dueDate, 'M/d/yyyy');

    if (!inputFile.endsWith('.xlsx')) {
        console.error("Error: Input file must be Excel (.xlsx).");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFile);
    const sheet = workbook.worksheets[0];
    const data = [];

    const headerRow = sheet.getRow(1).values.slice(1);
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const values = row.values.slice(1);
        const rowObj = {};
        headerRow.forEach((header, i) => {
            rowObj[header] = values[i] ?? "";
        });
        data.push(rowObj);
    });

    const hasDepartment = headerRow.includes("Department");

    const separateIndex = data.findIndex(row =>
        Object.values(row).some(val =>
            typeof val === 'string' && val.toLowerCase().includes("separate invoice")
        )
    );

    const dfBefore = separateIndex !== -1 ? data.slice(0, separateIndex) : data;
    const dfAfter = separateIndex !== -1 ? data.slice(separateIndex).filter(row => !row.Customer.includes("Separate Invoice")) : [];

    const validInvoiceNums = data
        .map(row => parseInt(row["Inv Num"]))
        .filter(num => !isNaN(num));
    let invoiceNo = validInvoiceNums.length ? Math.min(...validInvoiceNums) - 2 : 115;

    const secondOutputFile = path.join(path.dirname(outputFile), "2" + path.basename(outputFile));
    const invoicePairs = [[dfBefore, outputFile], [dfAfter, secondOutputFile]];

    for (const [i, [dataset, outFile]] of invoicePairs.entries()) {
        const isSecond = i === 1;
        const requiredCols = ["Customer", "Employee", "REG HRS", "B/R", "OT HRS", "OT B/R", "Inv Num"];
        if (hasDepartment) requiredCols.push("Department");

        let currentCustomer = "";
        const resultRows = [];

        dataset.forEach(row => {
            if (!row["Customer"] || row["Customer"].includes("Separate Invoice")) return;

            if (row["Customer"] !== currentCustomer) {
                currentCustomer = row["Customer"];
                invoiceNo += 1;
            }

            const invNum = parseInt(row["Inv Num"]);
            if (!isNaN(invNum)) invoiceNo = invNum;

            const regHours = parseFloat(row["REG HRS"]);
            const rate = parseFloat(row["B/R"]);
            const otHours = parseFloat(row["OT HRS"] || 0);
            const otRate = parseFloat(row["OT B/R"] || 0);

            if (isNaN(regHours) || isNaN(rate)) return;

            const baseRow = {
                "*InvoiceNo": invoiceNo,
                "*Customer": row["Customer"],
                "*InvoiceDate": invoiceDateFormatted,
                "*DueDate": dueDateFormatted,
                "Terms": "Net 30",
                "Employee": row["Employee"],
                "Hours": regHours,
                "Rate": rate,
                "*ItemTaxCode": " ",
                "Amount": +(regHours * rate).toFixed(2),
            };

            if (isSecond && hasDepartment) baseRow["Department"] = row["Department"];

            resultRows.push(baseRow);

            if (otHours > 0 && otRate) {
                resultRows.push({
                    ...baseRow,
                    Employee: "Overtime",
                    Hours: otHours,
                    Rate: otRate,
                    Amount: +(otHours * otRate).toFixed(2)
                });
            }
        });

        if (resultRows.length === 0) {
            console.log(`No records found for ${isSecond ? "second" : "first"} invoice.`);
            if (!fs.existsSync(outputFile)) {
                fs.writeFileSync(outputFile, "No valid records found.");
            }
            continue;
        }

        const csvWriter = createCsvWriter({
            path: outFile,
            header: Object.keys(resultRows[0]).map(col => ({ id: col, title: col }))
        });

        await csvWriter.writeRecords(resultRows);
        console.log(`Output saved to ${outFile}`);
    }
}

async function processEpic(inputFile, coCodeOutput) {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(inputFile);
        const sheet = workbook.worksheets[0];
        const data = [];

        const headerRow = sheet.getRow(1).values.slice(1);
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const values = row.values.slice(1);
            const rowObj = {};
            headerRow.forEach((header, i) => {
                rowObj[header.trim().toUpperCase()] = values[i] ?? "";
            });
            data.push(rowObj);
        });

        const requiredCols = ["CO CODE", "EE ID", "REG HRS", "OT HRS"];
        const missingCols = requiredCols.filter(col => !(col in data[0]));
        if (missingCols.length) throw new Error(`Missing columns: ${missingCols.join(", ")}`);

        let cleaned = data.filter(row => {
            const reg = parseFloat(row["REG HRS"]);
            const ot = parseFloat(row["OT HRS"]);
            return !(isNaN(reg) && isNaN(ot)) && (reg !== 0 || ot !== 0);
        });

        cleaned = cleaned.map(row => ({
            "CO CODE": row["CO CODE"] || "",
            "EE ID": parseInt(row["EE ID"]),
            "REG HRS": parseFloat(row["REG HRS"]) || 0,
            "OT HRS": parseFloat(row["OT HRS"]) || 0
        })).filter(row => !isNaN(row["EE ID"]));

        const csvWriter = createCsvWriter({
            path: coCodeOutput,
            append: true,
            header: [
                { id: "CO CODE", title: "CO CODE" },
                { id: "EE ID", title: "EE ID" },
                { id: "REG HRS", title: "REG HRS" },
                { id: "OT HRS", title: "OT HRS" },
            ],
        });

        await csvWriter.writeRecords(cleaned);
        console.log(`Data saved to ${coCodeOutput}`);
    } catch (err) {
        console.error("An error occurred in process_epic:", err.message);
    }
}

module.exports = { processExcel, processEpic };
