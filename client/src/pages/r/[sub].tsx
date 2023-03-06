import axios from 'axios'
import Image from 'next/image';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
// import PostCard from '../../components/PostCard';
// import SideBar from '../../components/SideBar';
import { useAuthState } from '../../context/auth';
// import { Post } from '../../types';

const SubPage = () => {
    const [ownSub, setOwnSub] = useState(false);//현재 사용자가 커뮤니티 주인인지 확인하기위해
    const { authenticated, user } = useAuthState();// 현재 사용자의 정보와 로그인이 되어 있는지의 정보를 가져옴

    const fileInputRef = useRef<HTMLInputElement>(null); // useRef 사용을 위해 변수 선언
    
    
    const fetcher = async(url: string)=>{
        try {
            const res = await axios.get(url);
            return res.data;
            
        } catch (error) {
            console.log(error);
        }
       
    }
    const router = useRouter();
    const subName = router.query.sub; //요청을 불러올 주소를 현재 라우터를 통해 저장,sub은 현재 url 이름, 만약 커뮤니티 이름이 test2면 test2를 가져옴
    const { data: sub, error} = useSWR(subName ? `/subs/${subName}` : null,fetcher); //useSWR을 통해 서버에 데이터 요청
    
    //
    useEffect(() => {
        if (!sub || !user) return; //sub과 user가 없는 경우에는 못들어옴 -> sub이 없으면 만든 사람 정보를 못가져옴 user또한 마찬가지 -> context에서 user를 User || undefined 유니언state로 했기 때문에 !user를 해줘야한다.
        setOwnSub(authenticated && user.username === sub.username); // 로그인이 되어있고 && 현재  사용자와 커뮤니티 주인이 같으면 OwnSun true 설정
    }, [sub]) //sub이 바뀔때마다

    console.log('sub', sub);


    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) return;// 파일이 null이면 진행하지 못하게

        const file = event.target.files[0];//
        console.log('file', file);

        //파일은 백엔드에 보내기전에 FormData에 넣어줘야한다.
        const formData = new FormData();
        formData.append("file", file);//file 넣어주고
        formData.append("type", fileInputRef.current!.name);//상단배너인지 아이콘 배너인지의 정보를 넣어준다.

        try {
            //백엔드에 요청을 보낸다.
            await axios.post(`/subs/${sub.name}/upload`, formData, {
                headers: { "Context-Type": "multipart/form-data" } //헤더에는 "Context-Type": "multipart/form-data" 이렇게 해야 파일을 보내줄 수 있다.
            });
        } catch (error) {
            console.log(error);
        }
    }


    const openFileInput = (type: string) => {
        if(!ownSub) return; //만약 현재 사용자가 커뮤니티 주인이 아닐 경우 업로드 못하도록 함
        const fileInput = fileInputRef.current; //input엘리먼트 지정
        if (fileInput) { //방어코드-> file이 있는 경우
            fileInput.name = type; //상단 배너를 클릭했는지 아이콘배너를 클릭했는지 구분
            fileInput.click(); //ref로 지정된 input태그가 클릭된다.
        }
    }

    // let renderPosts;
    // if (!sub) {
    //     renderPosts = <p className="text-lg text-center">로딩중...</p>
    // } else if (sub.posts.length === 0) {
    //     renderPosts = <p className="text-lg text-center">아직 작성된 포스트가 없습니다.</p>
    // } else {
    //     renderPosts = sub.posts.map((post: Post) => (
    //         <PostCard key={post.identifier} post={post} subMutate={mutate} />
    //     ))
    // }
    // console.log('sub.imageUrl', sub?.imageUrl)
    return (
        <>
            {sub &&
                <>
                    <div>
                        {/*업로드하기위해 inout태그 타입 파일인 엘리먼트 생성후 ref 지정, onChange로 uploadImgae함수 호출 */}
                        <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage} />
                        {/* 배너 이미지 */}
                        <div className="bg-gray-400">
                            {sub.bannerUrl ? (
                                <div
                                    className='h-56'
                                    style={{
                                        backgroundImage: `url(${sub.bannerUrl})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    onClick={() => openFileInput("banner")}
                                >
                                </div>
                            ) : (
                                <div className='h-20 bg-gray-400'
                                    onClick={() => openFileInput("banner")}
                                ></div>
                            )}
                        </div>
                        {/* 커뮤니티 메타 데이터 */}
                        <div className='h-20 bg-white'>
                            <div className='relative flex max-w-5xl px-5 mx-auto'>
                                <div className='absolute' style={{ top: -15 }}>
                                    {sub.imageUrl && (
                                        <Image
                                            src={sub.imageUrl}
                                            alt="커뮤니티 이미지"
                                            width={70}
                                            height={70}
                                            className="rounded-full"
                                            onClick={() => openFileInput("image")}
                                        />
                                    )}
                                </div>
                                <div className='pt-1 pl-24'>
                                    <div className='flex items-center'>
                                        <h1 className='text-3xl font-bold '>{sub.title}</h1>
                                    </div>
                                    <p className='font-bold text-gray-400 text-small'>
                                        /r/{sub.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 포스트와 사이드바 */}
                    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
                        
                    </div>
                </>
            }
        </>
    )
}

export default SubPage