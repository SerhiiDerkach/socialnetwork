import {profileAPI, usersAPI} from "../api/api";
import {PhotosType, PostType, ProfileType} from "../types/types";
import {ThunkAction} from "redux-thunk";
import {AppStateType} from "./redux-store";

const ADD_POST = 'ADD_POST';
const SET_USER_PROFILE = 'SET_USER_PROFILE';
const SET_STATUS = 'SET_STATUS';
const DELETE_POST = 'DELETE_POST';
const SAVE_PHOTO_SUCCESS = 'SAVE_PHOTO_SUCCESS';


let initialState = {
    posts: [
        {id: 1, message: 'Hi, how are you?', likesCount: 12},
        {id: 2, message: 'It\'s my first post', likesCount: 11},
        {id: 3, message: 'Blabla', likesCount: 11},
        {id: 4, message: 'Dada', likesCount: 11}
    ] as Array<PostType>,
    profile: null as ProfileType | null,
    status: '',
    newPostText: ''

}

export type initialStateType = typeof initialState

const profileReducer = (state = initialState, action: any): initialStateType => {
    switch (action.type) {
        case ADD_POST: {
            let newPost = {
                id: state.posts.length + 1,
                message: action.newPostText,
                likesCount: 0
            };
            return {
                ...state,
                posts: [...state.posts, newPost],
                newPostText: ''
            };
        }
        case SET_USER_PROFILE: {
            return {...state, profile: action.profile}
        }
        case SET_STATUS: {
            return {...state, status: action.status}
        }
        case DELETE_POST: {
            return {...state, posts: state.posts.filter(p => p.id !== action.postId)}
        }
        case SAVE_PHOTO_SUCCESS: {
            return {...state, profile: {...state.profile, photos: action.photos} as ProfileType}
        }
        default:
            return state;
    }
}


type ActionsTypes = addPostActionCreatorActionType |
    setUserProfileActionType |
    setStatusActionType |
    deletePostActionType |
    savePhotoSuccessActionType


type addPostActionCreatorActionType = {
    type: typeof ADD_POST
    newPostText: string
}
export const addPostActionCreator = (newPostText: string): addPostActionCreatorActionType => ({
    type: ADD_POST,
    newPostText
})


type setUserProfileActionType = {
    type: typeof SET_USER_PROFILE
    profile: ProfileType
}
export const setUserProfile = (profile: ProfileType): setUserProfileActionType => ({type: SET_USER_PROFILE, profile})


type setStatusActionType = {
    type: typeof SET_STATUS
    status: string
}
export const setStatus = (status: string): setStatusActionType => ({type: SET_STATUS, status})


type deletePostActionType = {
    type: typeof DELETE_POST
    postId: number
}
export const deletePost = (postId: number): deletePostActionType => ({type: DELETE_POST, postId})


type savePhotoSuccessActionType = {
    type: typeof SAVE_PHOTO_SUCCESS
    photos: PhotosType
}
export const savePhotoSuccess = (photos: PhotosType): savePhotoSuccessActionType => ({type: SAVE_PHOTO_SUCCESS, photos})


type GetStateType = () => AppStateType
type ThunkType = ThunkAction<Promise<void>, AppStateType, null, ActionsTypes>

export const getUserProfile = (userId: number | null): ThunkType =>
    async (dispatch) => {
    const response = await usersAPI.getProfile(userId)
    dispatch(setUserProfile(response.data));
}

export const getStatus = (userId: number): ThunkType =>
    async (dispatch) => {
    const response = await profileAPI.getStatus(userId)
    dispatch(setStatus(response.data));
}

export const updateStatus = (status: string): ThunkType =>
    async (dispatch) => {
    try {
        const response = await profileAPI.updateStatus(status)
        if (response.data.resultCode === 0) {
            dispatch(setStatus(status));
        }
    } catch (error) {
        //dispatch
        alert(error)
    }
}

export const savePhoto = (file: any): ThunkType =>
    async (dispatch) => {
    const response = await profileAPI.savePhoto(file)

    if (response.data.resultCode === 0) {
        dispatch(savePhotoSuccess(response.data.data.photos));
    }
}
export const saveProfile = (profile: ProfileType, setStatus: any, setSubmitting: any): ThunkType =>
    async (dispatch, getState: GetStateType) => {
        const userId = getState().auth.userId;
        const response = await profileAPI.saveProfile(profile)
        if (response.data.resultCode === 0) {
            dispatch(getUserProfile(userId));
        } else {
            setStatus(response.data.messages);
            setSubmitting(false);
            return Promise.reject(response.data.messages[0])
        }
    }

export default profileReducer;