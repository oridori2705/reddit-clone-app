import axios from "axios";

import Link from "next/link"
import { useAuthDispatch, useAuthState } from "../context/auth"

const NavBar: React.FC = () => {
    const { loading, authenticated } = useAuthState(); //로그인버튼 회원가입 버튼 보이게할지 안할지
    //loading이 false일 때만
    
    const dispatch = useAuthDispatch();

    //로그아웃 함수
    const handleLogout = () => {
        axios.post("/auth/logout") //백엔드에 요청을 보내 cookie를 없애야한다.
            .then(() => { //결과값이오면 context의 state를 업데이트 해줘야한다.
                dispatch("LOGOUT");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
    }

    return (
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 bg-white h-13">
            <span className="text-2xl font-semibold text-gray-400">
                <Link href="/">
                    Community
                </Link>
            </span>
            <div className="max-w-full px-4">
                <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
                    <input
                        type="text"
                        placeholder="Search Reddit"
                        className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex">
                {!loading && (
                    authenticated ? (
                        <button
                            className="w-20 px-2 mr-2 text-sm text-center text-white bg-gray-400 rounded h-7"
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    ) : (<>
                        <Link href="/login">
                            <p className="w-20 px-2 pt-1 mr-2 text-sm text-center text-blue-500 border border-blue-500 rounded h-7">
                                로그인
                            </p>
                        </Link>
                        <Link href="/register">
                            <p className="w-20 px-2 pt-1 text-sm text-center text-white bg-gray-400 rounded h-7">
                                회원가입
                            </p>
                        </Link>
                    </>)
                )}
            </div>
        </div>
    )
}

export default NavBar