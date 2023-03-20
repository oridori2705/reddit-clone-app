import axios from 'axios'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { useAuthState } from '../context/auth'
import { Post } from '../types'

interface PostCardProps {
    post: Post
    subMutate?: () => void
    mutate?: () => void
}
//Props해주는거 그냥 post,mutate,subMutate로 해줘도됨 그래서 post.~~ 이렇게하면됨
//근데  await axios.post("/votes", { identifier, slug, value }); 이런 부분은 []로 해줘야됨 ->  await axios.post("/votes", [ post.identifier, post.slug, value ]);
const PostCard = ({
    post: { 
        identifier,
        slug,
        title,
        body,
        subName,
        createdAt,
        voteScore,
        userVote,
        commentCount,
        url,
        username,
        sub
    },
    mutate,
    subMutate //커뮤니티sub의 useSWR을 가져옴
}: PostCardProps) => {
    const router = useRouter()
     //router.pathname을 이용해 아래에서 만약 현재 열려있는 페이지가 /r/[sub]으로 시작하지않는다면 다른 ui를 보여줌
    const isInSubPage = router.pathname === "/r/[sub]"

    const { authenticated } = useAuthState();

    //post리스트가 나열되어있는데 투표하려고하면
    const vote = async (value: number) => {
        if (!authenticated) router.push("/login"); 

        if (value === userVote) value = 0;
        //기존에 post상세페이지에서 post와 댓글 투표 기능을 똑같이 사용함 -> 어차피 같음
        try {
            await axios.post("/votes", { identifier, slug, value });
            //[sub].tsx에서 props로 useSWR가져옴 투표기능쓰면 바로바로 바꿔지도록
            if (mutate) mutate();
            if (subMutate) subMutate();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div
            className='flex mb-4 bg-white rounded'
            id={identifier}
        >
            {/* 좋아요 싫어요 기능 부분 - post상세페이지와 유사함*/}
            <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                {/* 좋아요 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(1)}
                >
                    {userVote === 1 ?
                        <FaArrowUp className="text-red-500" />
                        : <FaArrowUp />
                    }
                </div>
                <p className="text-xs font-bold">{voteScore}</p>
                {/* 싫어요 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                    onClick={() => vote(-1)}
                >
                    {userVote === -1 ?
                        <FaArrowDown className="text-blue-500" />
                        : <FaArrowDown />
                    }
                </div>
            </div>
            {/* 포스트 데이터 부분  isInSubPage는 메인페이지에서도 해당 PostCard를 사용하는데 커뮤니티상세페이지와는 다르게 보이도록하기위해*/}
            <div className="w-full p-2">
                <div className='flex items-center'>
                    {!isInSubPage && (
                        <div className='flex items-center'>
                            <Link href={`/r/${subName}`}>
                                <p>
                                    <Image
                                        src={sub!.imageUrl}
                                        alt="sub"
                                        className='rounded-full cursor-pointer'
                                        width={12}
                                        height={12}
                                    />
                                </p>
                            </Link>
                            <Link href={`/r/${subName}`}>
                                <span className="ml-2 text-xs font-bold cursor-pointer hover:underline">
                                    /r/{subName}
                                </span>
                            </Link>
                            <span className="mx-1 text-xs text-gray-400">•</span>
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Posted by
                        <Link href={`/u/${username}`}>
                            <span  className="mx-1 hover:underline">/u/{username}</span >
                        </Link>
                        <Link href={url}>
                            <span  className='mx-1 hover:underline'>
                                {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
                            </span >
                        </Link>
                    </p>
                </div>

                <Link href={url}>
                    <p className="my-1 text-lg font-bold">{title}</p>
                </Link>
                {body && <p className="my-1 text-sm">{body}</p>}
                <div className="flex">
                    <Link href={url}>
                        <p>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span>{commentCount}</span>
                        </p>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default PostCard