'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function ETLParserPage() {
  const [file, setFile] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [outputName, setOutputName] = useState('my-output');
  const [format, setFormat] = useState('quickbooks'); 
  const [downloadLink, setDownloadLink] = useState('');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => document.documentElement.classList.add('dark');
  }, []);

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
  
      if (res.ok && Array.isArray(data.files)) {
        data.files.forEach(({ fileName, fileContent }) => {
          const blob = new Blob([fileContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Unexpected error occurred');
    }
  };  

  return (
    <div className="bg-white text-black min-h-screen font-serif">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-black transition">
            will-builds
          </Link>
          <nav className="space-x-6 text-sm text-gray-700">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/page" className="hover:text-black">About</Link>
            <Link href="/portfolio" className="hover:text-black">Portfolio</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16 max-w-2xl mx-auto space-y-8">

        {/* ETL Form */}
        <section className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-6">ETL Processor</h1>

          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />

          <label className="block mb-2">Invoice Date:</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="mb-4 border border-gray-300 rounded px-3 py-2 w-full"
          />

          <label className="block mb-2">Output File Name:</label>
          <input
            type="text"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            className="mb-4 border border-gray-300 rounded px-3 py-2 w-full"
          />

          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Upload & Process
          </button>

          {downloadLink && (
            <div className="mt-6 text-center">
              <a
                href={downloadLink}
                download
                className="text-indigo-600 underline hover:text-indigo-800"
              >
                📥 Download Processed File
              </a>
            </div>
          )}
        </section>

        {/* Example File Download */}
        <section className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Need a test file?</h2>
          <p className="text-gray-700 mb-3">
            You can download a sample .xlsx file that’s already formatted for this tool. Use it to test how the ETL processor works.
          </p>
          <a
            href="/TestFile/TestFiles.xlsx"
            download
            className="inline-block text-indigo-600 underline hover:text-indigo-800 text-sm"
          >
            📎 Download example .xlsx file
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-sm text-gray-500 border-t border-gray-200 py-6 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-x-4">
          <Link href="/rss" className="hover:text-indigo-600">↗ rss</Link>
          <Link href="https://github.com/WillEngland2" target="_blank" className="hover:text-indigo-600">↗ github</Link>
          <Link href="/source" className="hover:text-indigo-600">↗ view source</Link>
        </div>
        <div>© {new Date().getFullYear()} MIT Licensed</div>
      </footer>
    </div>
  );
}
