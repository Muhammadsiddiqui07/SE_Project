import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, message, Space } from 'antd';
import { db, doc, getDoc } from '..//firebase-setup/firebase';
import { NavLink } from 'react-router-dom';
import ProPic from '../Assest/profile-pic.webp';  // Correctly import the default profile picture

const onClick = ({ key }) => {
    if (key == 1) {
        message.info('Welcome to Profile');
    }
    else {
        message.info('See You Soon');
    }
};

const LogoutCheck = () => {
    localStorage.setItem('uid', '');
};

const items = [
    {
        label: <NavLink to={'/profile'}>Profile Detail</NavLink>,
        key: '1',
    },
    {
        label: <NavLink to={'/'} onClick={LogoutCheck}>Logout</NavLink>,
        key: '2',
    },
];

const DropDown = () => {
    const [data, setData] = useState({});
    const uid = localStorage.getItem('uid');

    useEffect(() => {
        const fetchUserData = async () => {
            if (uid) {
                try {
                    const docRef = doc(db, "Users", uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        console.log("Document data:", docSnap.data());
                        setData(docSnap.data());
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                }
            } else {
                console.log("No UID found in local storage");
            }
        };

        fetchUserData();
    }, [uid]);

    return (
        <Dropdown
            menu={{
                items,
                onClick,
            }}
        >
            <a onClick={(e) => e.preventDefault()}>
                <Space>
                    <h3 className='dashHeadPicMain'>
                        <img
                            src={data.imageUrl ? data.imageUrl : ProPic}
                            alt='Profile'
                            className='dashHeadPic'
                        />
                    </h3>
                    {/* <DownOutlined /> */}
                </Space>
            </a>
        </Dropdown>
    );
};

export default DropDown;
