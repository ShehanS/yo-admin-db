import React, {FC, useState} from "react";
import {Avatar, Box, Card, CardContent, Divider, Stack, Typography} from "@mui/joy";
import {GoogleLogin} from "@react-oauth/google";
import {jwtDecode} from 'jwt-decode';
import {useLogin} from "./context/login.context";

interface DecodedCredential {
    email: string;
    name: string;
    picture: string;
    sub: string;
    iat?: number;
    exp?: number;
    given_name: string;
    family_name: string;
}

interface User {
    email: string;
    authKey: string;
}

interface GoogleCredentialResponse {
    credential: string;
}

const Login: FC = () => {
    const {loginUser} = useLogin();
    const [formErrors, setFormErrors] = useState({
        error: ''
    });

    const handleGoogleLoginSuccess = async (
        credentialResponse: GoogleCredentialResponse
    ) => {
        try {
            const decoded: DecodedCredential = jwtDecode(
                credentialResponse.credential
            );

            const loggedUser: User = {
                email: decoded.email,
                authKey: credentialResponse.credential
            };
            loginUser(loggedUser)

            setFormErrors({error: ""});
        } catch (error) {
            console.error('Error decoding Google credential:', error);
            setFormErrors((prev) => ({
                ...prev,
                error: 'Google authentication failed. Please try again.',
            }));
        }
    };

    return (
        <React.Fragment>
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                    padding: 2,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 9999
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        width: {xs: '90%', sm: 400},
                        boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)',
                        borderRadius: 'lg',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333333'
                    }}
                >
                    <CardContent sx={{p: 4}}>
                        {/* Header Section */}
                        <Stack spacing={3} alignItems="center">
                            {/* Logo/Avatar */}
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    border: '2px solid #333333'
                                }}
                            >
                                Y
                            </Avatar>

                            {/* Title */}
                            <Stack spacing={1} alignItems="center">
                                <Typography
                                    level="h2"
                                    sx={{
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '2.5rem'
                                    }}
                                >
                                    Yogeshwari
                                </Typography>
                                <Typography
                                    level="body-md"
                                    sx={{
                                        textAlign: 'center',
                                        color: '#cccccc'
                                    }}
                                >
                                    Yoeshwari admin site
                                </Typography>
                            </Stack>

                            <Divider sx={{width: '100%', backgroundColor: '#333333'}}/>

                            {/* Google Login Button */}
                            <GoogleLogin
                                type={'standard'}
                                theme="filled_black"
                                size="large"
                                onSuccess={handleGoogleLoginSuccess}
                                onError={() => {
                                    setFormErrors((prev) => ({
                                        ...prev,
                                        error: 'Google Login Failed. Please try again.',
                                    }));
                                }}
                                use_fedcm_for_prompt={false}
                                useOneTap={true}
                                cancel_on_tap_outside={false}
                                auto_select={false}
                            />

                            {/* Alternative Login Options */}
                            <Stack spacing={2} sx={{width: '100%'}}>
                                {/*<Divider>*/}
                                {/*    <Typography level="body-xs" sx={{ color: '#888888' }}>*/}
                                {/*        or*/}
                                {/*    </Typography>*/}
                                {/*</Divider>*/}

                                {/*<Button*/}
                                {/*    variant="solid"*/}
                                {/*    size="lg"*/}
                                {/*    sx={{*/}
                                {/*        width: '100%',*/}
                                {/*        py: 1.5,*/}
                                {/*        backgroundColor: '#ffffff',*/}
                                {/*        color: '#000000',*/}
                                {/*        '&:hover': {*/}
                                {/*            backgroundColor: '#f0f0f0',*/}
                                {/*            transform: 'translateY(-1px)',*/}
                                {/*            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.15)'*/}
                                {/*        },*/}
                                {/*        '&:active': {*/}
                                {/*            transform: 'scale(0.98)'*/}
                                {/*        },*/}
                                {/*        transition: 'all 0.2s ease'*/}
                                {/*    }}*/}
                                {/*    onClick={() => console.log("Email login clicked")}*/}
                                {/*>*/}
                                {/*    Sign in with Email*/}
                                {/*</Button>*/}
                            </Stack>

                            {/* Footer */}
                            <Stack spacing={2} alignItems="center" sx={{mt: 3}}>
                                <Typography level="body-xs" sx={{
                                    textAlign: 'center',
                                    color: '#888888'
                                }}>
                                    {/*By continuing, you agree to our Terms of Service and Privacy Policy*/}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography level="body-xs" sx={{color: '#888888'}}>
                                        {formErrors?.error ?? ""}
                                    </Typography>
                                    {/*<Typography*/}
                                    {/*    level="body-xs"*/}
                                    {/*    sx={{*/}
                                    {/*        color: '#ffffff',*/}
                                    {/*        cursor: 'pointer',*/}
                                    {/*        textDecoration: 'underline',*/}
                                    {/*        '&:hover': {*/}
                                    {/*            color: '#cccccc'*/}
                                    {/*        }*/}
                                    {/*    }}*/}
                                    {/*    onClick={() => console.log("Sign up clicked")}*/}
                                    {/*>*/}
                                    {/*    Sign up*/}
                                    {/*</Typography>*/}
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </React.Fragment>
    );
};

export default Login;
