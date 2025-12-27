export default function Footer() {
  return (
    <footer className="border-t border-purple-500/20 py-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-xl font-bold text-white">StacksMint</span>
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-purple-500">Twitter</a>
            <a href="#" className="hover:text-purple-500">Discord</a>
            <a href="#" className="hover:text-purple-500">GitHub</a>
          </div>
          <p className="text-gray-500 text-sm">© 2024 StacksMint</p>
        </div>
      </div>
    </footer>
  );
}
