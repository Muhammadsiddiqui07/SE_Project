import React, { useState } from 'react';
import { Alert, Button, Form, Input, Modal } from 'antd';
import { db, deleteDoc, doc, collection, getDocs, query, where } from '../../firebase-setup/firebase';

function DelCourse() {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState(null);
    const [title, setTitle] = useState([])
    const [id, setId] = useState([])

    const showModal = () => {
        setOpen(true);
        setAlertMessage(null);
        setAlertType(null);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const deleteDocument = async (collectionName, docId) => {
        try {
            const docRef = doc(db, collectionName, docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error deleting document from ${collectionName}:`, error);
        }
    };

    const deleteByTitle = async () => {
        const collections = ["Courses", "Content", "Quizzes", "Registered-Course"];

        for (const collectionName of collections) {
            try {
                const q = query(collection(db, 'Quizzes'), where("CourseTitle", "==", title), where("ID", "==", id));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach(async (doc) => {
                    const docId = doc.id;
                    await deleteDoc(collectionName, docId);
                });
            } catch (error) {
                console.error(`Error finding and deleting documents from ${collectionName}:`, error);
            }
        }
    };

    const onFinish = async (values) => {
        setConfirmLoading(true);
        try {
            const courseId = values.id;
            const courseTitle = values.title;
            setTitle(values.title)
            setId(values.id)
            const collections = ["Courses", "Content", "Quizzes", "Registered-Course"];

            if (courseId) {
                await Promise.all(
                    collections.map(async (collectionName) => {
                        await deleteDocument(collectionName, courseId);
                    })
                );
                setAlertMessage('Course deleted successfully!');
                setAlertType('success');
            } else if (courseTitle) {
                await deleteByTitle(courseTitle);
                setAlertMessage('Course deleted successfully!');
                setAlertType('success');
            } else {
                setAlertMessage('Please provide either Course ID or Course Title.');
                setAlertType('error');
            }

            setOpen(false);
        } catch (error) {
            console.error("Error deleting course and associated content:", error);
            setAlertMessage('Failed to delete course. Please check the Course ID and try again.');
            setAlertType('error');
        } finally {
            setConfirmLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        setAlertMessage('Failed to delete course. Please check the form and try again.');
        setAlertType('error');
    };

    return (
        <div>
            <Button type="primary" onClick={showModal} className='Courses-btn'>
                Delete Course
            </Button>
            <Modal
                title="Delete Course"
                open={open}
                onCancel={handleCancel}
                footer={null}
                confirmLoading={confirmLoading}
            >
                {alertMessage && (
                    <Alert
                        message={alertMessage}
                        type={alertType}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                <Form
                    name="delete-course"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Course ID"
                        name="id"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the Course ID!',
                            },
                        ]}
                    >
                        <Input placeholder="Enter Course ID " />
                    </Form.Item>

                    <Form.Item
                        label="Course Title"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the Course Title!',
                            },
                        ]}
                    >
                        <Input placeholder="Enter Course Title" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ backgroundColor: 'blueviolet' }} >
                            Delete Course
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default DelCourse;
