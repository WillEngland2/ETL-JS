'use client';
import React, { useState } from 'react';

export default function PDFParserPage() {
  const [file, setFile] = useState(null);
  const [outputName, setOutputName] = useState('pdf_output');
  const [downloadLink, setDownloadLink] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('output_name', outputName);

    const res = await fetch('/parse-pdf', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok && data.downloadLink) {
        setDownloadLink(data.downloadLink);
      } else {
        alert(data.error || 'Something went wrong');
      }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PDF Timecard Parser</h1>

      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
      <input
        type="text"
        placeholder="Output file name"
        value={outputName}
        onChange={(e) => setOutputName(e.target.value)}
        className="mb-4 block w-full border border-gray-300 rounded px-3 py-2"
      />

      <button
        onClick={handleUpload}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        Upload & Parse
      </button>

      {downloadLink && (
        <div className="mt-6">
          <a
            href={downloadLink}
            download
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            Download Parsed File
          </a>
        </div>
      )}
    </div>
  );
}
