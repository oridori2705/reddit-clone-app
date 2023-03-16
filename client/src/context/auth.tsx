import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types"; //user 의 타입을 위해 types.tsx 파일 생성

//유저 정보 타입 정의
interface State {
    authenticated: boolean;
    user: User | undefined;
    loading: boolean;
}

//유저정보를 모든 컴포넌트에서 사용가능하게 하도록
//createContext 를 이용해서 context를 만듦
const StateContext = createContext<State>({
    authenticated: false, //유저가 인증이 됐는지 안됐는지
    user: undefined, //유저정보 처음에는 undefined
    loading: true //인증을 하고있는지 아닌지,autenticated가 하고 있는 중인지 아닌지
});

//유저의 정보를 업데이트하거나 인증 유무를 업데이트하는 것을 구현
const DispatchContext = createContext<any>(null);


interface Action {
    type: string;//login일 때 인지 logout일 때 인지
    payload: any; //user정보를 넣음
}


const reducer = (state: State, { type, payload }: Action) => {
    switch (type) {
        case "LOGIN":
            return {
                ...state, //원래있던 state를 가져오고
                authenticated: true, //login을 했으므로 인증은 true
                user: payload //user정보를 넣어준다.
            }
        case "LOGOUT":
            return {
                ...state,
                authenticated: false, //인증은 false로
                user: null //유저정보는 없애서 로그아웃
            }
        case "STOP_LOADING":
            return {
                ...state,
                loading: false
            }
        default:
            throw new Error(`Unknown action type: ${type}`)
    }
}


//페이지 안에서 context를 사용하려면 provider로 페이지를 감싸줘야한다. -> _app.tsx에서 Authprovider함수로 최상위 컴포넌트를 감싸준다.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    //useReducer : useState의 대체함수, 좀 더 복잡한 state를 업데이트하고 만들 때는 더 좋음
    //원래는 setState로 state의 값을 바꾸는데 useReducer는 Reducer라는 함수안에서 컨트롤을 해준다.
    //여러가지 경우에 맞게 state를 변경시키기가 편하다.
    const [state, defaultDispatch] = useReducer(reducer, {
        //기본값을 넣어준다.
        user: null,
        authenticated: false,
        loading: true
    })
    
    //유저의 정보를 업데이트하거나 인증유무를 업데이트 하는 부분
    const dispatch = (type: string, payload?: any) => {
        defaultDispatch({ type, payload });
    }

    //로그인 후에는 로그인페이지나 회원가입 페이지에 들어가도 다시 메인페이지로 돌아오게 만들기
    useEffect(() => {
        async function loadUser() { //컴포넌트 시작하자마자 해당 함수실행
            try {
                const res = await axios.get("/auth/me"); //로그인된 사람만 커뮤니티 생성페이지 들어갈수 있게하는 로직을 여기서도 이용
                dispatch("LOGIN", res.data);// 로그인이 되어있으면 context 정보 업데이트
                
            } catch (error) {
                console.log(error)
            } finally {
                dispatch("STOP_LOADING"); //Stop loading은 결국 실행되는 것, loading을 false로 함
            }
        }
        loadUser();
    }, [])

    //context를 사용하기 위해 컴포넌트를 아래와 같이 감싸준다.
    return (
        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>{children}</StateContext.Provider>
        </DispatchContext.Provider>
    )
}


//다른 컴포넌트에서 쉽게 사용할 수 있게 export한다.
//다른 컴포넌트에서는 const dispatch = useAuthDispatch(); 와 같이 선언하고
//dispatch
export const useAuthState = () => useContext(StateContext); //context의 현재 상태를 내보냄
export const useAuthDispatch = () => useContext(DispatchContext); //context의 상태를 업데이트함