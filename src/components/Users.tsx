import React, {FC, useEffect, useState} from "react";
import {Cancel, CheckCircle, ChevronLeft, ChevronRight, People, Fullscreen, FullscreenExit} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    FormLabel,
    Input,
    Option,
    Select,
    Stack,
    Table,
    Typography,
    Modal,
    ModalDialog,
    ModalClose
} from "@mui/joy";
import {useMutation, useQuery} from "@apollo/client";
import {GET_USERS, USER_ACTIVATION} from "../graphql/queries";

interface User {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    accountStatus: string;
    createdAt: number;
    contact: string;
    verified: boolean;
    provider: string;
    address: string;
    profile: string;
    nic: string;
    imageUrl: string;
    providerId: string | null;
}

interface GetUsersResponse {
    getUsers: {
        code: string;
        message: string;
        data: {
            content: User[];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
            first: boolean;
            last: boolean;
            hasNext: boolean;
            hasPrevious: boolean;
            empty: boolean;
            numberOfElements: number;
            validPage: boolean;
        };
        error: any;
    };
}

const Users: FC = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [userSearchEmail, setUserSearchEmail] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [userActivation, {
        data: updateUser,
        loading: userUpdateLoading,
        error: updateError
    }] = useMutation(USER_ACTIVATION);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (userSearchEmail !== searchTerm) {
                return;
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [userSearchEmail, searchTerm]);

    const {data, loading, error, refetch} = useQuery<GetUsersResponse>(GET_USERS, {
        variables: {
            paginateRequest: {
                page: currentPage,
                size: pageSize,
                sort: sortField,
                sortDirection: sortDirection.toUpperCase()
            },
            searchTerm: searchTerm || undefined
        },
        fetchPolicy: 'cache-and-network'
    });

    const users = data?.getUsers?.data?.content || [];
    const pagination = data?.getUsers?.data;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (_: any, newValue: number | null) => {
        if (newValue) {
            setPageSize(newValue);
            setCurrentPage(0);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(0);
    };

    const handleUserToggle = async (user: User) => {
        const displayStatus = (user.provider === 'GOOGLE' && user.accountStatus === 'PENDING') ? 'ACTIVE' : user.accountStatus;
        const newState = displayStatus === 'ACTIVE' ? false : true;

        try {
            await userActivation({
                variables: {
                    userId: user.id,
                    state: newState
                }
            });
            await refetch();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const clearSearch = () => {
        setUserSearchEmail('');
        setSearchTerm('');
    };

    const handleSearch = () => {
        setSearchTerm(userSearchEmail);
        setCurrentPage(0);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const renderTable = () => (
        <Table sx={{
            tableLayout: 'fixed',
            minWidth: isFullscreen ? '1200px' : '500px',
            maxWidth: isFullscreen ? 'none' : '500px'
        }}>
            <thead>
            <tr>
                <th style={{ width: isFullscreen ? '120px' : '60px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("firstName")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Name {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '200px' : '80px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("email")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '120px' : '50px', fontSize: isFullscreen ? '14px' : '12px' }}>Contact</th>
                <th style={{ width: isFullscreen ? '120px' : '50px', fontSize: isFullscreen ? '14px' : '12px' }}>NIC</th>
                <th style={{ width: isFullscreen ? '150px' : '50px', fontSize: isFullscreen ? '14px' : '12px' }}>Address</th>
                <th style={{ width: isFullscreen ? '80px' : '40px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("profile")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Profile {sortField === "profile" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '100px' : '40px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("provider")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Provider {sortField === "provider" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '100px' : '40px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("accountStatus")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Status {sortField === "accountStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '120px' : '50px' }}>
                    <Button
                        variant="plain"
                        onClick={() => handleSort("createdAt")}
                        sx={{p: 0, minHeight: 'auto', fontSize: isFullscreen ? '14px' : '12px'}}
                    >
                        Created At {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                    </Button>
                </th>
                <th style={{ width: isFullscreen ? '100px' : '40px', fontSize: isFullscreen ? '14px' : '12px' }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => {
                const displayStatus = (user.provider === 'GOOGLE' && user.accountStatus === 'PENDING') ? 'ACTIVE' : user.accountStatus;
                const fullName = `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();

                return (
                    <tr key={user.id}>
                        <td style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: isFullscreen ? '120px' : '60px',
                            overflow: 'hidden',
                            fontSize: isFullscreen ? '14px' : '12px',
                            padding: isFullscreen ? '8px' : '4px'
                        }}>
                            {fullName}
                        </td>
                        <td style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: isFullscreen ? '200px' : '80px',
                            overflow: 'hidden',
                            fontSize: isFullscreen ? '14px' : '12px',
                            padding: isFullscreen ? '8px' : '4px'
                        }}>
                            {user.email}
                        </td>
                        <td style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: isFullscreen ? '120px' : '50px',
                            overflow: 'hidden',
                            fontSize: isFullscreen ? '14px' : '12px',
                            padding: isFullscreen ? '8px' : '4px'
                        }}>
                            {user.contact}
                        </td>
                        <td style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: isFullscreen ? '120px' : '50px',
                            overflow: 'hidden',
                            fontSize: isFullscreen ? '14px' : '12px',
                            padding: isFullscreen ? '8px' : '4px'
                        }}>
                            {user.nic}
                        </td>
                        <td style={{
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            maxWidth: isFullscreen ? '150px' : '50px',
                            overflow: 'hidden',
                            fontSize: isFullscreen ? '14px' : '12px',
                            padding: isFullscreen ? '8px' : '4px'
                        }}>
                            {user.address || '-'}
                        </td>
                        <td style={{ padding: isFullscreen ? '8px' : '4px' }}>
                            <Chip size={isFullscreen ? "md" : "sm"} color="primary" sx={{ fontSize: isFullscreen ? '12px' : '10px' }}>
                                {user.profile}
                            </Chip>
                        </td>
                        <td style={{ padding: isFullscreen ? '8px' : '4px' }}>
                            <Chip
                                size={isFullscreen ? "md" : "sm"}
                                color={user.provider === 'GOOGLE' ? 'success' : 'neutral'}
                                sx={{ fontSize: isFullscreen ? '12px' : '10px' }}
                            >
                                {user.provider}
                            </Chip>
                        </td>
                        <td style={{ padding: isFullscreen ? '8px' : '4px' }}>
                            <Chip
                                size={isFullscreen ? "md" : "sm"}
                                color={displayStatus === 'ACTIVE' ? 'success' : displayStatus === 'PENDING' ? 'warning' : 'neutral'}
                                startDecorator={displayStatus === 'ACTIVE' ? <CheckCircle sx={{ fontSize: isFullscreen ? '16px' : '12px' }}/> : <Cancel sx={{ fontSize: isFullscreen ? '16px' : '12px' }}/>}
                                sx={{ fontSize: isFullscreen ? '12px' : '10px' }}
                            >
                                {displayStatus}
                            </Chip>
                        </td>
                        <td style={{ fontSize: isFullscreen ? '14px' : '12px', padding: isFullscreen ? '8px' : '4px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: isFullscreen ? '8px' : '4px' }}>
                            <Button
                                size={isFullscreen ? "md" : "sm"}
                                variant="soft"
                                loading={userUpdateLoading}
                                onClick={() => handleUserToggle(user)}
                                sx={{ fontSize: isFullscreen ? '12px' : '10px', minHeight: isFullscreen ? '32px' : '24px' }}
                            >
                                {displayStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </Button>
                        </td>
                    </tr>
                );
            })}
            {users.length === 0 && !loading && (
                <tr>
                    <td colSpan={10} style={{textAlign: 'center', padding: '2rem'}}>
                        <Typography level="body-lg" color="neutral">
                            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                        </Typography>
                    </td>
                </tr>
            )}
            </tbody>
        </Table>
    );

    if (error) {
        return (
            <Alert color="danger">
                Error loading users: {error.message}
            </Alert>
        );
    }

    if (updateError) {
        return (
            <Alert color="danger">
                Error updating user: {updateError.message}
            </Alert>
        );
    }

    return (
        <React.Fragment>
            <Card sx={{mb: 3}}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl sx={{flex: 1}}>
                            <FormLabel>Search by Email</FormLabel>
                            <Input
                                placeholder="Enter email to search..."
                                value={userSearchEmail}
                                onChange={(e) => setUserSearchEmail(e.target.value)}
                                startDecorator={<People/>}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                        </FormControl>
                        <Button
                            variant="solid"
                            color="primary"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            Search
                        </Button>
                        {(userSearchEmail || searchTerm) && (
                            <Button
                                variant="soft"
                                color="neutral"
                                onClick={clearSearch}
                            >
                                Clear
                            </Button>
                        )}
                    </Stack>
                    {searchTerm && (
                        <Typography level="body-sm" sx={{mt: 1, color: 'text.secondary'}}>
                            Found {pagination?.totalElements || 0} user(s) matching "{searchTerm}"
                        </Typography>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ overflow: 'auto' }}>
                    {loading && (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                            <CircularProgress/>
                        </Box>
                    )}

                    <Table sx={{ tableLayout: 'fixed', minWidth: '40vw', maxWidth: '40vw' }}>
                        <thead>
                        <tr>
                            <th style={{ width: '60px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("firstName")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Name {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '80px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("email")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '50px', fontSize: '12px' }}>Contact</th>
                            <th style={{ width: '50px', fontSize: '12px' }}>NIC</th>
                            <th style={{ width: '50px', fontSize: '12px' }}>Address</th>
                            <th style={{ width: '40px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("profile")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Profile {sortField === "profile" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '40px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("provider")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Provider {sortField === "provider" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '40px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("accountStatus")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Status {sortField === "accountStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '50px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("createdAt")}
                                    sx={{p: 0, minHeight: 'auto', fontSize: '12px'}}
                                >
                                    Created At {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '40px', fontSize: '12px' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => {
                            const displayStatus = (user.provider === 'GOOGLE' && user.accountStatus === 'PENDING') ? 'ACTIVE' : user.accountStatus;
                            const fullName = `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();

                            return (
                                <tr key={user.id}>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '60px',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        padding: '4px'
                                    }}>
                                        {fullName}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '80px',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        padding: '4px'
                                    }}>
                                        {user.email}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '50px',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        padding: '4px'
                                    }}>
                                        {user.contact}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '50px',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        padding: '4px'
                                    }}>
                                        {user.nic}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '50px',
                                        overflow: 'hidden',
                                        fontSize: '12px',
                                        padding: '4px'
                                    }}>
                                        {user.address || '-'}
                                    </td>
                                    <td style={{ padding: '4px' }}>
                                        <Chip size="sm" color="primary" sx={{ fontSize: '10px' }}>
                                            {user.profile}
                                        </Chip>
                                    </td>
                                    <td style={{ padding: '4px' }}>
                                        <Chip
                                            size="sm"
                                            color={user.provider === 'GOOGLE' ? 'success' : 'neutral'}
                                            sx={{ fontSize: '10px' }}
                                        >
                                            {user.provider}
                                        </Chip>
                                    </td>
                                    <td style={{ padding: '4px' }}>
                                        <Chip
                                            size="sm"
                                            color={displayStatus === 'ACTIVE' ? 'success' : displayStatus === 'PENDING' ? 'warning' : 'neutral'}
                                            startDecorator={displayStatus === 'ACTIVE' ? <CheckCircle sx={{ fontSize: '12px' }}/> : <Cancel sx={{ fontSize: '12px' }}/>}
                                            sx={{ fontSize: '10px' }}
                                        >
                                            {displayStatus}
                                        </Chip>
                                    </td>
                                    <td style={{ fontSize: '12px', padding: '4px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '4px' }}>
                                        <Button
                                            size="sm"
                                            variant="soft"
                                            loading={userUpdateLoading}
                                            onClick={() => handleUserToggle(user)}
                                            sx={{ fontSize: '10px', minHeight: '24px' }}
                                        >
                                            {displayStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && !loading && (
                            <tr>
                                <td colSpan={10} style={{textAlign: 'center', padding: '2rem'}}>
                                    <Typography level="body-lg" color="neutral">
                                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                    </Typography>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>

                    {pagination && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography level="body-sm">Rows per page:</Typography>
                                <Select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    size="sm"
                                    sx={{minWidth: 80}}
                                >
                                    <Option value={5}>5</Option>
                                    <Option value={10}>10</Option>
                                    <Option value={25}>25</Option>
                                    <Option value={50}>50</Option>
                                </Select>
                            </Stack>

                            <Typography level="body-sm" color="neutral">
                                {pagination?.totalElements === 0
                                    ? 'No results'
                                    : `${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, pagination?.totalElements || 0)} of ${pagination?.totalElements || 0}`
                                }
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination?.hasPrevious || loading}
                                    startDecorator={<ChevronLeft/>}
                                >
                                    Previous
                                </Button>

                                {Array.from({length: Math.min(5, pagination?.totalPages || 0)}, (_, i) => {
                                    let pageNum;
                                    if ((pagination?.totalPages || 0) <= 5) {
                                        pageNum = i;
                                    } else if (currentPage <= 2) {
                                        pageNum = i;
                                    } else if (currentPage >= (pagination?.totalPages || 0) - 3) {
                                        pageNum = (pagination?.totalPages || 0) - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === currentPage ? "solid" : "outlined"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={loading}
                                            sx={{minWidth: 40}}
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination?.hasNext || loading}
                                    endDecorator={<ChevronRight/>}
                                >
                                    Next
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </React.Fragment>
    );
};

export default Users;
