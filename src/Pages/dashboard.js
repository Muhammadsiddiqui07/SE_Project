import React from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-setup/firebase';
import DashLayout from '../components/dashboardLayout';

function Dashboard() {
    const navigate = useNavigate();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            localStorage.setItem('uid', uid)
        } else {
            navigate("/");
        }
    });
    return (
        <div>
            <div>
                <DashLayout />
            </div>

        </div>
    )
}
export default Dashboard