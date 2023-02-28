import InputGroup from '../components/InputGroup'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import Link from 'next/link'
import  Axios  from 'axios';
import { useAuthDispatch } from '@/context/auth';

const login = () => {
    let router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});

    const dispatch = useAuthDispatch();//context의 업데이트를 사용하기 위해 auth.tsx에서 가져옴

    const handleSubmit =async (event : FormEvent)=>{
        event.preventDefault();
        //withCredentials : true : 로그인 성공하면 토큰을 생성하고 cookie에 저장,다른페이지에서의 인증도 이 토큰을 이용해 인증
        //하지만 백엔드와 프론트엔드 주소가 다른 경우 cookie가 전송이 안됨
        //이 방법을 해결하기 위해서 프론트에서 axios요청을 보낼 때 withCredentials 설정 -1
        //백엔드에서는 cors부분에 credentials : true로 설정 -2 
        //Response Header부분에 Access-Control-Allow-credentials를 설정 -3 -> 이래야 도메인주속가 달라도 쿠키를 보내줄 수 있음
        try {
            const res = await Axios.post("/auth/login",{password,username},{withCredentials : true}); 
            
            //백엔드에서 보내준 유저정보를 다른 컴포넌트에서 사용하기 위해 context에 보관하기
            dispatch("LOGIN",res.data?.user);
            //로그인하면 메인페이지로
            router.push("/");
        } catch (error :any) {
            console.error(error);
            setErrors(error?.response?.data || {})
        }
    }

    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6'>
                <div className='w-10/12 mx-auto md:w-96'>
                    <h1 className='mb-2 text-lg font-medium'>로그인</h1>
                    <form onSubmit={handleSubmit}>
                        <InputGroup
                            placeholder='Username'
                            value={username}
                            setValue={setUsername}
                            error={errors.username}
                        />
                        <InputGroup
                            placeholder='Password'
                            value={password}
                            setValue={setPassword}
                            error={errors.password}
                        />
                        <button className='w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded'>
                            로그인
                        </button>
                    </form>
                    <small>
                        아직 아이디가 없나요?
                        <Link href="/register">
                            <p className='ml-1 text-blue-500 uppercase'>회원가입</p>
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    )
}

export default login