// import React, { useEffect } from 'react';
// import { db, doc, getDoc } from '../firebase-setup/firebase';
// import { Layout, Button } from 'antd';
// import { NavLink } from 'react-router-dom';
// import DisplayContent from '../components/showContent';

// const { Content, Sider } = Layout;

// const ShowContent = () => {

//     useEffect(() => {
//         const getUser = async () => {
//             const uid = localStorage.getItem('uid');
//             if (uid) {
//                 try {
//                     const docRef = doc(db, "Users", uid);
//                     const docSnap = await getDoc(docRef);
//                     if (docSnap.exists()) {
//                         const userData = docSnap.data();
//                         localStorage.setItem(
//                             'userFirstName',
//                             JSON.stringify(userData.firstname)
//                         );
//                     }
//                 } catch (error) {
//                     console.error("Error fetching document:", error);
//                 }
//             }
//         };
//         getUser();
//     }, []);

//     return (
//         <Layout style={{ minHeight: '100vh' }}>

//             {/* Main Content */}
//             <Layout>
//                 <Content
//                     style={{
//                         padding: '30px',
//                         background: '#f5f7fb',
//                     }}
//                 >
//                     <div
//                         style={{
//                             background: '#fff',
//                             padding: '25px',
//                             borderRadius: '12px',
//                             boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
//                             minHeight: '80vh',
//                         }}
//                     >
//                         <DisplayContent />
//                     </div>
//                 </Content>
//             </Layout>

//         </Layout>
//     );
// };

// export default ShowContent;
