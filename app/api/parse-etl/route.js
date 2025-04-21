import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import * as XLSX from 'xlsx';
import moment from 'moment';
import Papa from 'papaparse';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('etl');
  const invoiceDate = formData.get('invoice_date');
  const outputName = formData.get('output_name') || 'parsed_output;';

  if (!file || typeof file.name !== 'string') {
    return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
  }

  if (!invoiceDate) {
    return NextResponse.json({ error: 'Invoice date is required' }, { status: 400 });
  }

  const invDate = moment(invoiceDate, ['YYYY-MM-DD', 'D M YYYY']);
  if (!invDate.isValid()) {
    return NextResponse.json({ error: 'Invalid invoice date format' }, { status: 400 });
  }

  const invoiceDateFormatted = invDate.format('M/D/YYYY');
  const dueDateFormatted = invDate.clone().add(30, 'days').format('M/D/YYYY');

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = '/tmp/uploads';
    fs.mkdirSync(uploadsDir, { recursive: true });

    const uploadedPath = path.join(uploadsDir, file.name);
    await writeFile(uploadedPath, buffer);

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (err) {
      console.error('Failed to read workbook:', err.message);
      return NextResponse.json({ error: 'Uploaded file is not a valid Excel (.xlsx) file.' }, { status: 400 });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let invoiceNo = 115;
    const invoiceGroups = [];
    let currentGroup = [];

    const hasDepartment = data[0]?.Department !== undefined;

    data.forEach((row) => {
      const isSeparator = Object.values(row).some(
        (val) => typeof val === 'string' && val.trim().toLowerCase() === 'separate invoice'
      );

      if (isSeparator) {
        if (currentGroup.length > 0) {
          invoiceGroups.push([...currentGroup]);
          currentGroup = [];
        }
        invoiceNo += 1;
        return;
      }

      const customer = row["Customer"]?.trim();
      const employee = row["Employee"]?.trim();
      const regHours = parseFloat(row["REG HRS"] || 0);
      const otHours = parseFloat(row["OT HRS"] || 0);
      const br = parseFloat(row["B/R"] || 0);
      const otbr = parseFloat(row["OT B/R"] || 0);
      const department = row["Department"] || "";

      if (!customer || !employee || (regHours === 0 && otHours === 0)) return;

      const baseRow = {
        "*InvoiceNo": invoiceNo,
        "*Customer": customer,
        "*InvoiceDate": invoiceDateFormatted,
        "*DueDate": dueDateFormatted,
        Terms: "Net 30",
        Department: hasDepartment ? department : undefined,
        Employee: employee,
        Hours: regHours,
        Rate: `$${br.toFixed(2)}`,
        "*ItemTaxCode": " ",
        Amount: `$${(regHours * br).toFixed(2)}`
      };

      currentGroup.push(baseRow);

      if (otHours > 0) {
        const otRow = {
          "*InvoiceNo": invoiceNo,
          "*Customer": customer,
          "*InvoiceDate": invoiceDateFormatted,
          "*DueDate": dueDateFormatted,
          Terms: "Net 30",
          Department: hasDepartment ? department : undefined,
          Employee: "Overtime",
          Hours: otHours,
          Rate: `$${otbr.toFixed(2)}`,
          "*ItemTaxCode": " ",
          Amount: `$${(otHours * otbr).toFixed(2)}`
        };
        currentGroup.push(otRow);
      }
    });

    if (currentGroup.length > 0) {
      invoiceGroups.push(currentGroup);
    }

    const columnOrder = [
      "*InvoiceNo",
      "*Customer",
      "*InvoiceDate",
      "*DueDate",
      "Terms",
      ...(hasDepartment ? ["Department"] : []),
      "Employee",
      "Hours",
      "Rate",
      "*ItemTaxCode",
      "Amount"
    ];

    const files = invoiceGroups.map((rows, index) => {
      const cleaned = rows.filter(row =>
        row["*Customer"] && row.Employee && row.Hours > 0 && row.Rate && row.Amount
      );

      const csv = Papa.unparse(cleaned, { columns: columnOrder });
      const fileName = `${outputName}_${index + 1}.csv`;
      return { fileName, fileContent: csv };
    });

    return NextResponse.json({ files });

  } catch (err) {
    console.error('ETL processing failed:', err);
    return NextResponse.json({ error: 'ETL processing failed.' }, { status: 500 });
  }
}
