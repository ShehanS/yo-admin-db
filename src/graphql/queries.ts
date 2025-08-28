import {gql} from '@apollo/client';


export const GET_USER_COUNT_30MIN_BUCKETS_IN_RANGE = gql`
    query GetUserCount30MinuteBucketsInRange($startTime: Float!, $endTime: Float!) {
        getUserCount30MinuteBucketsInRange(
            startTime: $startTime
            endTime: $endTime
        )
    }
`

export const GET_SITE_CONFIG = gql`
    query IsEnable {
        isEnable
    }
`

export const UPDATE_SITE_CONFIG = gql`
    mutation SiteEnable($state: Boolean!, $timestamp: Float!) {
        siteEnable(state: $state, timestamp: $timestamp)
    }
`

export const GET_MALE_VS_FEMALE = gql`
    query FindMaleVsFemail {
        findMaleVsFemail
    }

`

export const GET_FIND_AGE_DISTRIBUTION = gql`
    query FindAgeDistribution {
        findAgeDistributionWithPercentage
    }

`

export const GET_USERS = gql`
    query  GetUsers($searchTerm: String, $paginateRequest: PaginateRequestInput!){
        getUsers(
            paginateRequest: $paginateRequest,
            searchTerm: $searchTerm
        )
    }
`
export const USER_ACTIVATION = gql`
    mutation UserActivation($userId: String!, $state: Boolean!) {
        userActivation(userId: $userId, state: $state)
    }

`

export const GET_EVENTS = gql`
    query GetEvents {
        getEvents
    }
`

export const GET_ZONES = gql`
    query GetZoneConfig($eventId:String!) {
        getZoneConfig(eventId:$eventId)
    }
`

export const GET_ALL_ZONES = gql`
    query GetZones {
        getZones
    }
`


