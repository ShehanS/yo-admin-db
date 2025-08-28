import React, {FC, useEffect, useState} from "react";
import {Cancel, CheckCircle, ChevronLeft, ChevronRight, People} from "@mui/icons-material";
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
    Typography
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
    const [userActivation, {
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

    if (error) {
        return (
            <Alert
                sx={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #EF4444',
                    color: '#EF4444'
                }}
            >
                Error loading users: {error.message}
            </Alert>
        );
    }

    if (updateError) {
        return (
            <Alert
                sx={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #EF4444',
                    color: '#EF4444'
                }}
            >
                Error updating user: {updateError.message}
            </Alert>
        );
    }

    return (
        <React.Fragment>
            {/* Search Card */}
            <Card sx={{
                mb: 3,
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333'
            }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="end">
                        <FormControl sx={{flex: 1}}>
                            <FormLabel sx={{ color: '#ffffff' }}>Search by Email</FormLabel>
                            <Input
                                placeholder="Enter email to search..."
                                value={userSearchEmail}
                                onChange={(e) => setUserSearchEmail(e.target.value)}
                                startDecorator={<People sx={{ color: '#ffffff' }} />}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                sx={{
                                    backgroundColor: '#2a2a2a',
                                    color: '#ffffff',
                                    border: '1px solid #444444',
                                    '&:hover': {
                                        borderColor: '#666666'
                                    },
                                    '&:focus-within': {
                                        borderColor: '#3B82F6'
                                    }
                                }}
                            />
                        </FormControl>
                        <Button
                            variant="solid"
                            onClick={handleSearch}
                            disabled={loading}
                            sx={{
                                backgroundColor: '#3B82F6',
                                color: '#ffffff',
                                '&:hover': {
                                    backgroundColor: '#2563EB'
                                }
                            }}
                        >
                            Search
                        </Button>
                        {(userSearchEmail || searchTerm) && (
                            <Button
                                variant="soft"
                                onClick={clearSearch}
                                sx={{
                                    backgroundColor: '#2a2a2a',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#3a3a3a'
                                    }
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </Stack>
                    {searchTerm && (
                        <Typography level="body-sm" sx={{mt: 1, color: '#cccccc'}}>
                            Found {pagination?.totalElements || 0} user(s) matching "{searchTerm}"
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Main Table Card */}
            <Card sx={{
                backgroundColor: '#000000',
                border: '1px solid #333333'
            }}>
                <CardContent sx={{ overflow: 'auto' }}>
                    {loading && (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                            <CircularProgress sx={{ color: '#3B82F6' }} />
                        </Box>
                    )}

                    <Table sx={{
                        tableLayout: 'fixed',
                        minWidth: '100%',
                        backgroundColor: 'transparent',
                        '& thead th': {
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            borderBottom: '2px solid #333333'
                        },
                        '& tbody td': {
                            borderBottom: '1px solid #2a2a2a',
                            color: '#ffffff'
                        },
                        '& tbody tr:hover': {
                            backgroundColor: '#1a1a1a'
                        }
                    }}>
                        <thead>
                        <tr>
                            <th style={{ width: '120px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("firstName")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Name {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '150px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("email")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '100px', fontSize: '12px', color: '#ffffff' }}>Contact</th>
                            <th style={{ width: '100px', fontSize: '12px', color: '#ffffff' }}>NIC</th>
                            <th style={{ width: '120px', fontSize: '12px', color: '#ffffff' }}>Address</th>
                            <th style={{ width: '80px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("profile")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Profile {sortField === "profile" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '80px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("provider")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Provider {sortField === "provider" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '80px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("accountStatus")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Status {sortField === "accountStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '100px' }}>
                                <Button
                                    variant="plain"
                                    onClick={() => handleSort("createdAt")}
                                    sx={{
                                        p: 0,
                                        minHeight: 'auto',
                                        fontSize: '12px',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a'
                                        }
                                    }}
                                >
                                    Created At {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                                </Button>
                            </th>
                            <th style={{ width: '100px', fontSize: '12px', color: '#ffffff' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => {
                            // Special handling: Google users with PENDING status should be treated as ACTIVE
                            const displayStatus = (user.provider === 'GOOGLE' && user.accountStatus === 'PENDING')
                                ? 'ACTIVE'
                                : user.accountStatus;

                            const fullName = `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();

                            return (
                                <tr key={user.id}>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '12px',
                                        padding: '8px'
                                    }}>
                                        {fullName}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '12px',
                                        padding: '8px'
                                    }}>
                                        {user.email}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '12px',
                                        padding: '8px'
                                    }}>
                                        {user.contact}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '12px',
                                        padding: '8px'
                                    }}>
                                        {user.nic}
                                    </td>
                                    <td style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '12px',
                                        padding: '8px'
                                    }}>
                                        {user.address || '-'}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <Chip
                                            size="sm"
                                            sx={{
                                                fontSize: '10px',
                                                backgroundColor: '#3B82F6',
                                                color: '#ffffff'
                                            }}
                                        >
                                            {user.profile}
                                        </Chip>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <Chip
                                            size="sm"
                                            sx={{
                                                fontSize: '10px',
                                                backgroundColor: user.provider === 'GOOGLE' ? '#10B981' : '#6B7280',
                                                color: '#ffffff'
                                            }}
                                        >
                                            {user.provider}
                                        </Chip>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <Chip
                                            size="sm"
                                            startDecorator={
                                                displayStatus === 'ACTIVE' ?
                                                    <CheckCircle sx={{ fontSize: '12px', color: '#ffffff' }}/> :
                                                    <Cancel sx={{ fontSize: '12px', color: '#ffffff' }}/>
                                            }
                                            sx={{
                                                fontSize: '10px',
                                                backgroundColor: displayStatus === 'ACTIVE' ? '#10B981' :
                                                    displayStatus === 'PENDING' ? '#F59E0B' : '#6B7280',
                                                color: '#ffffff'
                                            }}
                                        >
                                            {displayStatus}
                                            {user.provider === 'GOOGLE' && user.accountStatus === 'PENDING' && (
                                                <span style={{ fontSize: '8px', opacity: 0.7 }}> (Google)</span>
                                            )}
                                        </Chip>
                                    </td>
                                    <td style={{ fontSize: '12px', padding: '8px' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <Button
                                            size="sm"
                                            variant="soft"
                                            loading={userUpdateLoading}
                                            onClick={() => handleUserToggle(user)}
                                            sx={{
                                                fontSize: '10px',
                                                minHeight: '28px',
                                                backgroundColor: displayStatus === 'ACTIVE' ? '#EF4444' : '#10B981',
                                                color: '#ffffff',
                                                '&:hover': {
                                                    backgroundColor: displayStatus === 'ACTIVE' ? '#DC2626' : '#059669'
                                                }
                                            }}
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
                                    <Typography level="body-lg" sx={{ color: '#cccccc' }}>
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
                            mt: 3,
                            flexWrap: 'wrap',
                            gap: 2,
                            p: 2,
                            backgroundColor: '#1a1a1a',
                            borderRadius: 'sm',
                            border: '1px solid #333333'
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography level="body-sm" sx={{ color: '#ffffff' }}>
                                    Rows per page:
                                </Typography>
                                <Select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    size="sm"
                                    sx={{
                                        minWidth: 80,
                                        backgroundColor: '#2a2a2a',
                                        color: '#ffffff',
                                        border: '1px solid #444444'
                                    }}
                                >
                                    <Option value={5}>5</Option>
                                    <Option value={10}>10</Option>
                                    <Option value={25}>25</Option>
                                    <Option value={50}>50</Option>
                                </Select>
                            </Stack>

                            <Typography level="body-sm" sx={{ color: '#cccccc' }}>
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
                                    startDecorator={<ChevronLeft />}
                                    sx={{
                                        backgroundColor: 'transparent',
                                        borderColor: '#444444',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a',
                                            borderColor: '#666666'
                                        },
                                        '&:disabled': {
                                            backgroundColor: 'transparent',
                                            borderColor: '#2a2a2a',
                                            color: '#666666'
                                        }
                                    }}
                                >
                                    Previous
                                </Button>

                                {/* Page Number Buttons */}
                                {pagination?.totalPages && pagination.totalPages > 1 && (
                                    <>
                                        {/* First page */}
                                        <Button
                                            variant={currentPage === 0 ? "solid" : "outlined"}
                                            size="sm"
                                            onClick={() => handlePageChange(0)}
                                            disabled={loading}
                                            sx={{
                                                minWidth: 40,
                                                backgroundColor: currentPage === 0 ? '#3B82F6' : 'transparent',
                                                borderColor: currentPage === 0 ? '#3B82F6' : '#444444',
                                                color: '#ffffff',
                                                '&:hover': {
                                                    backgroundColor: currentPage === 0 ? '#2563EB' : '#2a2a2a',
                                                    borderColor: currentPage === 0 ? '#2563EB' : '#666666'
                                                }
                                            }}
                                        >
                                            1
                                        </Button>

                                        {/* Show dots if there's a gap */}
                                        {currentPage > 3 && (
                                            <Typography sx={{ px: 1, color: '#cccccc' }}>...</Typography>
                                        )}

                                        {/* Pages around current page */}
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i)
                                            .filter(pageNum => {
                                                if (pageNum === 0 || pageNum === pagination.totalPages - 1) {
                                                    return false; // We handle first and last separately
                                                }
                                                return Math.abs(pageNum - currentPage) <= 2;
                                            })
                                            .map(pageNum => (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === currentPage ? "solid" : "outlined"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={loading}
                                                    sx={{
                                                        minWidth: 40,
                                                        backgroundColor: pageNum === currentPage ? '#3B82F6' : 'transparent',
                                                        borderColor: pageNum === currentPage ? '#3B82F6' : '#444444',
                                                        color: '#ffffff',
                                                        '&:hover': {
                                                            backgroundColor: pageNum === currentPage ? '#2563EB' : '#2a2a2a',
                                                            borderColor: pageNum === currentPage ? '#2563EB' : '#666666'
                                                        }
                                                    }}
                                                >
                                                    {pageNum + 1}
                                                </Button>
                                            ))}

                                        {/* Show dots if there's a gap before last page */}
                                        {currentPage < pagination.totalPages - 4 && (
                                            <Typography sx={{ px: 1, color: '#cccccc' }}>...</Typography>
                                        )}

                                        {/* Last page */}
                                        {pagination.totalPages > 1 && (
                                            <Button
                                                variant={currentPage === pagination.totalPages - 1 ? "solid" : "outlined"}
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.totalPages - 1)}
                                                disabled={loading}
                                                sx={{
                                                    minWidth: 40,
                                                    backgroundColor: currentPage === pagination.totalPages - 1 ? '#3B82F6' : 'transparent',
                                                    borderColor: currentPage === pagination.totalPages - 1 ? '#3B82F6' : '#444444',
                                                    color: '#ffffff',
                                                    '&:hover': {
                                                        backgroundColor: currentPage === pagination.totalPages - 1 ? '#2563EB' : '#2a2a2a',
                                                        borderColor: currentPage === pagination.totalPages - 1 ? '#2563EB' : '#666666'
                                                    }
                                                }}
                                            >
                                                {pagination.totalPages}
                                            </Button>
                                        )}
                                    </>
                                )}

                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination?.hasNext || loading}
                                    endDecorator={<ChevronRight />}
                                    sx={{
                                        backgroundColor: 'transparent',
                                        borderColor: '#444444',
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a',
                                            borderColor: '#666666'
                                        },
                                        '&:disabled': {
                                            backgroundColor: 'transparent',
                                            borderColor: '#2a2a2a',
                                            color: '#666666'
                                        }
                                    }}
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
