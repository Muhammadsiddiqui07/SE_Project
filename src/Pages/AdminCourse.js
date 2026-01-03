import React from 'react';
import { Layout, Button } from 'antd';
import { NavLink } from 'react-router-dom';
import AdminCourseView from '../components/Admin/course';


const { Content } = Layout;

const AdminCourse = () => {
    return (
        <div className='container'>
            <Layout>
                <Layout>
                    <Content
                        style={{
                            // margin: '24px 16px 0',
                        }}
                    >
                        <div
                            style={{
                                // padding: 20,
                                minHeight: 360,
                                display: 'flex',
                                justifyContent: 'space-between',

                            }}
                        >
                            <div className='dashSidePortion'>
                                <div className='mainContainer'>
                                    <h1>
                                        E-Learning
                                    </h1>
                                    <p>Learn From Home</p>
                                </div>

                                <NavLink to={"/AdminCourse"} style={{
                                    textDecoration: 'none',
                                }}>
                                    <Button type="text" block style={{
                                        padding: '30px',
                                        backgroundColor: 'white',
                                        color: 'blueviolet'
                                    }}>
                                        <h5>Courses</h5>
                                    </Button>
                                </NavLink>

                                <NavLink to={"/StudentView"} style={{
                                    textDecoration: 'none',
                                }}>
                                    <Button type="text" block style={{
                                        color: 'white',
                                        padding: '30px'

                                    }}>
                                        <h5>Students</h5>
                                    </Button>
                                </NavLink>

                                <NavLink to={"/AdminContent"} style={{
                                    textDecoration: 'none',
                                }}>
                                    <Button type="text" block style={{
                                        color: 'white',
                                        padding: '30px'

                                    }}>
                                        <h5>Content</h5>
                                    </Button>
                                </NavLink>

                                <NavLink to={"/"} style={{
                                    textDecoration: 'none',
                                }}>
                                    <Button type="text" block style={{
                                        color: 'white',
                                        padding: '30px'
                                    }}>
                                        <h5>Logout</h5>
                                    </Button>
                                </NavLink>

                            </div>
                            <div className='DetailAdmDash'>
                                <div className='dashboardHeader'>
                                    <div className='dashboardHeader2'>
                                        <AdminCourseView />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </div >
    );
};

export default AdminCourse;
