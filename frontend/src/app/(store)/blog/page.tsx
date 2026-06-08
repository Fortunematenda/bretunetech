export default function BlogPage() {
  return (
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-600 font-medium mb-4">
          Blog
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Latest News & Updates</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Welcome to the Bretune Tech blog. Stay tuned for the latest news, tech tips, and updates!
        </p>
      </div>
      
      {/* Blog Posts */}
      <div className="space-y-6">
        <article className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-cyan-600 text-sm font-semibold mb-4">June 4, 2026</p>
          <p className="text-gray-600 text-sm">
            Our blog is currently under construction. Check back soon for exciting content about 
            refurbished laptops, tech tips, and industry news.
          </p>
        </article>
      </div>
    </div>
  );
}
