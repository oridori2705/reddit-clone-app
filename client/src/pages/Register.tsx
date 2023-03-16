import { useAuthState } from '@/context/auth';
import axios from 'axios'; //axios 설치
import Link from 'next/link'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import InputGroup from '../components/InputGroup'

//import { useAuthState } from '../context/auth';

//register가 앞의 글자 대문자가 아니면 useState가 오류가 난다.
const Register = () => {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({}); //error는 객체

    //로그인된 유저는 못들어오도록 context의 로그인인증상태를 가져온다.
    const { authenticated } = useAuthState();
    
    let router = useRouter();//NextJs에서 제공해주는 Router

    //로그인되어있으면 메인페이지로 돌아가게한다/
    if (authenticated) router.push("/");

    //백엔드에 회원가입을 위한 요청 및 회원가입 후 로그인 페이지로 자동 이동
    const handleSubmit = async (event: FormEvent) => { //event 타입 formevent
        event.preventDefault();

        try {//비동기 요청은 try-catch로 해주는게 좋다
            const res = await axios.post('/auth/register', { //보내는 모든 경로를 환경변수를 통해 Base URL을 만든다. 최상단에 넣어준다.(_app.tsx)
                //우리가 프론트엔드에서 작성한 email,password,username 보냄
                email, //email : email 인데 key와 value의 이름이 같으면 email만 적음
                password,
                username
            })
            
            router.push("/login"); //그리고 login페이지로 이동
        } catch (error: any) { //error에 타입스크립트 에러가 뜨는데 중요하지 않으므로 any로 지정
            console.log('error', error);
            setErrors(error.response.data || {}); //어떤 에러가 발생하는지
        }
    }


    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6'>
                <div className='w-10/12 mx-auto md:w-96'>
                    <h1 className='mb-2 text-lg font-medium'>회원가입</h1>
                    <form onSubmit={handleSubmit}>
                        <InputGroup //InputGroup.tsx로 props해서 input박스를 보여준다.(재사용가능성이 높아서)
                            placeholder='Email'
                            value={email}
                            setValue={setEmail}
                            error={errors.email} //error는 객체로 되어잇다 -> 이메일을 위한 에러문구, 패스워드를 위한 에러 문구 등등 이렇게 있다.
                        />
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
                            회원 가입
                        </button>
                    </form>
                    <small>
                        이미 가입하셨나요?
                        <Link href="/login">
                            <p className='ml-1 text-blue-500 uppercase'>로그인</p>
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    )
}

export default Register