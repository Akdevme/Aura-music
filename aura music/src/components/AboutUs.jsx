import React from 'react';
import { Music, Info, Users, Heart } from 'lucide-react';

export const AboutUs = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 mb-6 shadow-2xl">
        <Info className="h-10 w-10 text-purple-400" />
      </div>
      <h1
        className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3"
        style={{ fontFamily: "'Kontanter', sans-serif" }}
      >
        About Aura Tune
      </h1>
      <p className="text-gray-400 text-lg" style={{ fontFamily: "'M PLUS Code Latin', sans-serif" }}>
        A modern music streaming app built with React — featuring search, playlists, and audio playback.
        Owner/Developer :-- AkDev
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Music className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">What We Do</h2>
            <p className="text-gray-300 leading-relaxed">
              Aura Tune helps music lovers discover, play, and curate the perfect playlist.
              Our platform blends beautiful design with powerful search and playback features
              so users can enjoy an immersive music experience.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Heart className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Built With</h2>
            <div className="flex flex-wrap gap-3 text-gray-300">
              {['React', 'Tailwind CSS', 'API'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Key Features</h2>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Music search & discovery</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                <span>Custom playlist management</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Responsive playback controls</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Clean, modern UI</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Heart className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Built with 💖 by AKDev</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              This app was created with care to make your music journey feel friendly and delightful.
              Every detail is designed to help you find songs quickly and enjoy a smooth listening experience.
            </p>
            <p className="text-gray-400 text-sm">
              Explore the Portfolio of Owner/Developer <a href="https://ak-folio.netlify.app" target="_blank" rel="noreferrer" className="text-purple-300 underline">AkDev</a>  for more work.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm">© 2025-26 Aura Tune. All rights reserved.</p>
      </div>
    </div>
  </div>
);
