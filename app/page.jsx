'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {
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
            <Link href="/portfolio" className="hover:text-black">Portfolio</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16 max-w-3xl mx-auto space-y-10">
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-indigo-600">Welcome to will-builds</h1>
          <p className="text-gray-800 leading-relaxed">
            Hi, I’m Will — a software engineer passionate about building tools that solve real-world problems.
            This is my personal website, where you’ll find projects I’ve built to automate workflows and streamline data tasks.
            One featured tool is the ETL Converter, which parses spreadsheets containing client data into clean, structured formats.
            You can view an example or try the live demo using the links below.
          </p>
        </section>

        {/* Menu Breakdown */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-black border-b border-gray-200 pb-2">Explore the Site</h2>
          <ul className="space-y-4 text-gray-800 text-base">
            <li>
              <strong>About:</strong> Learn more about who I am, what I enjoy building, and my approach to software development.
            </li>
            <li>
              <strong>Portfolio:</strong> View featured projects — including live tools and source code — that I’ve built to solve practical problems.
            </li>
            <li>
              <strong>Home:</strong> This page serves as your introduction to the site and highlights what I’m currently focused on.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-sm text-gray-500 border-t border-gray-200 py-6 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-x-4">
          <Link href="/rss" className="hover:text-indigo-600">↗ rss</Link>
          <Link href="https://www.linkedin.com/in/william-england-726410306/" target="_blank" className="hover:text-indigo-600">↗ linkedin</Link>
          <Link href="https://github.com/WillEngland2" target="_blank" className="hover:text-indigo-600">↗ github</Link>
          <Link href="/source" className="hover:text-indigo-600">↗ view source</Link>
        </div>
        <div>© {new Date().getFullYear()} MIT Licensed</div>
      </footer>
    </div>
  );
}
