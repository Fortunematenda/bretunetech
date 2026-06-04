export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
        <p className="text-gray-400 mb-8">
          Welcome to the Bretune Tech blog. Stay tuned for the latest news, tech tips, and updates!
        </p>
        
        <div className="space-y-6">
          <article className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400 text-sm mb-4">June 4, 2026</p>
            <p className="text-gray-300">
              Our blog is currently under construction. Check back soon for exciting content about 
              refurbished laptops, tech tips, and industry news.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
