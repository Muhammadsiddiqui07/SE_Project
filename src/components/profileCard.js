// import React, { useState, useEffect } from 'react';
// import { Card, Button, Form, Input, Spin } from 'antd';
// import { IoCamera } from "react-icons/io5";
// import profilePicture from '../Assest/profile-pic.webp';
// import { db, storage, doc, setDoc, ref, uploadBytesResumable, getDownloadURL, getDoc } from '../firebase-setup/firebase';

// const ProfileCard = () => {
//     const [image, setImage] = useState(null);
//     const [imageUrl, setImageUrl] = useState(profilePicture);
//     const [loading, setLoading] = useState(false);
//     const [fetching, setFetching] = useState(true);
//     const [message, setMessage] = useState('');
//     const uid = localStorage.getItem('uid');
//     const [userData, setUserData] = useState({});
//     const [form] = Form.useForm();

//     // Fetch user data
//     useEffect(() => {
//         const fetchUserData = async () => {
//             setFetching(true);
//             try {
//                 const docRef = doc(db, "Users", uid);
//                 const docSnap = await getDoc(docRef);
//                 if (docSnap.exists()) {
//                     const data = docSnap.data();
//                     setUserData(data);
//                     setImageUrl(data.imageUrl || profilePicture);
//                     form.setFieldsValue({
//                         firstName: data.firstname,
//                         lastName: data.lastname,
//                         email: data.email,
//                         phone: data.phonenumber
//                     });
//                 }
//             } catch (error) {
//                 console.error(error);
//                 setMessage('Error fetching user data.');
//             } finally {
//                 setFetching(false);
//             }
//         };
//         fetchUserData();
//     }, [uid, form]);

//     // Upload image
//     const uploadFile = (file) => {
//         return new Promise((resolve, reject) => {
//             const storageRef = ref(storage, `images/${file.name}`);
//             const uploadTask = uploadBytesResumable(storageRef, file);
//             uploadTask.on('state_changed',
//                 () => { },
//                 (err) => reject(err),
//                 () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
//             );
//         });
//     };

//     // Submit form
//     const onFinish = async (values) => {
//         setLoading(true);
//         try {
//             if (image) {
//                 values.imageUrl = await uploadFile(image);
//             } else {
//                 values.imageUrl = imageUrl;
//             }
//             await setDoc(doc(db, "Users", uid), {
//                 firstname: values.firstName,
//                 lastname: values.lastName,
//                 email: values.email,
//                 phonenumber: values.phone,
//                 imageUrl: values.imageUrl,
//                 id: uid
//             });
//             setMessage('Profile updated successfully!');
//         } catch (error) {
//             console.error(error);
//             setMessage('Failed to update profile.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Image preview
//     const onImageChange = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];
//             setImage(file);
//             setImageUrl(URL.createObjectURL(file));
//         }
//     };

//     return (
//         <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
//             <Card
//                 style={{
//                     width: 500,
//                     borderRadius: 16,
//                     boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
//                     overflow: 'hidden',
//                     background: '#fdfbff'
//                 }}
//             >
//                 <Spin spinning={loading || fetching}>
//                     {/* Message */}
//                     {message && (
//                         <p style={{ color: 'blueviolet', fontWeight: 600, textAlign: 'center' }}>{message}</p>
//                     )}

//                     {/* Profile Picture */}
//                     <div style={{ position: 'relative', marginBottom: 30, textAlign: 'center' }}>
//                         <img
//                             src={imageUrl}
//                             alt="Profile"
//                             style={{
//                                 width: 130,
//                                 height: 130,
//                                 borderRadius: '50%',
//                                 // border: '4px solid blueviolet',
//                                 objectFit: 'cover',
//                                 transition: 'all 0.3s',
//                             }}
//                         />
//                         <label htmlFor="file-input"
//                             style={{
//                                 position: 'absolute',
//                                 bottom: 0,
//                                 right: 'calc(50% - 65px)',
//                                 // background: 'blueviolet',
//                                 borderRadius: '50%',
//                                 padding: 5,
//                                 cursor: 'pointer',
//                                 // color: '#fff',
//                                 fontSize: 18,
//                                 // boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
//                                 transition: 'all 0.3s',
//                             }}
//                         >
//                             <IoCamera />
//                         </label>
//                         <input id="file-input" type="file" onChange={onImageChange} style={{ display: 'none' }} />
//                     </div>

//                     {/* Form */}
//                     <Form
//                         form={form}
//                         layout="vertical"
//                         onFinish={onFinish}
//                         style={{ maxWidth: '100%' }}
//                     >
//                         <Form.Item
//                             label="First Name"
//                             name="firstName"
//                             rules={[{ required: true, message: 'Please input your first name!' }]}
//                         >
//                             <Input placeholder="Enter first name" />
//                         </Form.Item>

//                         <Form.Item
//                             label="Last Name"
//                             name="lastName"
//                             rules={[{ required: true, message: 'Please input your last name!' }]}
//                         >
//                             <Input placeholder="Enter last name" />
//                         </Form.Item>

//                         <Form.Item
//                             label="Email"
//                             name="email"
//                             rules={[{ required: true, message: 'Please input your email!' }]}
//                         >
//                             <Input placeholder="Enter email" />
//                         </Form.Item>

//                         <Form.Item
//                             label="Phone Number"
//                             name="phone"
//                             rules={[{ required: true, message: 'Please input your phone number!' }]}
//                         >
//                             <Input placeholder="Enter phone number" />
//                         </Form.Item>

//                         <Form.Item>
//                             <Button
//                                 type="primary"
//                                 htmlType="submit"
//                                 style={{
//                                     backgroundColor: 'blueviolet',
//                                     borderColor: 'blueviolet',
//                                     width: '100%',
//                                     fontWeight: 'bold',
//                                 }}
//                             >
//                                 Update Profile
//                             </Button>
//                         </Form.Item>
//                     </Form>
//                 </Spin>
//             </Card>
//         </div>
//     );
// };

// export default ProfileCard;
