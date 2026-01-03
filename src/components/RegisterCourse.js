// import React, { useEffect } from 'react';
// import { db, doc, getDoc } from '../firebase-setup/firebase';
// import { Layout, Button } from 'antd';
// import { NavLink } from 'react-router-dom';
// import RegistrationForm from './RegCorForm';


// const { Content } = Layout;
// const RegisterCourse = () => {

//     useEffect(() => {
//         const getUser = async () => {
//             const uid = localStorage.getItem('uid');
//             if (uid) {
//                 try {
//                     const docRef = doc(db, "Users", uid);
//                     const docSnap = await getDoc(docRef);
//                     if (docSnap.exists()) {
//                         const userData = docSnap.data();
//                         localStorage.setItem('userFirstName', JSON.stringify(userData.firstname));
//                     } else {
//                         console.error("No such document!");
//                     }
//                 } catch (error) {
//                     console.error("Error fetching document:", error);
//                 }
//             } else {
//                 console.error("No UID found in local storage");
//             }
//         };

//         getUser();
//     }, []);

//     return (
//         <div className='container'>
//             <Layout>
//                 <Layout>
//                     <Content
//                         style={{
//                             // margin: '24px 16px 0',
//                         }}
//                     >
//                         <div
//                             style={{
//                                 // padding: 20,
//                                 minHeight: 360,
//                                 display: 'flex',
//                                 justifyContent: 'space-between',

//                             }}
//                         >
//                             <div className='dashSidePortion'>
//                                 <div className='mainContainer'>
//                                     <h1>
//                                         E-Learning
//                                     </h1>
//                                     <p>Learn From Home</p>
//                                 </div>
//                                 <NavLink to={"/ProfileOverview"} style={{
//                                     textDecoration: 'none',
//                                 }}>
//                                     <Button type="text" block style={{
//                                         color: 'white',
//                                         padding: '30px',
//                                     }}>
//                                         <h5>Dashboard</h5>
//                                     </Button>
//                                 </NavLink>

//                                 <NavLink to={"/RegisterCourse"} style={{
//                                     textDecoration: 'none',
//                                 }}>
//                                     <Button type="text" block style={{
//                                         padding: '30px',
//                                         backgroundColor: 'white',
//                                         color: 'blueviolet'

//                                     }}>
//                                         <h5>Courses</h5>
//                                     </Button>
//                                 </NavLink>

//                                 <NavLink to={"/showContent"} style={{
//                                     textDecoration: 'none',
//                                 }}>
//                                     <Button type="text" block style={{
//                                         color: 'white',
//                                         padding: '30px'
//                                     }}>
//                                         <h5>Content</h5>
//                                     </Button>
//                                 </NavLink>

//                             </div>
//                             <div className='DetailAdmDash'>
//                                 <div className='dashboardHeader'>
//                                     <div className='dashboardHeader2'>
//                                         <RegistrationForm />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </Content>
//                 </Layout>
//             </Layout>
//         </div >
//     );
// };

// export default RegisterCourse;
