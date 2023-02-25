
import Link from 'next/link'
import React, { useState } from 'react'
import InputGroup from '../components/InputGroup'


//register가 앞의 글자 대문자가 아니면 useState가 오류가 난다.
const Register = () => {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({}); //error는 객체


    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6'>
                <div className='w-10/12 mx-auto md:w-96'>
                    <h1 className='mb-2 text-lg font-medium'>회원가입</h1>
                    <form>
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