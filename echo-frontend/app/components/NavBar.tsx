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
            <h1 className="text-3xl font-semibold hover:bg-gray-300 hover:text-black px-3 py-2 rounded transition">
                Echo
            </h1>


            {logged && <>
                {userData &&
                    <div className="text-xl italic font-semibold">
                        <span>{userData.name}</span>&nbsp;
                        (<span>{userData.role}</span>)
                    </div>}


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
