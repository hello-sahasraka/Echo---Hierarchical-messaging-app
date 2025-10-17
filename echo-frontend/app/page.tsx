'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { reset_socket } from "./utils/socket";
import { useLogged } from "./context/logginContext";

export default function Home() {
  const router = useRouter();
  const { logged, setLogged } = useLogged();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogIn = async () => {
    setLoading(true);
    try {
      const data = await toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        }).then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Login failed');
          }
          return res.json();
        }),
        {
          loading: 'Logging in...',
          success: <b>Login successful!</b>,
          error: <b>Login failed.</b>,
        }
      );
      console.log('Login response:', data);

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      reset_socket(data.token);
      setLogged(true);
      router.push("/chat");
    } catch (err) {
      console.error('Error caught in handleLogIn:', err);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center border-2">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs p-4 border-2 drop-shadow-xl">
        <h1 className="text-3xl font-semibold mb-4">Log In</h1>

        <label className="label">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label mt-2">Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-neutral mt-4 w-full"
          onClick={handleLogIn}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </fieldset>
    </div>
  );
}
