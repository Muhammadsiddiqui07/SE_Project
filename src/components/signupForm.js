import React, { useState } from 'react';
import { Button, Form, Input, Spin, Card, Typography, Alert, Divider } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';
import { app, getAuth, createUserWithEmailAndPassword, db, doc, setDoc } from '../firebase-setup/firebase';

const SignupForm = () => {
    const navigate = useNavigate();
    const [signupError, setSignupError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state


    const onFinish = async (values) => {
        setLoading(true);
        console.log('Success:', values);
        const auth = getAuth(app);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await setDoc(doc(db, "Users", user.uid), {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
            });
            localStorage.setItem("uid", user.uid);
            console.log('user', user);
            navigate("/dashboard");
        } catch (error) {
            console.error("Signup error:", error.message);
            setSignupError(error.message);
        } finally {
            setLoading(false);
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        setSignupError("Failed to submit the form. Please check the fields and try again.");
    };

    return (
        <div
            style={{
                // minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // background: "linear-gradient(135deg, #f0f5ff, #e6f4ff)",
                padding: 6,
            }}
        >
            <Spin spinning={loading}>
                <Card
                    style={{
                        width: 500,
                        maxWidth: 800, // 🔥 SAME AS LOGIN
                        borderRadius: 12,
                        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                    }}
                    bodyStyle={{ padding: 32 }}
                >
                    <Typography.Title
                        level={3}
                        style={{ textAlign: "center", marginBottom: 6 }}
                    >
                        Create Your Account
                    </Typography.Title>

                    <Typography.Text
                        type="secondary"
                        style={{ display: "block", textAlign: "center", marginBottom: 24 }}
                    >
                        Signup to continue to your dashboard
                    </Typography.Text>

                    {signupError && (
                        <Alert
                            type="error"
                            message={signupError}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form
                        layout="vertical"
                        name="signup"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <div>

                            <Form.Item
                                label="First Name"
                                name="firstname"
                                rules={[{ required: true, message: "First name is required" }]}
                            >
                                <Input size="large" placeholder="Enter first name" />
                            </Form.Item>

                            <Form.Item
                                label="Last Name"
                                name="lastname"
                                rules={[{ required: true, message: "Last name is required" }]}
                            >
                                <Input size="large" placeholder="Enter last name" />
                            </Form.Item>

                        </div>

                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Invalid email format" },
                            ]}
                        >
                            <Input size="large" placeholder="example@email.com" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Password is required" }]}
                        >
                            <Input.Password size="large" placeholder="Create a strong password" />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            style={{ marginTop: 12 }}
                        >
                            Register
                        </Button>

                        <Divider />

                        <div style={{ textAlign: "center" }}>
                            <Typography.Text type="secondary">
                                Already have an account?{" "}
                                <NavLink to="/" style={{ fontWeight: 500 }}>
                                    Login here
                                </NavLink>
                            </Typography.Text>
                        </div>
                    </Form>
                </Card>
            </Spin>
        </div>
    );

};

export default SignupForm;
