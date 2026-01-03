// import React from 'react';
// import { Button } from 'antd';
// import { NavLink, useNavigate } from 'react-router-dom';
// import ProfileCard from '../components/profileCard';
// import { getAuth, onAuthStateChanged } from '../firebase-setup/firebase'


// function Profile() {
//     const navigate = useNavigate();
//     const auth = getAuth();
//     onAuthStateChanged(auth, (user) => {
//         if (user) {
//             const uid = user.uid;
//             localStorage.setItem('uid', uid)
//         } else {
//             navigate("/");
//         }
//     });
//     const LogoutCheck = () => {
//         localStorage.setItem('uid', '')
//     }

//     return (
//         <div>
//             <div className='header'>
//                 <h1>E-Learning App</h1>
//                 <div className='headerlinkPosition'>
//                     <Button type="link"><NavLink to={'/dashboard'} style={{ textDecoration: 'none' }}>Dashboard </NavLink></Button>
//                     <Button type="link" onClick={LogoutCheck}><NavLink to={'/'} style={{ textDecoration: 'none' }}>Logout </NavLink></Button>
//                 </div>
//             </div>
//             <div className='SignupContainer'>
//                 <ProfileCard />
//             </div>
//         </div>
//     )
// }

// export default Profile