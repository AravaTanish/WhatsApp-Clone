function Loading({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-green-600/30"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>

        {/* Brand */}
        <h1 className="text-2xl font-semibold text-green-500">WhatsApp</h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-400 text-center">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
