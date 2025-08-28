import React, {FC, useState} from 'react';
import {Alert, Box, Button, FormControl, FormLabel, Input, Stack} from '@mui/joy';
import axiosClient from "../axios/axiosClient";
import {ResponseMessage} from "../data/data";

const EmailForm: FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        coupons: ''
    });
    const [alert, setAlert] = useState({
        visible: false,
        message: "",
        type: "info"
    })

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSend = () => {
        axiosClient.post("/sendgrid/share-coupon", formData).then((res) => {
            const response = res?.data as ResponseMessage;
            if (response?.code === "CODE-000") {
                setAlert({visible: true, message: "Email send successfully!!!", type: "success"})
                setTimeout(() => {
                    setAlert({visible: false, message: "", type: "success"})
                    setFormData({...formData, email: "", coupons: ""})
                }, 5000)
            } else {
                setAlert({visible: true, message: "Error", type: "danger"})
                setTimeout(() => {
                    setAlert({visible: false, message: "", type: "success"})
                }, 5000)
            }
        }).catch((error) => {
            setAlert({visible: true, message: "Failed to send email. Please try again.", type: "danger"})
            setTimeout(() => {
                setAlert({visible: false, message: "", type: "danger"})
            }, 5000)
            console.error("Email send error:", error);
        });
    };
    const isFormValid = formData.email && formData.coupons;

    return (
        <Box sx={{width: "100%"}}>
            {alert.visible && <Alert color={alert.type}>{alert?.message ?? ""}</Alert>}
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                        placeholder="Enter recipient's email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        sx={{width: '100%'}}
                    />
                </FormControl>

                {/*<FormControl>*/}
                {/*    <FormLabel>Subject</FormLabel>*/}
                {/*    <Input*/}
                {/*        placeholder="Enter email subject"*/}
                {/*        value={formData.subject}*/}
                {/*        onChange={handleInputChange('subject')}*/}
                {/*        sx={{ width: '100%' }}*/}
                {/*    />*/}
                {/*</FormControl>*/}

                <FormControl>
                    <FormLabel>Coupons</FormLabel>
                    <Input
                        placeholder="Enter coupons here ex: QAGF,DSAQ,ZARE..."
                        value={formData.coupons}
                        onChange={handleInputChange('coupons')}
                        sx={{width: '100%'}}
                    />
                </FormControl>

                <Button
                    variant="solid"
                    color="primary"
                    size="lg"
                    onClick={handleSend}
                    disabled={!isFormValid}
                    sx={{alignSelf: 'flex-start'}}
                >
                    Send Email
                </Button>
            </Stack>
        </Box>
    );
};

export default EmailForm;
