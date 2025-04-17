'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center px-6 overflow-hidden">
      
      {/* Glass effect background blob */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-r from-indigo-400 via-pink-300 to-yellow-200 opacity-30 blur-[120px] rounded-full z-0" />

      {/* Hero Card */}
      <section className="relative z-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-3xl w-full text-center animate-fade-in border border-white/30">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-snug mb-4">
          Welcome to <span className="text-indigo-600">codebywill</span>
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          A suite of internal tools built for speed and clarity. Upload Excel files or PDFs to transform, clean, and extract data for payroll, invoicing, or analytics—all in one place.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/etl-page">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
              ETL Page
            </button>
          </Link>
          <Link href="/pdf-page">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
              PDF Page
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
