# ETL-JS 🧾

**ETL-JS** is a lightweight backend parser built with JavaScript that transforms uploaded Excel files (and optionally PDFs) into structured CSVs for payroll, invoicing, and data analysis workflows.

The core logic is designed to:

- Read spreadsheet data
- Normalize and clean input
- Format structured rows by customer and employee
- Output a downloadable CSV grouped by invoice numbers

---

## 🧠 Purpose

The goal of ETL-JS is to simplify the process of transforming timecard and payroll spreadsheets into clean, standardized formats. This allows teams to quickly process large sets of employee hours or customer data without needing to manually reformat spreadsheets.

---

## 🔍 What It Does

- Parses uploaded Excel files using the [`xlsx`](https://www.npmjs.com/package/xlsx) library
- Extracts regular and overtime hours, employee names, and billing rates
- Dynamically creates invoice rows grouped by customer
- Formats and exports the result as a clean CSV using [`papaparse`](https://www.papaparse.com/)
- Uses [`moment`](https://momentjs.com/) to format invoice and due dates

## 🔄 Output Format (CSV)

Each row in the output CSV contains:

- `*InvoiceNo`: Auto-incremented for each new customer group
- `*Customer`: Customer name
- `*InvoiceDate`: Based on user input
- `*DueDate`: +30 days from invoice date
- `Department` (if present)
- `Employee`
- `Hours`, `Rate`, `Amount`
- `*ItemTaxCode`: Static field (`" "`)

Overtime rows are labeled with `"Employee": "Overtime"`.

---

## ✅ Example Use Case

Upload a timecard spreadsheet like:

| Customer | Employee | REG HRS | OT HRS | B/R | OT B/R |
|----------|----------|---------|--------|-----|--------|
| Acme Co. | Jane Doe | 40      | 5      | 30  | 45     |

The code will output:

| *InvoiceNo | *Customer | Employee | Hours | Rate | Amount |
|------------|------------|----------|--------|------|--------|
| 116        | Acme Co.   | Jane Doe | 40     | $30  | $1200  |
| 116        | Acme Co.   | Overtime | 5      | $45  | $225   |

---

## 📝 Notes

- Code assumes that uploaded Excel files have specific column headers (`Customer`, `Employee`, `REG HRS`, `OT HRS`, `B/R`, `OT B/R`)
- Invoice numbers auto-increment each time a new customer is encountered
- Blank or zero-hour rows are ignored automatically

---

## 📄 License

MIT — built by Will England to streamline data workflows for real-world projects.
