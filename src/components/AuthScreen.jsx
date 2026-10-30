
export default function AuthScreen({ onSuccess }) {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="card bg-base-100/95 w-full max-w-md shadow-2xl">
        <div className="card-body">
          <div className="flex items-center gap-2 text-2xl font-extrabold text-primary">
            <span className="status status-error animate-pulse" aria-hidden="true"></span>Pulse
          </div>
          <h1 className="card-title text-2xl">Welcome to Pulse</h1>
          <p className="opacity-70 mb-2">Sign up to see your feed and messages.</p>
          <Form onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}