import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Alert,
    AspectRatio,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CssBaseline,
    CssVarsProvider,
    FormControl,
    FormLabel,
    Grid,
    IconButton,
    Input,
    List,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Modal,
    ModalClose,
    ModalDialog,
    Option,
    Select,
    Sheet,
    Stack,
    Table,
    Textarea,
    Typography
} from '@mui/joy';
import {Add, Dashboard, Delete, Edit, Email, MusicNote, People, Queue} from '@mui/icons-material';
import UserRegistrationGraph from "./components/UserRegistrationraph";
import EmailForm from "./components/EmailForm";
import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {GET_EVENTS, GET_SITE_CONFIG, GET_ZONES, UPDATE_SITE_CONFIG} from "./graphql/queries";
import {ResponseMessage} from "./data/data";
import MaleVsFemail from "./components/MaleVsFemail";
import AgeDistribution from "./components/AgeDistributio";
import Users from "./components/Users";
import TicketStatusGraph from "./components/TicketStatusGraph";

const MOCK_DATA = {
    systemHealth: {
        memory: [
            {time: '00:00', usage: 45},
            {time: '04:00', usage: 52},
            {time: '08:00', usage: 68},
            {time: '12:00', usage: 75},
            {time: '16:00', usage: 82},
            {time: '20:00', usage: 69}
        ],
        websockets: 1247,
        uptime: '99.8%',
        cpu: 34
    },
    queues: [
        {id: 'booking-queue', name: 'Booking Queue', count: 45, status: 'active'},
        {id: 'payment-queue', name: 'Payment Queue', count: 23, status: 'active'},
        {id: 'notification-queue', name: 'Notification Queue', count: 12, status: 'warning'},
        {id: 'email-queue', name: 'Email Queue', count: 8, status: 'active'}
    ],
    events: [
        {
            _id: '67d01ada3c5a4f220ef1f992',
            eventName: 'YOGESHWARI',
            eventId: 'event1',
            eventDate: '2025-10-28',
            eventTime: '6.00 P.M',
            eventDescription: 'Sample Description',
            eventLocation: 'CMB',
            maxTicket: 2000,
            organizer: 'Organizer',
            image: 'https://via.placeholder.com/300x200?text=Event+Image',
            theme: 'white'
        }
    ],
    zones: [
        {
            _id: '67f097d893cfe733a033f55a',
            eventId: 'event-yogeshwari',
            zoneId: 'zoneA',
            name: 'Zone A',
            price: 2000,
            discount: 0,
            available: false,
            maxTicket: 2000,
            remainingTicket: 0,
            soldTicket: 2000,
            eventDate: '2025-10-29',
            eventIdDoc: '67dfe5fd2c1d252daf311534',
            labelColor: '#8666d5',
            labelPosition: 'right'
        }
    ],
    users: [
        {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', lastLogin: '2025-01-08'},
        {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', lastLogin: '2025-01-05'}
    ]
};

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
    const [zones, setZones] = useState<Zone[]>(MOCK_DATA.zones);
    const [users, setUsers] = useState<User[]>(MOCK_DATA.users);
    const [openEventModal, setOpenEventModal] = useState<boolean>(false);
    const [openZoneModal, setOpenZoneModal] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [eventForm, setEventForm] = useState<Partial<Event>>({});
    const [zoneForm, setZoneForm] = useState<Partial<Zone>>({});
    const [selectedEventForZone, setSelectedEventForZone] = useState<string>('');
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
    const [{data: zonesResponse, loading: zoneLoading, zoneError: zoneError}] = useLazyQuery(GET_ZONES)

    const {data: eventsResponse, loading: loadingEvents, error: getEventError} = useQuery(GET_EVENTS)


    const [enabledTimeDisplay, setEnabledTimeDisplay] = useState('');


    useEffect(() => {
        const response = eventsResponse?.getEvents as ResponseMessage;
        if (response?.code === "CODE-900") {
            setEvents(response?.data)
        }
    }, [eventsResponse])

    const menuItems = useMemo(() => [
        {key: 'dashboard', label: 'Dashboard', icon: <Dashboard/>},
        {key: 'ticket', label: 'Tickets Status', icon: <Queue/>},
        // {key: 'concerts', label: 'Manage Concerts', icon: <MusicNote/>},
        {key: 'users', label: 'Manage Users', icon: <People/>},
        {key: 'treasureHunter', label: 'Treasure Hunter', icon: <Email/>}
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
        <Box sx={{p: 3, width: "50vw"}}>
            <Typography level="h2" sx={{mb: 3}}>System Dashboard</Typography>
            <Grid xs={12} md={12}>
                <Card>
                    <CardContent>
                        <Typography level="h4" sx={{mb: 2}}>User Registration</Typography>
                        <UserRegistrationGraph/>
                    </CardContent>
                </Card>
            </Grid>

            <Grid xs={12} md={12}>
                <Card>
                    <CardContent>
                        <Typography level="h4" sx={{mb: 2}}>Gender Distribution(Male vs Female)</Typography>
                        <MaleVsFemail/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={12} md={12}>
                <Card>
                    <CardContent>
                        <Typography level="h4" sx={{mb: 2}}>Age Distribution</Typography>
                        <AgeDistribution/>
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    ), []);

    const TreasureHunterContent = useMemo(() => (
        <Box sx={{p: 3}}>
            <Typography level="h2" sx={{mb: 3}}>Treasure Hunter</Typography>

            <Grid container spacing={3}>

                <Grid xs={12} md={12}>

                    <Card>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2}}>
                                Lock Screen
                            </Typography>
                            {alert.visible && <Alert color={alert.type}>{alert?.message ?? ""}</Alert>}
                            <Stack spacing={2}>
                                <div>
                                    <Typography level="body-sm" sx={{mb: 1}}>
                                        Enable Date & Time
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid xs={12} sm={6}>
                                            <Typography level="body-xs" sx={{mb: 0.5}}>
                                                Date
                                            </Typography>
                                            <Input
                                                type="date"
                                                value={enabledTimeDisplay?.split('T')[0] || ''}
                                                onChange={handleDateChange}
                                                slotProps={{
                                                    input: {
                                                        style: {colorScheme: 'dark'}
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid xs={12} sm={6}>
                                            <Typography level="body-xs" sx={{mb: 0.5}}>
                                                Time
                                            </Typography>
                                            <Input
                                                type="time"
                                                value={enabledTimeDisplay?.split('T')[1] || ''}
                                                onChange={handleTimeChange}
                                                slotProps={{
                                                    input: {
                                                        style: {colorScheme: 'dark'}
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    {siteConfig?.enabledTime && (
                                        <Typography level="body-xs" sx={{mt: 0.5, color: 'text.tertiary'}}>
                                            Milliseconds: {siteConfig.enabledTime} |
                                            Selected: {enabledTimeDisplay ? new Date(enabledTimeDisplay).toLocaleString() : 'None'}
                                        </Typography>
                                    )}
                                </div>
                                <Button onClick={handleToggleSite}>
                                    {siteConfig?.siteEnable ? "Disable" : "Enable"}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                </Grid>
                <Grid xs={12} md={12}>
                    <Card>
                        <CardContent>
                            <Typography level="h4" sx={{mb: 2}}>Send Coupons</Typography>
                            <EmailForm/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    ), [siteConfig, enabledTimeDisplay]);

    const TicketStatusContent = useMemo(() => (
        <Box sx={{p: 3}}>
            <Typography level="h2" sx={{mb: 3}}>Tickets Status</Typography>
            <Grid container spacing={3}>
                <Grid xs={12} md={12}>
                    <TicketStatusGraph/>
                </Grid>
            </Grid>
        </Box>
    ), []);

    const ManageConcertsContent = useMemo(() => (
        <Box sx={{p: 3}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 3}}>
                <Typography level="h2">Manage Concerts</Typography>
                <Button startDecorator={<Add/>} onClick={() => setOpenEventModal(true)}>
                    Add Event
                </Button>
            </Stack>

            <Card sx={{mb: 4}}>
                <CardContent>
                    <Typography level="h4" sx={{mb: 2}}>Events</Typography>
                    <Table>
                        <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Date & Time</th>
                            <th>Location</th>
                            <th>Max Tickets</th>
                            <th>Organizer</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.map((event) => (
                            <tr key={event._id}>
                                <td>{event.eventName}</td>
                                <td>{event.eventDate} at {event.eventTime}</td>
                                <td>{event.eventLocation}</td>
                                <td>{event.maxTicket}</td>
                                <td>{event.organizer}</td>
                                <td>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            size="sm"
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setEventForm(event);
                                                setOpenEventModal(true);
                                            }}
                                        >
                                            <Edit/>
                                        </IconButton>
                                        <IconButton
                                            size="sm"
                                            color="danger"
                                            onClick={() => setEvents(prev => prev.filter(e => e._id !== event._id))}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    </Stack>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                        <Typography level="h4">Zone Configuration</Typography>
                        <Button startDecorator={<Add/>} onClick={() => setOpenZoneModal(true)}>
                            Add Zone
                        </Button>
                    </Stack>

                    <Table>
                        <thead>
                        <tr>
                            <th>Event</th>
                            <th>Zone</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Sold/Max</th>
                            <th>Label</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {zones.map((zone) => {
                            const event = events.find(e => e._id === zone.eventIdDoc);
                            return (
                                <tr key={zone._id}>
                                    <td>{event?.eventName || 'Unknown Event'}</td>
                                    <td>{zone.name}</td>
                                    <td>${zone.price}</td>
                                    <td>
                                        <Chip color={zone.available ? 'success' : 'danger'}>
                                            {zone.available ? 'Available' : 'Sold Out'}
                                        </Chip>
                                    </td>
                                    <td>{zone.soldTicket}/{zone.maxTicket}</td>
                                    <td>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Box
                                                sx={{
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: '50%',
                                                    backgroundColor: zone.labelColor
                                                }}
                                            />
                                            {zone.labelPosition}
                                        </Box>
                                    </td>
                                    <td>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedZone(zone);
                                                    setZoneForm(zone);
                                                    setSelectedEventForZone(zone.eventIdDoc);
                                                    setOpenZoneModal(true);
                                                }}
                                            >
                                                <Edit/>
                                            </IconButton>
                                            <IconButton
                                                size="sm"
                                                color="danger"
                                                onClick={() => setZones(prev => prev.filter(z => z._id !== zone._id))}
                                            >
                                                <Delete/>
                                            </IconButton>
                                        </Stack>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    ), [events, zones]);

    const [userSearchEmail, setUserSearchEmail] = useState<string>('');

    const filteredUsers = useMemo(() => {
        if (!userSearchEmail.trim()) return users;
        return users.filter(user =>
            user.email.toLowerCase().includes(userSearchEmail.toLowerCase())
        );
    }, [users, userSearchEmail]);

    const ManageUsersContent = useMemo(() => (
        <Box sx={{p: 3}}>
            <Typography level="h2" sx={{mb: 3}}>Manage Users</Typography>
            <Users/>

        </Box>
    ), [users, handleUserToggle, userSearchEmail, filteredUsers]);

    const renderContent = useCallback(() => {
        switch (selectedMenu) {
            case 'dashboard':
                return DashboardContent;
            case 'ticket':
                return TicketStatusContent;
            case 'concerts':
                return ManageConcertsContent;
            case 'users':
                return ManageUsersContent;
            case 'treasureHunter':
                return TreasureHunterContent;
            default:
                return DashboardContent;
        }
    }, [selectedMenu, DashboardContent, TicketStatusContent, ManageConcertsContent, ManageUsersContent, TreasureHunterContent]);

    return (
        <CssVarsProvider>
            <CssBaseline/>
            <Box sx={{display: 'flex', minHeight: '100vh'}}>
                <Sheet
                    sx={{
                        width: 280,
                        p: 2,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto'
                    }}
                >
                    <Typography level="h3" sx={{mb: 3, px: 2}}>
                        Ticketing Admin
                    </Typography>

                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.key}>
                                <ListItemButton
                                    selected={selectedMenu === item.key}
                                    onClick={() => setSelectedMenu(item.key)}
                                >
                                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                                    <ListItemContent>{item.label}</ListItemContent>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Sheet>

                <Box sx={{flex: 1, minHeight: '100vh'}}>
                    {renderContent()}
                </Box>
            </Box>

            <Modal open={openEventModal} onClose={() => setOpenEventModal(false)}>
                <ModalDialog sx={{width: '90vw', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <ModalClose/>
                    <Typography level="h4" sx={{mb: 2}}>
                        {selectedEvent ? 'Edit Event' : 'Add New Event'}
                    </Typography>
                    <Stack spacing={2} sx={{minHeight: 'fit-content'}}>
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Event Name</FormLabel>
                                    <Input
                                        value={eventForm.eventName || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventName: e.target.value})}
                                        placeholder="Enter event name"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Event ID</FormLabel>
                                    <Input
                                        value={eventForm.eventId || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventId: e.target.value})}
                                        placeholder="Enter unique event ID"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Event Date</FormLabel>
                                    <Input
                                        type="date"
                                        value={eventForm.eventDate || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventDate: e.target.value})}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Event Time</FormLabel>
                                    <Input
                                        value={eventForm.eventTime || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventTime: e.target.value})}
                                        placeholder="e.g., 6:00 PM"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Location</FormLabel>
                                    <Input
                                        value={eventForm.eventLocation || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventLocation: e.target.value})}
                                        placeholder="Event venue location"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Max Tickets</FormLabel>
                                    <Input
                                        type="number"
                                        value={eventForm.maxTicket || ''}
                                        onChange={(e) => setEventForm({
                                            ...eventForm,
                                            maxTicket: parseInt(e.target.value) || 0
                                        })}
                                        placeholder="Total available tickets"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Organizer</FormLabel>
                                    <Input
                                        value={eventForm.organizer || ''}
                                        onChange={(e) => setEventForm({...eventForm, organizer: e.target.value})}
                                        placeholder="Event organizer name"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Theme</FormLabel>
                                    <Select
                                        value={eventForm.theme || 'white'}
                                        onChange={(_, value) => setEventForm({...eventForm, theme: value as string})}
                                    >
                                        <Option value="white">White</Option>
                                        <Option value="dark">Dark</Option>
                                        <Option value="colorful">Colorful</Option>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12}>
                                <FormControl>
                                    <FormLabel>Image URL</FormLabel>
                                    <Input
                                        value={eventForm.image || ''}
                                        onChange={(e) => setEventForm({...eventForm, image: e.target.value})}
                                        placeholder="https://example.com/event-image.jpg"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12}>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea
                                        minRows={3}
                                        value={eventForm.eventDescription || ''}
                                        onChange={(e) => setEventForm({...eventForm, eventDescription: e.target.value})}
                                        placeholder="Describe the event..."
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3}}>
                            <Button variant="outlined" onClick={() => setOpenEventModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEventSave}>
                                {selectedEvent ? 'Update Event' : 'Create Event'}
                            </Button>
                        </Box>
                    </Stack>
                </ModalDialog>
            </Modal>

            <Modal open={openZoneModal} onClose={() => setOpenZoneModal(false)}>
                <ModalDialog sx={{width: '90vw', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <ModalClose/>
                    <Typography level="h4" sx={{mb: 2}}>
                        {selectedZone ? 'Edit Zone' : 'Add New Zone'}
                    </Typography>
                    <Stack spacing={2} sx={{minHeight: 'fit-content'}}>
                        <Grid container spacing={2}>
                            <Grid xs={12}>
                                <FormControl>
                                    <FormLabel>Select Event</FormLabel>
                                    <Select
                                        value={selectedEventForZone}
                                        onChange={(_, value) => setSelectedEventForZone(value as string)}
                                        placeholder="Choose an event for this zone"
                                    >
                                        {events.map((event) => (
                                            <Option key={event._id} value={event._id}>
                                                {event.eventName} - {event.eventDate}
                                            </Option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Zone ID</FormLabel>
                                    <Input
                                        value={zoneForm.zoneId || ''}
                                        onChange={(e) => setZoneForm({...zoneForm, zoneId: e.target.value})}
                                        placeholder="e.g., zone-a, vip-section"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Zone Name</FormLabel>
                                    <Input
                                        value={zoneForm.name || ''}
                                        onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                                        placeholder="e.g., VIP Section, General Admission"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Price ($)</FormLabel>
                                    <Input
                                        type="number"
                                        value={zoneForm.price || ''}
                                        onChange={(e) => setZoneForm({
                                            ...zoneForm,
                                            price: parseInt(e.target.value) || 0
                                        })}
                                        placeholder="Ticket price"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Max Tickets</FormLabel>
                                    <Input
                                        type="number"
                                        value={zoneForm.maxTicket || ''}
                                        onChange={(e) => setZoneForm({
                                            ...zoneForm,
                                            maxTicket: parseInt(e.target.value) || 0
                                        })}
                                        placeholder="Maximum available tickets"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Discount (%)</FormLabel>
                                    <Input
                                        type="number"
                                        value={zoneForm.discount || 0}
                                        onChange={(e) => setZoneForm({
                                            ...zoneForm,
                                            discount: parseInt(e.target.value) || 0
                                        })}
                                        placeholder="Discount percentage"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl>
                                    <FormLabel>Label Position</FormLabel>
                                    <Select
                                        value={zoneForm.labelPosition || 'right'}
                                        onChange={(_, value) => setZoneForm({
                                            ...zoneForm,
                                            labelPosition: value as string
                                        })}
                                    >
                                        <Option value="left">Left</Option>
                                        <Option value="right">Right</Option>
                                        <Option value="center">Center</Option>
                                        <Option value="top">Top</Option>
                                        <Option value="bottom">Bottom</Option>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12}>
                                <FormControl>
                                    <FormLabel>Label Color</FormLabel>
                                    <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-end'}}>
                                        <Input
                                            type="color"
                                            value={zoneForm.labelColor || '#8666d5'}
                                            onChange={(e) => setZoneForm({...zoneForm, labelColor: e.target.value})}
                                            sx={{width: 80}}
                                        />
                                        <Input
                                            value={zoneForm.labelColor || '#8666d5'}
                                            onChange={(e) => setZoneForm({...zoneForm, labelColor: e.target.value})}
                                            placeholder="#8666d5"
                                            sx={{flex: 1}}
                                        />
                                    </Box>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3}}>
                            <Button variant="outlined" onClick={() => setOpenZoneModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleZoneSave}>
                                {selectedZone ? 'Update Zone' : 'Create Zone'}
                            </Button>
                        </Box>
                    </Stack>
                </ModalDialog>
            </Modal>
        </CssVarsProvider>
    );
};

export default TicketingAdminDashboard;
