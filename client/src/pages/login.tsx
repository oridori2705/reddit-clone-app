import InputGroup from '../components/InputGroup'
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import Link from 'next/link'

const login = () => {
    let router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});
    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6'>
                <div className='w-10/12 mx-auto md:w-96'>
                    <h1 className='mb-2 text-lg font-medium'>로그인</h1>
                    <form>
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