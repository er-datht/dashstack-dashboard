export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] dark:bg-[#0f1015]">
      <div className="bg-white dark:bg-[#1a1d24] p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Login
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#242831] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#242831] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
