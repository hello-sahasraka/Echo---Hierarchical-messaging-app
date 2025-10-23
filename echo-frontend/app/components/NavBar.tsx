'use client';

import React, { useState, useEffect } from 'react';
import { disconnect_socket } from '../utils/socket';
import { useRouter } from 'next/navigation';
import { useLogged } from '../context/logginContext';

class UserDataClass {
    name: string = '';
    id: number | null = null;
    role: string = '';
}

const NavBar = () => {
    const router = useRouter();
    const { logged, setLogged } = useLogged();
    const [userData, setUserData] = useState<UserDataClass | null>(null);

    useEffect(() => {
        if (logged) {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const parsed = JSON.parse(user);
                    setUserData({
                        name: parsed.name ?? '',
                        id: parsed.id ?? null,
                        role: parsed.role ?? '',
                    });
                } catch {
                    console.error('Invalid user data in storage');
                }
            }
        } else {
            setUserData(null);
        }
    }, [logged]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUserData(null);
        setLogged(false);
        disconnect_socket();
        router.push('/');
    };


    return (
        <div className="w-full h-[75px] border-b-2 flex items-center justify-between px-6 bg-neutral text-neutral-content">
            <h1 className="text-3xl font-semibold px-3 py-2 rounded transition">
                Echo
            </h1>


            {logged && <>
                {userData &&
                    <div className="text-xl font-semibold flex items-center gap-2 text-gray-200">
                        <span className="w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-300 rounded-full">
                            {userData.name[0]}
                        </span>
                        <span>{userData.name}</span>
                        <span className="text-gray-400">({userData.role})</span>
                    </div>
                }


                <button
                    onClick={handleLogout}
                    className="text-lg font-semibold px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-black transition cursor-pointer"
                >
                    Logout
                </button></>}
        </div>
    );
};

export default NavBar;
