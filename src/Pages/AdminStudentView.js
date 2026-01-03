import React from 'react';
import { Layout, Button } from 'antd';
import { NavLink } from 'react-router-dom';
import StdTableView from '../components/studentView';

const { Content, Sider } = Layout;

const StdView = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* Sidebar */}
            {/* <Sider
                width={260}
                style={{
                    background: 'linear-gradient(180deg, #6a11cb, #2575fc)',
                    padding: '20px 0',
                }}
            >
                <div style={{ textAlign: 'center', color: '#fff', marginBottom: 40 }}>
                    <h1 style={{ color: '#fff', marginBottom: 0 }}>E-Learning</h1>
                    <p style={{ opacity: 0.9 }}>Learn From Home</p>
                </div>

                {[
                    { to: '/AdminCourse', label: 'Courses' },
                    { to: '/StudentView', label: 'Students', active: true },
                    { to: '/AdminContent', label: 'Content' },
                    { to: '/', label: 'Logout' },
                ].map((item, index) => (
                    <NavLink key={index} to={item.to} style={{ textDecoration: 'none' }}>
                        <Button
                            type="text"
                            block
                            style={{
                                color: item.active ? '#6a11cb' : '#fff',
                                backgroundColor: item.active ? '#fff' : 'transparent',
                                padding: '18px',
                                margin: '6px 12px',
                                borderRadius: '10px',
                                fontWeight: 600,
                            }}
                        >
                            {item.label}
                        </Button>
                    </NavLink>
                ))}
            </Sider> */}

            {/* Main Content */}
            <Layout>
                <Content
                    style={{
                        padding: '30px',
                        background: '#f5f7fb',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '25px',
                            borderRadius: '12px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                            minHeight: '80vh',
                        }}
                    >
                        <StdTableView />
                    </div>
                </Content>
            </Layout>

        </Layout>
    );
};

export default StdView;
