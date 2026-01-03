// UpdateCourse.js (Child)
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { doc, updateDoc, db } from '../../firebase-setup/firebase';

function UpdateCourse({ visible, onCancel, courseData, handleUpdate }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (courseData) {
            form.setFieldsValue({
                id: courseData.id,
                Category: courseData.CourseCategory,
                title: courseData.CourseTitle,
                teacherName: courseData.TeacherName,
                Seats: courseData.AvailableSeats || ''
            });
        }
    }, [courseData]);

    const onFinish = async (values) => {
        try {
            const courseRef = doc(db, "Courses", values.id);
            await updateDoc(courseRef, {
                CourseCategory: values.Category,
                CourseTitle: values.title,
                TeacherName: values.teacherName,
                AvailableSeats: values.Seats
            });
            message.success("Course updated successfully!");
            handleUpdate(); // refresh table
            onCancel();
        } catch (error) {
            console.error("Error updating course:", error);
            message.error("Failed to update course");
        }
    };

    return (
        <Modal
            title="Update Course"
            open={visible}
            footer={null}
            onCancel={onCancel}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item label="Course ID" name="id">
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label="Course Category"
                    name="Category"
                    rules={[{ required: true, message: 'Please input Course Category!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Course Title"
                    name="title"
                    rules={[{ required: true, message: 'Please input Course Title!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Teacher Name"
                    name="teacherName"
                    rules={[{ required: true, message: 'Please input Teacher Name!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Available Seats"
                    name="Seats"
                    rules={[{ required: true, message: 'Please input Available Seats!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ backgroundColor: 'blueviolet' }}
                    >
                        Update Course
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default UpdateCourse;
