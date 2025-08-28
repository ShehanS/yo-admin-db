import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CssBaseline,
    CssVarsProvider,
    extendTheme,
    Grid,
    Input,
    List,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Sheet,
    Stack,
    Typography
} from '@mui/joy';
import {Dashboard, Email, Logout, People, Queue} from '@mui/icons-material';
import UserRegistrationGraph from "./components/UserRegistrationraph";
import EmailForm from "./components/EmailForm";
import {useMutation, useQuery} from "@apollo/client";
import {GET_EVENTS, GET_SITE_CONFIG, UPDATE_SITE_CONFIG} from "./graphql/queries";
import {ResponseMessage} from "./data/data";
import MaleVsFemail from "./components/MaleVsFemail";
import AgeDistribution from "./components/AgeDistributio";
import Users from "./components/Users";
import TicketStatusGraph from "./components/TicketStatusGraph";
import {useLogin} from "./context/login.context";

// Black & White Theme
const blackWhiteTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                background: {
                    body: '#000000',
                    surface: '#1a1a1a',
                    level1: '#2a2a2a',
                    level2: '#3a3a3a',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#cccccc',
                    tertiary: '#888888',
                },
                primary: {
                    50: '#f5f5f5',
                    100: '#e0e0e0',
                    200: '#cccccc',
                    300: '#b3b3b3',
                    400: '#999999',
                    500: '#ffffff',
                    600: '#e6e6e6',
                    700: '#cccccc',
                    800: '#b3b3b3',
                    900: '#999999',
                },
                neutral: {
                    50: '#f5f5f5',
                    100: '#e0e0e0',
                    200: '#cccccc',
                    300: '#999999',
                    400: '#666666',
                    500: '#333333',
                    600: '#2a2a2a',
                    700: '#1a1a1a',
                    800: '#0d0d0d',
                    900: '#000000',
                },
                danger: {
                    500: '#ffffff',
                },
                success: {
                    500: '#ffffff',
                },
                warning: {
                    500: '#cccccc',
                },
            },
        },
    },
});



interface Event {
    _id: string;
    eventName: string;
    eventId: string;
    eventDate: string;
    eventTime: string;
    eventDescription: string;
    eventLocation: string;
    maxTicket: number;
    organizer: string;
    image: string;
    theme: string;
}

interface Zone {
    _id: string;
    eventId: string;
    zoneId: string;
    name: string;
    price: number;
    discount: number;
    available: boolean;
    maxTicket: number;
    remainingTicket: number;
    soldTicket: number;
    eventDate: string;
    eventIdDoc: string;
    labelColor: string;
    labelPosition: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    status: string;
    lastLogin: string;
}

const TicketingAdminDashboard: React.FC = () => {
    const [selectedMenu, setSelectedMenu] = useState<string>('dashboard');
    const [events, setEvents] = useState<Event[]>([]);
    const [zones, setZones] = useState<Zone[]>();
    const [users, setUsers] = useState<User[]>();
    const [openEventModal, setOpenEventModal] = useState<boolean>(false);
    const [openZoneModal, setOpenZoneModal] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [eventForm, setEventForm] = useState<Partial<Event>>({});
    const [zoneForm, setZoneForm] = useState<Partial<Zone>>({});
    const [selectedEventForZone, setSelectedEventForZone] = useState<string>('');
    const{logoutUser} = useLogin();
    const [alert, setAlert] = useState({
        visible: false,
        message: "",
        type: "info"
    })

    const {data: siteConfigData, loading: loadingSiteConfig, error: errorSiteConfig} = useQuery(GET_SITE_CONFIG)
    const [setUpdateConfig, {
        data: updateConfig,
        loading: updateConfigLoading,
        error: updateError
    }] = useMutation(UPDATE_SITE_CONFIG)
    const [siteConfig, setSiteConfig] = useState({
        siteEnable: false,
        enabledTime: 0,
        configName: "site"
    })

    const {data: eventsResponse, loading: loadingEvents, error: getEventError} = useQuery(GET_EVENTS)
    const [enabledTimeDisplay, setEnabledTimeDisplay] = useState('');

    useEffect(() => {
        const response = eventsResponse?.getEvents as ResponseMessage;
        if (response?.code === "CODE-900") {
            setEvents(response?.data)
        }
    }, [eventsResponse])

    const menuItems = useMemo(() => [
        {key: 'dashboard', label: 'Dashboard', icon: <Dashboard sx={{color: '#cccccc'}}/>},
        {key: 'ticket', label: 'Tickets Status', icon: <Queue sx={{color: '#cccccc'}}/>},
        {key: 'users', label: 'Manage Users', icon: <People sx={{color: '#cccccc'}}/>},
        {key: 'treasureHunter', label: 'Treasure Hunter', icon: <Email sx={{color: '#cccccc'}}/>}

    ], []);

    const millisecondsToDatetimeLocal = (milliseconds) => {
        if (!milliseconds) return '';
        const date = new Date(milliseconds);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const response = siteConfigData?.isEnable as ResponseMessage;
        if (response?.code === "CODE-4001") {
            setSiteConfig(response?.data);
            if (response?.data?.enabledTime) {
                setEnabledTimeDisplay(millisecondsToDatetimeLocal(response.data.enabledTime));
            }
        }
    }, [siteConfigData])

    const handleTimeChange = (event) => {
        const timeValue = event.target.value;
        const dateValue = enabledTimeDisplay?.split('T')[0] || new Date().toISOString().split('T')[0];
        const newDateTime = `${dateValue}T${timeValue}`;
        setEnabledTimeDisplay(newDateTime);
        const milliseconds = new Date(newDateTime).getTime();
        setSiteConfig({...siteConfig, enabledTime: milliseconds});
    };

    const handleEventSave = useCallback(() => {
        try {
            if (selectedEvent) {
                setEvents(prev => prev.map(e => e._id === selectedEvent._id ? {...e, ...eventForm} : e));
            } else {
                const newEvent = {...eventForm, _id: Date.now().toString()} as Event;
                setEvents(prev => [...prev, newEvent]);
            }
            setOpenEventModal(false);
            setEventForm({});
            setSelectedEvent(null);
        } catch (error) {
            console.error('Error saving event:', error);
        }
    }, [selectedEvent, eventForm]);

    const handleZoneSave = useCallback(() => {
        try {
            const selectedEventData = events.find(e => e._id === selectedEventForZone);
            if (selectedZone) {
                setZones(prev => prev.map(z => z._id === selectedZone._id ? {...z, ...zoneForm} : z));
            } else {
                const newZone = {
                    ...zoneForm,
                    _id: Date.now().toString(),
                    eventId: selectedEventData?.eventId || '',
                    eventIdDoc: selectedEventForZone,
                    eventDate: selectedEventData?.eventDate || '',
                    available: true,
                    discount: 0,
                    remainingTicket: zoneForm.maxTicket || 0,
                    soldTicket: 0
                } as Zone;
                setZones(prev => [...prev, newZone]);
            }
            setOpenZoneModal(false);
            setZoneForm({});
            setSelectedZone(null);
        } catch (error) {
            console.error('Error saving zone:', error);
        }
    }, [selectedZone, zoneForm, selectedEventForZone, events]);

    const handleUserToggle = useCallback((userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? {...u, status: u.status === 'active' ? 'inactive' : 'active'} : u
        ));
    }, []);

    const handleToggleSite = () => {
        if (siteConfig) {
            const newSiteEnable = !siteConfig.siteEnable;
            setSiteConfig({...siteConfig, siteEnable: newSiteEnable});
            setUpdateConfig({
                variables: {
                    state: newSiteEnable,
                    timestamp: siteConfig.enabledTime
                }
            }).then((res) => {
                const response = res?.data?.siteEnable as ResponseMessage;
                if (response.code === "CODE-4003") {
                    setAlert({...alert, visible: true, type: "success", message: "Update site config success"})
                    setTimeout(() => {
                        setAlert({...alert, visible: false})
                    }, 5000)
                } else {
                    setAlert({...alert, visible: true, type: "success", message: "Update site config failed"})
                    setTimeout(() => {
                        setAlert({...alert, visible: false})
                    }, 5000)
                }
            })
                .catch((error) => {
                    console.error(error)
                    setAlert({...alert, visible: true, type: "success", message: "Update site config failed"})
                    setTimeout(() => {
                        setAlert({...alert, visible: false})
                    }, 5000)
                })
        }
    };

    const handleDateChange = (e) => {
        const dateValue = e.target.value;
        const timeValue = enabledTimeDisplay?.split('T')[1] || '00:00';
        const newDateTime = `${dateValue}T${timeValue}`;
        setEnabledTimeDisplay(newDateTime);
        const milliseconds = new Date(newDateTime).getTime();
        setSiteConfig({...siteConfig, enabledTime: milliseconds});
    };

    const DashboardContent = useMemo(() => (
        <Box sx={{p: 3, width: "100%", backgroundColor: '#000000', minHeight: '100vh'}}>
            <Typography level="h2" sx={{mb: 3, color: '#ffffff', fontWeight: 'bold'}}>
                Yogeshwari System Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2, color: '#ffffff'}}>
                                User Registration Analytics
                            </Typography>
                            <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                                <UserRegistrationGraph/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2, color: '#ffffff'}}>
                                Gender Distribution
                            </Typography>
                            <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                                <MaleVsFemail/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2, color: '#ffffff'}}>
                                Age Distribution Analysis
                            </Typography>
                            <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                                <AgeDistribution/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    ), []);

    const TreasureHunterContent = useMemo(() => (
        <Box sx={{p: 3, backgroundColor: '#000000', minHeight: '100vh'}}>
            <Typography level="h2" sx={{mb: 3, color: '#ffffff', fontWeight: 'bold'}}>
                Yogeshwari Treasure Hunter
            </Typography>

            <Grid container spacing={3}>
                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2, color: '#ffffff'}}>
                                Lock Screen Control
                            </Typography>
                            {alert.visible && (
                                <Alert
                                    sx={{
                                        mb: 2,
                                        backgroundColor: '#2a2a2a',
                                        color: '#ffffff',
                                        border: '1px solid #444444'
                                    }}
                                >
                                    {alert?.message ?? ""}
                                </Alert>
                            )}
                            <Stack spacing={2}>
                                <div>
                                    <Typography level="body-sm" sx={{mb: 1, color: '#cccccc'}}>
                                        Enable Date & Time
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid xs={12} sm={6}>
                                            <Typography level="body-xs" sx={{mb: 0.5, color: '#ffffff'}}>
                                                Date
                                            </Typography>
                                            <Input
                                                type="date"
                                                value={enabledTimeDisplay?.split('T')[0] || ''}
                                                onChange={handleDateChange}
                                                sx={{
                                                    backgroundColor: '#2a2a2a',
                                                    color: '#ffffff',
                                                    border: '1px solid #444444',
                                                    '&:hover': {borderColor: '#666666'}
                                                }}
                                                slotProps={{
                                                    input: {
                                                        style: {colorScheme: 'dark', color: '#ffffff'}
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid xs={12} sm={6}>
                                            <Typography level="body-xs" sx={{mb: 0.5, color: '#ffffff'}}>
                                                Time
                                            </Typography>
                                            <Input
                                                type="time"
                                                value={enabledTimeDisplay?.split('T')[1] || ''}
                                                onChange={handleTimeChange}
                                                sx={{
                                                    backgroundColor: '#2a2a2a',
                                                    color: '#ffffff',
                                                    border: '1px solid #444444',
                                                    '&:hover': {borderColor: '#666666'}
                                                }}
                                                slotProps={{
                                                    input: {
                                                        style: {colorScheme: 'dark', color: '#ffffff'}
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    {siteConfig?.enabledTime && (
                                        <Typography level="body-xs" sx={{mt: 0.5, color: '#888888'}}>
                                            Milliseconds: {siteConfig.enabledTime} |
                                            Selected: {enabledTimeDisplay ? new Date(enabledTimeDisplay).toLocaleString() : 'None'}
                                        </Typography>
                                    )}
                                </div>
                                <Button
                                    onClick={handleToggleSite}
                                    sx={{
                                        backgroundColor: '#ffffff',
                                        color: '#000000',
                                        '&:hover': {
                                            backgroundColor: '#e6e6e6'
                                        }
                                    }}
                                >
                                    {siteConfig?.siteEnable ? "Disable Site" : "Enable Site"}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2, color: '#ffffff'}}>
                                Send Coupons & Notifications
                            </Typography>
                            <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                                <EmailForm/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    ), [siteConfig, enabledTimeDisplay, alert]);

    const TicketStatusContent = useMemo(() => (
        <Box sx={{p: 3, backgroundColor: '#000000', minHeight: '100vh'}}>
            <Typography level="h2" sx={{mb: 3, color: '#ffffff', fontWeight: 'bold'}}>
                Yogeshwari Tickets Status
            </Typography>
            <Grid container spacing={3}>
                <Grid xs={12}>
                    <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                        <CardContent>
                            <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                                <TicketStatusGraph/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    ), []);

    const [userSearchEmail, setUserSearchEmail] = useState<string>('');

    const filteredUsers = useMemo(() => {
        if (!userSearchEmail.trim()) return users;
        return users.filter(user =>
            user.email.toLowerCase().includes(userSearchEmail.toLowerCase())
        );
    }, [users, userSearchEmail]);

    const ManageUsersContent = useMemo(() => (
        <Box sx={{p: 3, backgroundColor: '#000000', minHeight: '100vh'}}>
            <Typography level="h2" sx={{mb: 3, color: '#ffffff', fontWeight: 'bold'}}>
                Yogeshwari User Management
            </Typography>
            <Card sx={{backgroundColor: '#1a1a1a', border: '1px solid #333333'}}>
                <CardContent>
                    <Box sx={{backgroundColor: '#000000', p: 2, borderRadius: 'md'}}>
                        <Users/>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    ), []);

    const renderContent = useCallback(() => {
        switch (selectedMenu) {
            case 'dashboard':
                return DashboardContent;
            case 'ticket':
                return TicketStatusContent;
            case 'users':
                return ManageUsersContent;
            case 'treasureHunter':
                return TreasureHunterContent;
            default:
                return DashboardContent;
        }
    }, [selectedMenu, DashboardContent, TicketStatusContent, ManageUsersContent, TreasureHunterContent]);

    return (
        <CssVarsProvider theme={blackWhiteTheme} defaultMode="dark">
            <CssBaseline/>
            <Box sx={{
                display: 'flex',
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#000000',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                overflow: 'hidden'
            }}>
                <Sheet
                    sx={{
                        width: 280,
                        p: 2,
                        backgroundColor: '#1a1a1a',
                        borderRight: '1px solid #333333',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto'
                    }}
                >
                    <Typography
                        level="h3"
                        sx={{
                            mb: 3,
                            px: 2,
                            color: '#ffffff',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        Yogeshwari Admin
                    </Typography>

                    <List sx={{'--ListItem-paddingY': '8px'}}>
                        {menuItems.map((item, index) => (
                            <ListItem key={item.key} >
                                <ListItemButton
                                    style={{ backgroundColor: selectedMenu === item.key ? '#2a2a2a' : 'transparent'}}
                                    selected={selectedMenu === item.key}
                                    onClick={() => setSelectedMenu(item.key)}
                                    sx={{
                                        color: '#000000',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        },
                                        borderRadius: 'md'
                                    }}
                                >
                                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                                    <ListItemContent sx={{color: '#ffffff'}}>
                                        {item.label}
                                    </ListItemContent>
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem>
                            <ListItemButton
                                style={{ backgroundColor: 'transparent'}}
                                onClick={() => logoutUser()}
                                sx={{
                                    color: '#000000',
                                    '&:hover': {
                                        backgroundColor: '#2a2a2a'
                                    },
                                    borderRadius: 'md'
                                }}
                            >
                                <ListItemDecorator><Logout style={{color:"#ffffff"}}/></ListItemDecorator>
                                <ListItemContent sx={{color: '#ffffff'}}>
                                   Logout
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Sheet>

                <Box sx={{
                    flex: 1,
                    height: '100vh',
                    backgroundColor: '#000000',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {renderContent()}
                </Box>
            </Box>
        </CssVarsProvider>
    );
};

export default TicketingAdminDashboard;
