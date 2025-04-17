'use client';
import Link from 'next/link';
import React, { useState } from 'react';

export default function ETLParserPage() {
  const [file, setFile] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [outputName, setOutputName] = useState('my-output');
  const [format, setFormat] = useState('quickbooks'); 
  const [downloadLink, setDownloadLink] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('etl', file);
    formData.append('invoice_date', invoiceDate);
    formData.append('output_name', outputName);
    formData.append('format', format);

    try {
      const res = await fetch('/api/parse-etl', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const fallbackText = await res.text();
        throw new Error(`Expected JSON, got: ${fallbackText}`);
      }

      const data = await res.json();

      if (res.ok && data.downloadLink) {
        setDownloadLink(data.downloadLink);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Unexpected error occurred');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/">
          <button
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
          >
            Home
          </button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">ETL Processor</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />

      <label className="block mb-2">Invoice Date:</label>
      <input
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        className="mb-4 border border-gray-300 rounded px-3 py-2 w-full"
      />

      <input
        type="text"
        value={outputName}
        onChange={(e) => setOutputName(e.target.value)}
        className="mb-4 border border-gray-300 rounded px-3 py-2 w-full"
      />

      <button
        onClick={handleUpload}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Upload & Process
      </button>

      {downloadLink && (
        <div className="mt-6">
          <a
            href={downloadLink}
            download
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            📥 Download Processed File
          </a>
        </div>
      )}
    </div>
  );
}
