import React from 'react'
import cls from "classnames"; //classnames 모듈을 사용한다

interface InputGroupProps { //props로 들어오는 데이터들 타입 정의
    className?: string;
    type?: string;
    placeholder?: string;
    value: string;
    error: string | undefined;
    setValue: (str: string) => void;
}

const InputGroup =({ //리액트Functional Componets
    //기본적으로 주는 값들을 설정해줌. props가 안오는 값들은 아래값이 들어감(자바스크립트 문법)
    //props들을 가져온다.
    className = "mb-2", 
    type = "text",
    placeholder = "",
    error,
    value,
    setValue
}:InputGroupProps) => {
    return (
        <div className={className}>
            <input
                type={type}
                style={{ minWidth: 300 }}
                className={cls(`w-full p-3 transition duration-200 border border-gray-400 rounded bg-gray-50 focus:bg-white hover:bg-white`,
                    { "border-red-500": error } //error가 true면 border-red-500 스타일을 추가한다.
                )}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <small className='font-medium text-red-500'>{error} </small>
        </div>
    )
}


export default InputGroup