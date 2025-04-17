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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const processedDir = path.join(process.cwd(), 'public', 'processed-files');
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(processedDir, { recursive: true });

    const filename = file.name;
    const uploadedPath = path.join(uploadsDir, filename);
    await writeFile(uploadedPath, buffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let invoiceNo = 115;
    const outputRows = [];

    const hasDepartment = data[0]?.Department !== undefined;

    data.forEach((row) => {
      const customer = row["Customer"]?.trim();
      const employee = row["Employee"]?.trim();
      const regHours = parseFloat(row["REG HRS"] || 0);
      const otHours = parseFloat(row["OT HRS"] || 0);
      const br = parseFloat(row["B/R"] || 0);
      const otbr = parseFloat(row["OT B/R"] || 0);
      const department = row["Department"] || "";

      if (!customer || !employee || (regHours === 0 && otHours === 0)) return;

      if (
        outputRows.length === 0 ||
        outputRows[outputRows.length - 1]["*Customer"] !== customer
      ) {
        invoiceNo += 1;
      }

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

      outputRows.push(baseRow);

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
        outputRows.push(otRow);
      }
    });

    const cleanedRows = outputRows.filter(row =>
      row["*Customer"] && row.Employee && row.Hours > 0 && row.Rate && row.Amount
    );

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

    const csv = Papa.unparse(cleanedRows, { columns: columnOrder });
    const outputFilename = `parsed_${filename.replace(/\.[^/.]+$/, '')}.csv`;
    const outputPath = path.join(processedDir, outputFilename);
    await writeFile(outputPath, csv);

    return NextResponse.json({
      message: 'File processed successfully',
      downloadLink: `/processed-files/${outputFilename}`,
    });
  } catch (err) {
    console.error('ETL processing failed:', err);
    return NextResponse.json({ error: 'ETL processing failed.' }, { status: 500 });
  }
}
