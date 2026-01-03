import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Spin, Alert, Button } from 'antd';
import AddVedios from './AddVedio';
import AddAssignment from './AddAssignment';
import AddQuiz from './AddQuiz';
import { collection, getDocs, deleteDoc, doc, db } from '../../firebase-setup/firebase';
import { MdDelete } from "react-icons/md";

const UploadContent = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                const [contentSnapshot, assignmentsSnapshot, quizzesSnapshot] = await Promise.all([
                    getDocs(collection(db, "Content")),
                    getDocs(collection(db, "Assignments")),
                    getDocs(collection(db, "Quizzes")),
                ]);

                const contentData = [
                    ...contentSnapshot.docs.map(doc => ({
                        key: doc.id,
                        title: doc.data().CourseTitle,
                        type: doc.data().Type,
                        fileOrLink: doc.data().VideoURL || doc.data().YouTubeURL || doc.data().url || 'No URL available',
                        number: doc.data().number,
                        collectionName: "Content"
                    })),
                    ...assignmentsSnapshot.docs.map(doc => ({
                        key: doc.id,
                        title: doc.data().CourseTitle,
                        type: doc.data().Type,
                        fileOrLink: doc.data().VideoURL || doc.data().YouTubeURL || doc.data().url || 'No URL available',
                        number: doc.data().number,
                        collectionName: "Assignments"
                    })),
                    ...quizzesSnapshot.docs.map(doc => ({
                        key: doc.id,
                        title: doc.data().CourseTitle,
                        type: doc.data().Type,
                        fileOrLink: doc.data().VideoURL || doc.data().YouTubeURL || doc.data().url || 'No URL available',
                        number: doc.data().number,
                        collectionName: "Quizzes"
                    }))
                ];

                setContent(contentData);
            } catch (err) {
                console.error("Error fetching content:", err);
                setError('Failed to fetch content.');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const handleDelete = async (record) => {
        setLoading(true); // Set loading to true before deletion
        try {
            await deleteDoc(doc(db, record.collectionName, record.key));
            setContent(prevContent => prevContent.filter(item => item.key !== record.key));
        } catch (err) {
            console.error("Error deleting document:", err);
            setError('Failed to delete content.');
        } finally {
            setLoading(false); // Set loading back to false after deletion
        }
    };

    const columns = [
        {
            title: 'Course Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Serial',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'File/Link',
            dataIndex: 'fileOrLink',
            key: 'fileOrLink',
            render: (text) => text !== 'No URL available' ? <a href={text} target="_blank" rel="noopener noreferrer">{text}</a> : text,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="danger"
                    icon={<MdDelete />}
                    onClick={() => handleDelete(record)}
                    loading={loading} 
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div style={{ width: '100%', padding: '10px' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Card title="Add Video Lecture" bordered={false}>
                        <AddVedios />
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Card title="Add Assignment" bordered={false}>
                        <AddAssignment />
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Card title="Add Quizzes" bordered={false}>
                        <AddQuiz />
                    </Card>
                </Col>
            </Row>

            <div style={{ margin: '20px 0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Spin size="large" />
                        <p>Loading content...</p>
                    </div>
                ) : error ? (
                    <Alert message={error} type="error" />
                ) : (
                    <Table
                        dataSource={content}
                        columns={columns}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: '100%' }}
                    />
                )}
            </div>
        </div>
    );
};

export default UploadContent;
