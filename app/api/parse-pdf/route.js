// import { NextResponse } from 'next/server';
// import pdfParse from 'pdf-parse';
// import Papa from 'papaparse';

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('pdf');

//     if (!file || typeof file.name !== 'string') {
//       return NextResponse.json({ error: 'No valid PDF uploaded' }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const { text } = await pdfParse(buffer);
//     const pages = text.split(/\f/g);

//     const names = [];

//     for (const pageText of pages) {
//       const match = pageText.match(/EE:\s+Flex Force\s*,\s*(.*?)\s+Supervisor:/);
//       if (match?.[1]) {
//         names.push({ Employee: match[1].trim() });
//       }
//     }

//     if (names.length === 0) {
//       return NextResponse.json({ error: 'No employee names found.' }, { status: 400 });
//     }

//     const csv = Papa.unparse(names);

//     return new NextResponse(csv, {
//       status: 200,
//       headers: {
//         'Content-Disposition': 'attachment; filename="employees.csv"',
//         'Content-Type': 'text/csv',
//       },
//     });

//   } catch (err) {
//     console.error('PDF parsing failed:', err);
//     return NextResponse.json({ error: 'PDF processing failed.' }, { status: 500 });
//   }
// }
