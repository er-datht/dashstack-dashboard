export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Login
        </h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              className="input w-full"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Password
            </label>
            <input
              type="password"
              className="input w-full"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2 px-4">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
