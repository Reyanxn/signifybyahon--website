export default function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-[#C49B66] rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-gray-500 text-sm">{text}</p>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-[#C49B66] rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">SIGNIFY BY AHON</p>
      </div>
    </div>
  );
}
