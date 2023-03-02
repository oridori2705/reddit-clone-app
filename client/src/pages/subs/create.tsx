import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import InputGroup from "../../components/InputGroup"



const SubCreate = () => {
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<any>({});
    
    let router = useRouter();

    //커뮤니티 생성
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            // /subs경로로 post 요청
            const res = await axios.post("/subs", { name, title, description })

            //커뮤니티 페이지 라우팅
            router.push(`/r/${res.data.name}`);
        } catch (error: any) {
            console.log(error);
            setErrors(error.response.data);
        }
    }

    return (
        <div className="flex flex-col justify-center pt-16">
            <div className="w-10/12 p-4 mx-auto bg-white rounded md:w-96">
                <h1 className="mb-2 text-lg font-medium">
                    커뮤니티 만들기
                </h1>
                <hr />
                <form onSubmit={handleSubmit}>
                    <div className="my-6">
                        <p className="font-medium">Name</p>
                        <p className="mb-2 text-xs text-gray-400">
                            커뮤니티 이름은 변경할 수 없습니다.
                        </p>
                        <InputGroup
                            placeholder="이름"
                            value={name}
                            setValue={setName}
                            error={errors.name}
                        />
                    </div>
                    <div className="my-6">
                        <p className="font-medium">Title</p>
                        <p className="mb-2 text-xs text-gray-400">
                            주제를 나타냅니다. 언제든지 변경할 수 있습니다.
                        </p>
                        <InputGroup
                            placeholder="제목"
                            value={title}
                            setValue={setTitle}
                            error={errors.title}
                        />
                    </div>
                    <div className="my-6">
                        <p className="font-medium">Description</p>
                        <p className="mb-2 text-xs text-gray-400">
                            해당 커뮤니티에 대한 설명입니다.
                        </p>
                        <InputGroup
                            placeholder="설명"
                            value={description}
                            setValue={setDescription}
                            error={errors.description}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="px-4 py-1 text-sm font-semibold text-white bg-gray-400 border rounded"
                        >
                            커뮤니티 만들기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubCreate;

//로그인이 안된사람이 커뮤니티 생성하는 페이지를 아예 접근할 수 없게
//getServerSideProps는 빌드와 상관없이, 매 페이지 요청마다 데이터를 서버로부터 가져옵니다.
//1. 먼저 커뮤니티 생성 페이지에 들어오면 아래를 수행한다.
//2. 쿠키가없으면 에러
//3. axios로 auth/me 수행 -> auth/me 가면 user미들웨어, auth미들웨어를 수행한다.
//4.axios.get에서 넘겨주었던 쿠키를 이용해 user미들웨어에서 유저정보를 검증한다(해당 유저가 있는지 없는지)
//5. user미들웨어 인증이 끝나면 인증이 끝난 유저정보를 auth미들웨어에서 저장된 유저정보를 검증한다(관리자인지 뭐 그런거)
//6. auth미들웨어 인증이 끝나면 me 핸들러로 가서 모든 인증이 끝난 유저정보를 클라이언트에 보내준다.
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie;
        // 쿠키가 없다면 에러를 보내기
        if (!cookie) throw new Error("Missing auth token cookie");

        // 쿠키가 있다면 그 쿠키를 이용해서 백엔드에서 인증 처리하기 (subs)
        //axios.get 데이터 조회
        //{ headers: { cookie } } 
        await axios.get("/auth/me",
            { headers: { cookie } })//헤더에 쿠키를 넣어서 요청을 보냄(user.ts랑 auth.ts 때문에)

        return { props: {} }

    } catch (error) {
        // 백엔드에서 요청에서 던져준 쿠키를 이용해 인증 처리할 때 에러가 나면 /login 페이지로 이동
        //307에러 : 임시적으로 url을 옮겨줌
        res.writeHead(307, { Location: "/login" }).end()
        return { props: {} };
    }
}