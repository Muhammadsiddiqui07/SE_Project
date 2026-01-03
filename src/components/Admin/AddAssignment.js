import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { doc, addDoc, collection, db } from '../../firebase-setup/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddAssignment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields(); // Reset form fields when modal is closed
        setFile(null); // Reset file state
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onFinish = async (values) => {
        setIsLoading(true);
        try {
            let fileURL = null;
            if (file) {
                const storage = getStorage();
                const storageRef = ref(storage, `Files/${file.name}`);
                await uploadBytes(storageRef, file);
                fileURL = await getDownloadURL(storageRef);
            }


            await addDoc(collection(db, "Assignments", values.id), {
                url: fileURL,
                Type: 'Assignment',
                ID: values.id,
                CourseTitle: values.title,
                number: values.num,

            });
            message.success('File added successfully!');
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding video:", error);
            message.error('Failed to add video.');
        } finally {
            setIsLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <Button type="primary" onClick={showModal} className='Courses-btn'>
                Add Assignment
            </Button>
            <Modal
                open={isModalOpen}
                onCancel={handleCancel}
                style={{ padding: '10px' }}
                footer={null}
                confirmLoading={isLoading}
            >
                <Form
                    form={form}
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <h4>Details :</h4><br />
                    <Form.Item
                        label="Assignment No."
                        name="num"
                        rules={[
                            { required: true, message: 'Please input your Assignment No.' }
                        ]}
                    >
                        <Input placeholder='e.g: Assignment-01' />
                    </Form.Item>

                    <Form.Item
                        label="Course Title"
                        name="title"
                        rules={[
                            { required: true, message: 'Please input your Course Title!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Course Category"
                        name="category"
                        rules={[
                            { required: true, message: 'Please input your Course Category!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Course ID"
                        name="id"
                        rules={[
                            { required: true, message: 'Please input your Course ID!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <div style={{ marginLeft: '40px' }}>
                        <p><b>Note:</b> Select file From PC:</p>
                        <input type="file" accept="file" onChange={handleFileChange} />
                        <br /><br />
                    </div>

                    <Form.Item
                        wrapperCol={{ offset: 5, span: 16 }}
                    >
                        <Button type="primary" htmlType="submit" loading={isLoading} style={{ backgroundColor: 'blueviolet' }}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddAssignment;
