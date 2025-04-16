'use client'
import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setMessage('Uploading...');

    const res = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Upload PDF Timecard</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files?.[0] || null)
          }
        />
        <button
          type="submit"
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
