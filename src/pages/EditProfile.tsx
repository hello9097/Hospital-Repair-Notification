import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption } from '@ionic/react'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import Topbar from '../components/Topbar'
import { AppContext } from '../contexts/AppProvider'
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { uploadFile } from '../firebase'

const StyledWrapper = styled.div`

    .title{
        padding:0 13px;
        margin:13px 0 0 0 ;
        text-align: center;
    }
    .button{
        margin-top:20px;
    }
    .img{
        text-align: center;
        padding-top: 16px;
    }
`
const getBase64 = (img) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string));
        reader.readAsDataURL(img);
    })
}

const EditProfile = () => {
    const { userController } = useContext(AppContext);
    const { userObj, updateUser, positions, departments } = userController;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');
    const [showAlert1, setShowAlert1] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [file, setFile] = useState();

    const handleAlert = () => {
        setShowAlert1(true)
    }

    const params = useParams<{ id: string }>();

    const user = userObj ? userObj[params.id] : null;
    const userName = user ? user.name : null;
    const userPhone = user ? user.phone : null;
    const userPosition = user ? user.position : { name: null };
    const userDepartment = user ? user.department : { name: null };
    const userAvatar = user && user.avatar;

    useEffect(() => {
        if (user) {
            setName(userName);
            setPhone(userPhone);
            setPosition(userPosition.name);
            setDepartment(userDepartment.name);
            setImageUrl(userAvatar)
        }
    }, [params, user]);

    const handleChange = info => {
        if (info.file.status === 'uploading') {
            setLoading(true)
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj).then(() => {
                setFile(null)
            });
        }
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        else {
            setFile(file)
            getBase64(file).then(url => {
                setImageUrl(url)
            })
        }
        return false;
    }

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const onPreview = async file => {
        let src = file.url;
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow.document.write(image.outerHTML);
    };

    const handleUpdate = async () => {
        setShowAlert1(false);
        let imgUrl = null;
        if (file) {
            imgUrl = await uploadFile(file)
        }
        updateUser(params.id, {
            name,
            phone,
            position: { name: position },
            department: { name: department },
            avatar: imgUrl || imageUrl
        })
    }
    return (
        <StyledWrapper>
            <IonPage className="page">
                <Topbar title={'แก้ไขโปรไฟล์'} />

                <IonContent>
                    <div className="gg">
                        <div>
                            <h1 className="title">ข้อมูลทั่วไป</h1>
                            <IonList>
                                <IonItem className="img">
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        beforeUpload={beforeUpload}
                                        onChange={handleChange}
                                        onPreview={onPreview}
                                    >
                                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                    </Upload>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">ชื่อ - สกุล</IonLabel>
                                    <IonInput value={name} onIonChange={e => setName(e.detail.value)}></IonInput>
                                </IonItem>
                                <IonItem>
                                    <IonLabel>ตำแหน่ง</IonLabel>
                                    {
                                        positions && (
                                            <IonSelect value={position} okText="ยืนยัน" cancelText="ยกเลิก" onIonChange={e => setPosition(e.detail.value)}>
                                                {
                                                    positions.map((value, index) => (
                                                        <IonSelectOption key={index} value={value.name}>{value.name}</IonSelectOption>
                                                    ))
                                                }
                                            </IonSelect>
                                        )
                                    }
                                </IonItem>
                                <IonItem>
                                    <IonLabel>แผนก</IonLabel>
                                    {
                                        department && (
                                            <IonSelect value={department} okText="ยืนยัน" cancelText="ยกเลิก" onIonChange={e => setDepartment(e.detail.value)}>
                                                {
                                                    departments.map((value, index) => (
                                                        <IonSelectOption key={index} value={value.name}>{value.name}</IonSelectOption>
                                                    ))
                                                }
                                            </IonSelect>
                                        )
                                    }
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="floating">เบอร์โทรศัพท์</IonLabel>
                                    <IonInput value={phone} onIonChange={e => setPhone(e.detail.value)}></IonInput>
                                </IonItem>

                            </IonList>
                        </div>
                        <div>
                            <IonButton expand="block" className="button" onClick={handleAlert}>บันทึก</IonButton>
                        </div>
                        {name !== '' && phone !== '' && position !== '' && department !== '' ?
                            <IonAlert
                                isOpen={showAlert1}
                                onDidDismiss={handleUpdate}
                                cssClass='my-custom-class'
                                header={'Edit?'}
                                message={`Please confirm ${name} to edit.`}
                                buttons={[
                                    {
                                        text: 'Cancel',
                                        role: 'cancel',
                                        cssClass: 'secondary',
                                    },
                                    {
                                        text: 'ยืนยัน',
                                    }
                                ]}
                            /> : <IonAlert
                                isOpen={showAlert1}
                                onDidDismiss={() => {
                                    setShowAlert1(false)
                                }}
                                cssClass='my-custom-class'
                                header={'Alert!'}
                                message={'Please fill in all information.'}
                                buttons={['OK']}
                            />
                        }
                    </div>
                </IonContent>

            </IonPage>
        </StyledWrapper>
    )
}

export default EditProfile
