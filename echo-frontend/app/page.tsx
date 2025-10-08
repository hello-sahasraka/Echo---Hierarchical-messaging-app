'use client'
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogIn = () => {
    console.log("Email:", email);
    console.log("Password:", password);
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
        >
          Login
        </button>
      </fieldset>
    </div>
  );
}
