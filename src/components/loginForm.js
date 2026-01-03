import React, { useState } from 'react';
import { Button, Form, Input, Spin, Alert, Card, Divider, Typography } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';
import goo from '../Assest/google-logo.png';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, doc, setDoc, db } from '../firebase-setup/firebase';

const LoginForm = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [Googleuser, setGoogleUser] = useState([])

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            localStorage.setItem("uid", user.uid);
            console.log('Google user:', user);

            const displayName = user.displayName || '';
            const [firstName, lastName = ''] = displayName.split(' ');

            await setDoc(doc(db, "Users", user.uid), {
                firstname: firstName,
                lastname: lastName,
                id: user.uid,
                imageUrl: user.photoURL,
                email: user.email,
                phonenumber: user.phoneNumber
            });

            navigate("/dashboard");
        } catch (error) {
            console.error('Google login error:', error.message);
            setLoginError(error.message);
        } finally {
            setIsLoading(false);
        }
    };


    const onFinish = async (values) => {
        console.log('Form values:', values);
        setIsLoading(true);
        if (values.username === 'Admin@gmail.com' && values.password === '12345') {
            navigate("/adminDashboard");
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, values.username, values.password);
                const user = userCredential.user;
                console.log('Email/password user:', user);
                localStorage.setItem("uid", user.uid);
                navigate("/dashboard");
            } catch (error) {
                console.error('Email/password login error:', error.message);
                setLoginError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Form submission error:', errorInfo);
        setLoginError('Failed to submit the form. Please check the fields and try again.');
    };

    return (
        <div
            style={{
                // width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // background: "linear-gradient(135deg, #f0f5ff, #e6f4ff)",
                padding: 6,
                width: '100%'
            }}
        >
            <Spin spinning={isLoading}>
                <Card
                    style={{
                        width: 450,
                        maxWidth: 800,   // 🔥 CARD WIDTH CONTROL HERE
                        borderRadius: 12,
                        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                    }}
                    bodyStyle={{ padding: 40 }}
                >
                    <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 5 }}>
                        Login Account
                    </Typography.Title>

                    <Typography.Text
                        type="secondary"
                        style={{ display: "block", textAlign: "center", marginBottom: 20 }}
                    >
                        Admin & users login using email
                    </Typography.Text>

                    {loginError && (
                        <Alert
                            message={loginError}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form
                        layout="vertical"
                        name="login"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Email Address"
                            name="username"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Invalid email format" },
                            ]}
                        >
                            <Input size="large" placeholder="example@email.com" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Please enter password" }]}
                        >
                            <Input.Password size="large" placeholder="Enter password" />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            style={{ marginTop: 10 }}
                        >
                            Login
                        </Button>

                        <Divider plain>OR</Divider>

                        <Button
                            size="large"
                            block
                            onClick={loginWithGoogle}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                borderRadius: 8,
                            }}
                        >
                            <img src={goo} alt="google" style={{ width: 20 }} />
                            Login with Google
                        </Button>

                        <div style={{ textAlign: "center", marginTop: 20 }}>
                            <Typography.Text type="secondary">
                                Don’t have an account?{" "}
                                <NavLink to="/Signup" style={{ fontWeight: 500 }}>
                                    Signup here
                                </NavLink>
                            </Typography.Text>
                        </div>
                    </Form>
                </Card>
            </Spin>
        </div>
    );

};

export default LoginForm;
