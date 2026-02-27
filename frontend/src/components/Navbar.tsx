'use client';

export const Navbar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              MediSync
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={onLogout}
              className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
