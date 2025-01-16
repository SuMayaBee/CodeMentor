export default function Loading() {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }