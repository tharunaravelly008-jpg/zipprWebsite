import React from 'react';
import { Card } from '../../components/common';
import { ArrowRight, Calendar } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Introducing Zippr Auto: Faster short-distance commutes',
    excerpt: 'Navigate through heavy city traffic seamlessly with our new fleet of verified auto-rickshaws.',
    category: 'Product Update',
    date: 'Oct 12, 2026',
    image: 'https://images.unsplash.com/photo-1593955891392-1262ab0ea24a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: 'Safety First: Our new AI-driven partner verification',
    excerpt: 'We are rolling out real-time face matching to ensure the partner driving you is the one registered.',
    category: 'Safety',
    date: 'Sep 28, 2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Partner Spotlight: How Rajesh doubled his earnings',
    excerpt: 'Learn how Zippr\'s transparent commission structure is empowering driver partners across the city.',
    category: 'Community',
    date: 'Sep 15, 2026',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const Blog = () => {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">Zippr Blog</h1>
        <p className="text-lg text-brand-gray-500">
          News, updates, and stories from the Zippr community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} padding="none" className="overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-indigo/20 group-hover:bg-transparent transition-all z-10"></div>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-indigo dark:text-brand-lime uppercase tracking-wider bg-brand-indigo/5 dark:bg-brand-lime/10 px-2 py-1 rounded-md">{post.category}</span>
                <div className="flex items-center text-xs text-brand-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {post.date}
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 group-hover:text-brand-indigo dark:group-hover:text-brand-lime transition-colors">{post.title}</h3>
              <p className="text-sm text-brand-gray-500 mb-6 flex-grow">{post.excerpt}</p>
              <button className="flex items-center text-sm font-semibold text-brand-indigo dark:text-white group-hover:text-brand-lime transition-colors">
                Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
