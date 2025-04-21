'use client';
import React from 'react';
import Link from 'next/link';

export default function PortfolioPage() {
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
            <Link href="/about-page" className="hover:text-black">About</Link>
            <Link href="/blog" className="hover:text-black">Blog</Link>
            <Link href="/portfolio" className="hover:text-black">Portfolio</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16 max-w-3xl mx-auto space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black border-b border-gray-200 pb-2">Featured Projects</h2>
          <ul className="space-y-3">
            <li className="hover:underline text-indigo-600">
              <Link href="/etl-page">ETL Tool — Clean and export Excel data</Link>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black border-b border-gray-200 pb-2">Source Code</h2>
          <ul className="space-y-3">
            <li className="hover:underline text-indigo-600">
              <Link href="https://github.com/WillEngland2/ETL-JS" target="_blank" className="hover:text-indigo-600">
                ↗ ETL Source Code
              </Link>
            </li>
          </ul>
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
