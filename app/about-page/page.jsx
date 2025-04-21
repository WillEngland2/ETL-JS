'use client';
import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
        {/* Bio Section */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold text-indigo-600">About Me</h1>
          <p className="text-gray-800">
            I’m a software developer passionate about building tools that streamline real-world workflows. This space is where I share projects I’ve created and ideas
            I’m exploring — blending practical solutions with experiments in design, data, and development.
          </p>
        </section>

        {/* Interests Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-black">Interests</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Real-world problems</li>
            <li>Exploring new technologies</li>
            <li>Working on personal projects</li>
            <li>Experimenting with emerging tech</li>
          </ul>
        </section>

        {/* Tech Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-black">Technologies</h2>
          <p className="text-gray-800">
            Here's a snapshot of some of the tools and languages I work with:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-gray-800 text-sm">
            <li>Python</li>
            <li>JavaScript</li>
            <li>React / Next.js</li>
            <li>Tailwind CSS</li>
            <li>Flask</li>
            <li>PostgreSQL / SQLite</li>
          </ul>
        </section>

        {/* Education Section */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-black">Education</h2>
          <p className="text-gray-800">
            B.S. in Computer Science — Boise State University
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-sm text-gray-500 border-t border-gray-200 py-6 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-x-4">
          <Link href="https://github.com/WillEngland2" target="_blank" className="hover:text-indigo-600">↗ github</Link>
          <Link href="/source" className="hover:text-indigo-600">↗ view source</Link>
        </div>
        <div>© {new Date().getFullYear()} MIT Licensed</div>
      </footer>
    </div>
  );
}
